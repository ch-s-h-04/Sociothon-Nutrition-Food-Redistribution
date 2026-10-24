import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllDistrictSummaries,
  getDistrictById,
  optimizeFortification,
  generateCulturallyAwareMealPlan,
  getCulturalGroups,
  calculateDistrictOverallRisk,
  getRiskLevel
} from '../server/services/nutritionService.ts';

test('Nutrition: getRiskLevel categorizes percentages properly', () => {
  assert.equal(getRiskLevel(70), 'critical');
  assert.equal(getRiskLevel(55), 'high');
  assert.equal(getRiskLevel(40), 'moderate');
  assert.equal(getRiskLevel(25), 'low');
});

test('Nutrition: getAllDistrictSummaries returns verified NFHS-5 factsheet districts', () => {
  const districts = getAllDistrictSummaries();
  assert.ok(districts.length >= 10, 'Expected at least 10 aspirational districts');
  assert.equal(districts[0].rank, 1, 'Top ranked district should be rank 1');
  assert.ok(districts[0].stunting_pct > 0, 'Stunting percentage should be present');
  assert.ok(districts[0].anemia_children_pct > 0, 'Child anemia percentage should be present');
  assert.equal(districts[0].data_type, 'verified_historical_factsheet');
});

test('Nutrition: getDistrictById returns full micronutrient profile and provenance', () => {
  const nandurbar = getDistrictById('nandurbar');
  assert.ok(nandurbar, 'Nandurbar district must exist');
  assert.equal(nandurbar.district_name, 'Nandurbar');
  assert.equal(nandurbar.state, 'Maharashtra');
  assert.ok(nandurbar.micronutrients.iron, 'Iron deficiency profile must exist');
  assert.ok(nandurbar.micronutrients.iron.causes.length > 0, 'Primary causes should be listed');
  assert.ok(nandurbar.data_provenance.source.includes('NFHS-5'), 'Data provenance must credit NFHS-5');
});

test('Nutrition: optimizeFortification calculates cost-effective food vehicle allocation', () => {
  const plan = optimizeFortification('nandurbar');
  assert.ok(plan, 'Fortification plan should be generated');
  assert.ok(plan.total_quarterly_budget_lakhs > 0, 'Quarterly budget must be calculated');
  assert.ok(plan.selected_vehicles.length > 0, 'At least one vehicle should be selected');
  assert.ok(plan.projected_outcomes.iron, 'Projected reduction for iron should exist');
  assert.ok(plan.projected_outcomes.iron.projected_reduction_pct > 0, 'Reduction percentage should be positive');
});

test('Nutrition: generateCulturallyAwareMealPlan respects cultural dietary constraints', () => {
  const plan = generateCulturallyAwareMealPlan({
    district: 'nandurbar',
    cultural_group: 'tribal_hindu',
    season: 'monsoon'
  });
  assert.ok(plan, 'Meal plan generated');
  assert.equal(plan.weekly_schedule.length, 7, 'Should produce 7-day schedule');
  assert.ok(plan.estimated_weekly_cost_inr > 0, 'Weekly budget should be computed');
  assert.ok(plan.bioavailability_notes.length > 0, 'Bioavailability science rules should be present');
});
