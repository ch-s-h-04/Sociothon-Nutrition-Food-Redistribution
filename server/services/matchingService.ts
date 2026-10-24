import { store } from '../db/store.ts';
import type { SurplusEvent, RecipientNGO, FleetVehicle, MatchingResult, MatchCandidate } from '../types/index.ts';
import { getDistrictById, getAllDistrictSummaries } from './nutritionService.ts';

// Haversine distance in kilometers
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function estimateTravelTimeMinutes(distanceKm: number): number {
  // Road network winding factor 1.35x + average urban speed 24 km/h + 6 min setup
  const roadDistance = distanceKm * 1.35;
  const transitTime = (roadDistance / 24) * 60;
  return Math.ceil(transitTime + 6);
}

export function getMinutesUntil(targetIsoDate: string, fromDateIso?: string): number {
  const from = fromDateIso ? new Date(fromDateIso) : new Date();
  const to = new Date(targetIsoDate);
  return (to.getTime() - from.getTime()) / 60000;
}

export function evaluateNutritionSynergy(foodType: string, districtProfile: any): { score: number; note: string } {
  if (!districtProfile) {
    return { score: 7, note: 'Standard nutrition support (regional data baseline)' };
  }

  const ironRisk = districtProfile.micronutrients?.iron?.risk_pct || 0;
  const vitARisk = districtProfile.micronutrients?.vitamin_a?.risk_pct || 0;
  const stunting = districtProfile.district_context?.stunting_pct || 0;

  if (foodType === 'cooked meals' || foodType === 'mixed meals') {
    if (ironRisk >= 60 || stunting >= 50) {
      return {
        score: 15,
        note: `Optimal synergy: Cooked meals address critical stunting (${stunting}%) and iron deficiency (${ironRisk}%) in ${districtProfile.district_name}.`
      };
    }
    return { score: 12, note: `High protein and caloric value for local beneficiaries.` };
  }

  if (foodType === 'vegetables') {
    if (vitARisk >= 50) {
      return {
        score: 15,
        note: `High micronutrient value: Fresh produce mitigates severe Vitamin A deficiency (${vitARisk}%) in ${districtProfile.district_name}.`
      };
    }
    return { score: 11, note: `Valuable source of protective micronutrients.` };
  }

  if (foodType === 'rice' || foodType === 'bread') {
    return { score: 10, note: `Essential caloric foundation; complements local PDS grains.` };
  }

  return { score: 8, note: `Supplemental nourishment for recipient community.` };
}

