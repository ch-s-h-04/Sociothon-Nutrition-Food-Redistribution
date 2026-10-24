import { store } from '../db/store.ts';
import type { ProviderLeaderboardEntry, RestaurantDonor } from '../types/index.ts';

const round = (value: number) => Math.round(value * 10) / 10;

function badgeFor(score: number): ProviderLeaderboardEntry['badge'] {
  if (score >= 90) return 'Gold';
  if (score >= 80) return 'Silver';
  if (score >= 70) return 'Bronze';
  return 'Verified';
}

/**
 * Scores provider trust from operational quality rather than food volume.
 *
 * - 40% reliability: provider's established punctuality / cancellation record
 * - 25% safety: average confidence for food logged by the provider
 * - 25% handover: share of resolved collections that reached an NGO safely
 * - 10% verification: capped evidence of completed handovers (not meal volume)
 */
function scoreProvider(provider: RestaurantDonor): Omit<ProviderLeaderboardEntry, 'rank'> {
  const surplus = store.getSurplusEvents().filter(event => event.restaurant_id === provider.id);
  const deliveries = store.getDeliveries().filter(delivery => delivery.donor_id === provider.id);
  const resolved = deliveries.filter(delivery =>
    ['delivered', 'diverted_to_compost', 'disposed', 'cancelled'].includes(delivery.status)
  );
  const delivered = deliveries.filter(delivery => delivery.status === 'delivered');

  const reliabilityScore = provider.reliability_score;
  const safetyScore = surplus.length
    ? round(surplus.reduce((sum, event) => sum + event.confidence, 0) / surplus.length)
    : reliabilityScore;
  // A new provider is neutral until a collection outcome is independently verified.
  const handoverScore = resolved.length
    ? round((delivered.length / resolved.length) * 100)
    : 75;
  const verificationScore = Math.min(100, delivered.length * 25);
  const trustScore = round(
    reliabilityScore * 0.4 +
    safetyScore * 0.25 +
    handoverScore * 0.25 +
    verificationScore * 0.1
  );

  return {
    provider_id: provider.id,
    provider_name: provider.name,
    provider_type: provider.type,
    district: provider.district,
    state: provider.state,
    trust_score: trustScore,
    badge: badgeFor(trustScore),
    reliability_score: reliabilityScore,
    safety_score: safetyScore,
    handover_score: handoverScore,
    verification_score: verificationScore,
    verified_handovers: delivered.length,
    meals_redistributed: delivered.reduce((sum, delivery) => sum + delivery.quantity_meals, 0)
  };
}

export function getProviderLeaderboard(): ProviderLeaderboardEntry[] {
  return store.getRestaurants()
    .filter(provider => provider.active)
    .map(scoreProvider)
    .sort((a, b) => b.trust_score - a.trust_score || b.verified_handovers - a.verified_handovers || a.provider_name.localeCompare(b.provider_name))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export const PROVIDER_TRUST_METHOD = {
  reliability: 40,
  safety: 25,
  handover: 25,
  verification: 10,
  principle: 'Food volume does not affect a provider\'s trust score.'
};
