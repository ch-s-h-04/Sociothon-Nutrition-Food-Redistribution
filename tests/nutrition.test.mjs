import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllDistrictSummaries,
  getDistrictById,
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

