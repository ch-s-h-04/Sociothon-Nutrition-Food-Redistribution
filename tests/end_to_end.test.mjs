import test from 'node:test';
import assert from 'node:assert/strict';
import { store } from '../server/db/store.ts';
import { getDistrictById, getAllDistrictSummaries } from '../server/services/nutritionService.ts';
import { createSurplusListing, getSurplusListingById } from '../server/services/surplusService.ts';
import { findNGORecommendations } from '../server/services/matchingService.ts';
import { assignDonationToNGO, updateDeliveryStatus, getAllDeliveries } from '../server/services/deliveryService.ts';
import { optimizeFleetRoutes } from '../server/services/routingService.ts';
import { getPlatformImpactMetrics } from '../server/services/impactService.ts';

test('End-to-End Workflow: Nutrition Data -> Risk Prioritization -> Surplus Registration -> Smart Matching -> Route Planning -> Delivery -> Impact Reflection', () => {
  store.reset();

  // STEP 1: Nutrition Data & Geographic Prioritization
  const districtSummaries = getAllDistrictSummaries();
  assert.ok(districtSummaries.length >= 10, 'Districts available');
  
  // Find highest risk district
  const targetDistrictSummary = districtSummaries.find(d => d.name === 'Nandurbar');
  assert.ok(targetDistrictSummary, 'Nandurbar district identified');
  assert.equal(targetDistrictSummary.state, 'Maharashtra');

  const districtProfile = getDistrictById('nandurbar');
  assert.ok(districtProfile, 'District detail profile retrieved');
  assert.ok(districtProfile.district_context.anemia_children_pct > 60, 'High child anemia identified in target district');

  // STEP 2: Food Surplus Registration
  const now = Date.now();
  const surplus = createSurplusListing({
    donor_name: 'Satpura Tribal Agro Canteen',
    pickup_address: 'Main Bazaar Road, Shahada',
    pickup_district: 'Nandurbar',
    pickup_state: 'Maharashtra',
    latitude: 21.3667,
    longitude: 74.2333,
    food_type: 'cooked meals',
    dietary_type: 'vegetarian',
    quantity_meals: 75,
    storage_requirement: 'hot_holding',
    available_at: new Date(now).toISOString(),
    expiry_at: new Date(now + 150 * 60000).toISOString(),
    contact_name: 'Anil Vasave',
    contact_phone: '+91 94222 99881',
    notes: 'Hot khichdi and leafy greens with fortified oil.'
  });

  assert.ok(surplus.id, 'Surplus listing registered');
  assert.equal(surplus.status, 'available');
  assert.equal(surplus.quantity_meals, 75);
  assert.equal(surplus.food_weight_kg, 28.5);

  // STEP 3: Nutrition-Aware NGO Matching
  const matchResult = findNGORecommendations(surplus.id);
  assert.ok(matchResult.recommended, 'Recommended recipient found');
  const recommendedNgo = matchResult.recommended;

  // Verify explainability and nutrition prioritization factors
  assert.equal(recommendedNgo.feasible, true, 'Recommendation must be strictly feasible');
  assert.equal(recommendedNgo.ngo.district, 'Nandurbar', 'Matched local recipient');
  assert.equal(recommendedNgo.score_breakdown.nutrition_vulnerability_score, 25, 'Received full 25pts for critical nutrition risk');
  assert.ok(recommendedNgo.score_breakdown.nutrient_synergy_score >= 12, 'Received dietary synergy bonus');
  assert.ok(recommendedNgo.reason.includes('Feasible'), 'Contains explainable rationale');

  // STEP 4: Assignment & Route Dispatch
  const delivery = assignDonationToNGO({
    surplus_id: surplus.id,
    ngo_id: recommendedNgo.ngo.id,
    vehicle_id: recommendedNgo.vehicle?.id
  });

  assert.ok(delivery.id, 'Delivery created');
  assert.equal(delivery.status, 'assigned');
  assert.equal(delivery.quantity_meals, 75);
  assert.ok(delivery.estimated_distance_km > 0);
  assert.ok(delivery.estimated_time_minutes > 0);

  // Verify surplus status transitioned
  const updatedSurplus = getSurplusListingById(surplus.id);
  assert.equal(updatedSurplus?.status, 'assigned');

  // STEP 5: Fleet Route Optimization Check
  const routePlan = optimizeFleetRoutes();
  assert.ok(routePlan.routes.length > 0, 'Routes generated');
  assert.equal(routePlan.routing_engine, 'deterministic_nearest_expiry_first_with_road_circuity');

  // STEP 6: Delivery Lifecycle Tracking (assigned -> in_transit -> delivered)
  const inTransit = updateDeliveryStatus(delivery.id, 'in_transit');
  assert.equal(inTransit.status, 'in_transit');
  assert.ok(inTransit.dispatched_at, 'Dispatch timestamp recorded');

  const delivered = updateDeliveryStatus(delivery.id, 'delivered');
  assert.equal(delivered.status, 'delivered');
  assert.ok(delivered.delivered_at, 'Delivery timestamp recorded');

  // STEP 7: Impact Dashboard Reflection
  const impact = getPlatformImpactMetrics();
  assert.ok(impact.operational_impact.completed_deliveries >= 1, 'Completed delivery reflected in impact');
  assert.ok(impact.operational_impact.total_meals_delivered >= 75, 'Delivered meals counted');
  assert.ok(impact.operational_impact.total_food_weight_kg_rescued >= 28.5, 'Rescued kg counted');
  assert.ok(impact.operational_impact.environmental_offsets.co2_emissions_averted_kg > 0, 'CO2 emissions saved');
  assert.ok(impact.operational_impact.environmental_offsets.water_footprint_saved_liters > 0, 'Water footprint saved');
  assert.ok(impact.macro_context_india.live_waste_tracker.estimated_india_waste_kg_current_year > 0, 'Live waste counter active');
});

