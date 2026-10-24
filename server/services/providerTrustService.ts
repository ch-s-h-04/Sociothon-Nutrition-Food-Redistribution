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
 * - 30% reliability: provider's established punctuality / cancellation record
 * - 30% NGO rating: post-handover ratings from recipient NGOs
 * - 20% safety: average confidence for food logged by the provider
 * - 15% handover: share of resolved collections that reached an NGO safely
 * - 5% verification: capped evidence of completed handovers (not meal volume)
 */
function scoreProvider(provider: RestaurantDonor): Omit<ProviderLeaderboardEntry, 'rank'> {
  const surplus = store.getSurplusEvents().filter(event => event.restaurant_id === provider.id);
  const deliveries = store.getDeliveries().filter(delivery => delivery.donor_id === provider.id);
  const resolved = deliveries.filter(delivery =>
    ['delivered', 'diverted_to_compost', 'disposed', 'cancelled'].includes(delivery.status)
  );
  const delivered = deliveries.filter(delivery => delivery.status === 'delivered');
  const ratings = store.getProviderRatings().filter(rating => rating.provider_id === provider.id);

  const reliabilityScore = provider.reliability_score;
  const safetyScore = surplus.length
    ? round(surplus.reduce((sum, event) => sum + event.confidence, 0) / surplus.length)
    : reliabilityScore;
  // A new provider is neutral until a collection outcome is independently verified.
  const handoverScore = resolved.length
    ? round((delivered.length / resolved.length) * 100)
    : 75;
  const verificationScore = Math.min(100, delivered.length * 25);
  const ngoRating = ratings.length
    ? round(ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length)
    : null;
  // Providers begin from a neutral review score until an NGO completes a verified handover rating.
  const ngoRatingScore = ngoRating === null ? 75 : ngoRating * 20;
  const trustScore = round(
    reliabilityScore * 0.3 +
    ngoRatingScore * 0.3 +
    safetyScore * 0.2 +
    handoverScore * 0.15 +
    verificationScore * 0.05
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
    ngo_rating: ngoRating,
    ngo_rating_count: ratings.length,
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
  reliability: 30,
  ngo_rating: 30,
  safety: 20,
  handover: 15,
  verification: 5,
  principle: 'Food volume does not affect a provider\'s trust score.'
};