export function findNGORecommendations(surplusEventId: string, currentTimeIso?: string): MatchingResult {
  const event = store.getSurplusById(surplusEventId);
  if (!event) {
    throw new Error(`Surplus event ${surplusEventId} not found`);
  }

  const ngos = store.getNGOs();
  const vehicles = store.getVehicles();
  const now = currentTimeIso || new Date().toISOString();
  const minutesUntilExpiry = getMinutesUntil(event.expiry_at, now);

  const candidates: MatchCandidate[] = ngos.map(ngo => {
    const distanceKm = calculateHaversineDistanceKm(event.latitude, event.longitude, ngo.latitude, ngo.longitude);
    const etaMinutes = estimateTravelTimeMinutes(distanceKm);
    const vehicle = vehicles.find(v => v.ngo_id === ngo.id && v.status === 'available') || null;

    // Hard constraints checking
    const isActive = ngo.active === true;
    const isDietaryCompatible = ngo.accepted_dietary_types.includes(event.dietary_type);
    const isFoodTypeAccepted = ngo.accepted_food_types.includes(event.food_type);
    const hasCapacity = ngo.current_capacity_meals >= event.quantity_meals;
    const isWithinRadius = distanceKm <= ngo.service_radius_km;
    const hasStorage = !event.storage_requirement || event.storage_requirement === 'ambient' || ngo.storage_capabilities.includes(event.storage_requirement);
    const arrivesBeforeExpiry = etaMinutes < minutesUntilExpiry;

    const feasible = isActive && isDietaryCompatible && isFoodTypeAccepted && hasCapacity && isWithinRadius && hasStorage && arrivesBeforeExpiry;

    // Nutrition intelligence lookup for recipient district
    const districtProfile = getDistrictById(ngo.district) || getDistrictById(event.pickup_district);
    const districtSummary = districtProfile || {
      district_name: ngo.district,
      overall_level: 'moderate',
      overall_risk: 42,
      micronutrients: { iron: { risk_pct: 45 }, vitamin_a: { risk_pct: 38 } }
    };

    // Soft scoring components (Total max 100 points)
    // 1. Geographic Nutrition Vulnerability (25 pts)
    let nutritionVulnerabilityScore = 10;
    const isCriticalCrisis = (districtProfile?.district_context?.stunting_pct >= 50) ||
                             (districtProfile?.district_context?.anemia_children_pct >= 60) ||
                             (districtProfile?.overall_level === 'critical');
    const isHighCrisis = (districtProfile?.district_context?.stunting_pct >= 40) ||
                         (districtProfile?.district_context?.anemia_children_pct >= 50) ||
                         (districtProfile?.overall_level === 'high');

    if (isCriticalCrisis) nutritionVulnerabilityScore = 25;
    else if (isHighCrisis) nutritionVulnerabilityScore = 18;
    else if (districtProfile?.overall_level === 'moderate') nutritionVulnerabilityScore = 12;

    // 2. Nutrient-to-Deficiency Synergy (15 pts)
    const synergy = evaluateNutritionSynergy(event.food_type, districtProfile);
    const nutrientSynergyScore = synergy.score;

    // 3. Distance & Travel Time Efficiency (20 pts)
    const distanceEfficiencyScore = Math.max(0, Number((20 * (1 - Math.min(distanceKm, 20) / 20)).toFixed(1)));

    // 4. Capacity Match & Demand (15 pts)
    const capacityRatio = Math.min(1, ngo.current_capacity_meals / (event.quantity_meals * 1.35));
    const capacityMatchScore = Number((15 * capacityRatio).toFixed(1));

    // 5. NGO Historical Reliability (15 pts)
    const ngoReliabilityScore = Number((15 * (ngo.reliability_score / 100)).toFixed(1));

    // 6. Safe-Consumption Urgency Boost (10 pts)
    const urgencyRatio = Math.max(0, Math.min(1, 1 - minutesUntilExpiry / 180));
    const urgencyBoostScore = Number((10 * urgencyRatio).toFixed(1));

    const totalScore = feasible
      ? Number((nutritionVulnerabilityScore + nutrientSynergyScore + distanceEfficiencyScore + capacityMatchScore + ngoReliabilityScore + urgencyBoostScore).toFixed(1))
      : 0;

    // Rationale construction
    const failingReasons: string[] = [];
    if (!isActive) failingReasons.push('NGO currently inactive');
    if (!isDietaryCompatible) failingReasons.push(`Dietary mismatch (${event.dietary_type} not in accepted: ${ngo.accepted_dietary_types.join(', ')})`);
    if (!isFoodTypeAccepted) failingReasons.push(`Food category not accepted (${event.food_type})`);
    if (!hasCapacity) failingReasons.push(`Capacity deficit (${ngo.current_capacity_meals} meals available < ${event.quantity_meals} needed)`);
    if (!isWithinRadius) failingReasons.push(`Service radius exceeded (${distanceKm} km > ${ngo.service_radius_km} km max)`);
    if (!hasStorage) failingReasons.push(`Lacks required storage capability (${event.storage_requirement})`);
    if (!arrivesBeforeExpiry) failingReasons.push(`ETA (${etaMinutes} min) exceeds safe deadline (${Math.round(minutesUntilExpiry)} min remaining)`);

    const reason = feasible
      ? `Feasible: High priority match. ${distanceKm} km away; +${nutritionVulnerabilityScore}pts ${districtSummary.district_name} nutrition vulnerability; +${nutrientSynergyScore}pts dietary synergy; storage verified.`
      : `Infeasible: ${failingReasons.join('; ')}`;

    const criticalDeficiencies: string[] = [];
    if (districtProfile?.micronutrients) {
      for (const [k, v] of Object.entries(districtProfile.micronutrients)) {
        if ((v as any).risk_pct >= 55) {
          criticalDeficiencies.push(`${k.toUpperCase()} (${(v as any).risk_pct}%)`);
        }
      }
    }

    return {
      ngo,
      distance_km: distanceKm,
      eta_minutes: etaMinutes,
      feasible,
      score: totalScore,
      reason,
      vehicle,
      score_breakdown: {
        nutrition_vulnerability_score: nutritionVulnerabilityScore,
        nutrient_synergy_score: nutrientSynergyScore,
        distance_efficiency_score: distanceEfficiencyScore,
        capacity_match_score: capacityMatchScore,
        ngo_reliability_score: ngoReliabilityScore,
        urgency_boost_score: urgencyBoostScore
      },
      nutrition_insights: {
        district_name: districtSummary.district_name || ngo.district,
        overall_risk_level: districtSummary.overall_level || 'moderate',
        critical_deficiencies: criticalDeficiencies,
        food_synergy_note: synergy.note
      }
    };
  }).sort((a, b) => b.score - a.score);

  const recommended = candidates.find(c => c.feasible) || null;
  const urgency = minutesUntilExpiry < 60 ? 'High' : minutesUntilExpiry < 120 ? 'Medium' : 'Normal';

  return {
    surplus_event_id: surplusEventId,
    urgency,
    recommended,
    candidates,
    summary: recommended
      ? `Top Recommended Recipient: ${recommended.ngo.name} (Score: ${recommended.score}/100, ETA: ${recommended.eta_minutes} mins, Nutrition Priority: ${recommended.nutrition_insights.overall_risk_level})`
      : 'No feasible recipient found satisfying all constraints (distance, capacity, storage, and deadline).'
  };
}