test('Sociothon 2026: Multi-Pathway Recovery, Composting Diversion & Food Safety Guard', () => {
  store.reset();

  const now = Date.now();

  // 1. Create a batch that has expired (safe consumption window passed)
  const expiredSurplus = createSurplusListing({
    donor_name: 'IIT Dining Hall Canteen',
    pickup_address: 'Central Campus Mess',
    pickup_district: 'Nandurbar',
    pickup_state: 'Maharashtra',
    latitude: 21.37,
    longitude: 74.24,
    food_type: 'cooked meals',
    dietary_type: 'vegetarian',
    quantity_meals: 100, // 38 kg
    storage_requirement: 'ambient',
    available_at: new Date(now - 7200000).toISOString(),
    expiry_at: new Date(now - 1800000).toISOString(), // expired 30 mins ago
    contact_name: 'Mess Supervisor',
    contact_phone: '+91 98888 12345',
    notes: 'Leftover rice and vegetable stew.'
  });

  assert.equal(expiredSurplus.food_weight_kg, 38);

  // Assign to NGO
  const ngos = store.getNGOs();
  const delivery = assignDonationToNGO({
    surplus_id: expiredSurplus.id,
    ngo_id: ngos[0].id
  });

  updateDeliveryStatus(delivery.id, 'in_transit');

  // Verify FOOD SAFETY ENFORCEMENT: Cannot deliver expired food for human consumption
  assert.throws(
    () => updateDeliveryStatus(delivery.id, 'delivered'),
    /Food Safety Violation.*cannot be redistributed for human consumption/
  );

  // Safe Multi-Pathway Diversion: Divert batch to aerobic bio-composting
  const compostedDelivery = updateDeliveryStatus(
    delivery.id, 
    'diverted_to_compost', 
    'composting_resource_recovery', 
    'Diverted to organic farm bio-composter.'
  );

  assert.equal(compostedDelivery.status, 'diverted_to_compost');
  assert.equal(compostedDelivery.recovery_pathway, 'composting_resource_recovery');
  assert.ok(compostedDelivery.environmental_impact.compost_generated_kg > 0, 'Compost soil yield recorded');
  assert.equal(compostedDelivery.environmental_impact.compost_generated_kg, 9.5); // 38 kg * 0.25 = 9.5 kg
  assert.equal(compostedDelivery.environmental_impact.co2_avoided_kg, 32.3); // 38 kg * 0.85 = 32.3 kg CO2e avoided methane

  // Verify impact calculation reflects composting
  const impact = getPlatformImpactMetrics();
  assert.equal(impact.operational_impact.diverted_to_compost_count, 1);
  assert.equal(impact.operational_impact.composted_kg, 38);
  assert.equal(impact.operational_impact.compost_yield_kg, 9.5);
  assert.ok(impact.operational_impact.recovery_rate_pct > 0, 'Recovery rate calculated');
});
