import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineDistanceKm,
  estimateTravelTimeMinutes,
  findNGORecommendations,
  evaluateNutritionSynergy
} from '../server/services/matchingService.ts';
import { store } from '../server/db/store.ts';

test('Matching: Haversine distance is non-negative and symmetric', () => {
  const dSelf = calculateHaversineDistanceKm(12.9716, 77.5946, 12.9716, 77.5946);
  assert.equal(dSelf, 0);

  const d1 = calculateHaversineDistanceKm(12.9716, 77.5946, 13.0358, 77.5970);
  const d2 = calculateHaversineDistanceKm(13.0358, 77.5970, 12.9716, 77.5946);
  assert.ok(Math.abs(d1 - d2) < 0.01, 'Distance should be symmetric');
  assert.ok(d1 > 6.0 && d1 < 8.0, 'Bengaluru points distance should be ~7.1 km');
});

test('Matching: Travel time calculation incorporates road factor and speed model', () => {
  const straightKm = 10;
  const eta = estimateTravelTimeMinutes(straightKm);
  // (10 * 1.35 / 24) * 60 + 6 = 33.75 + 6 = 40 mins
  assert.ok(eta >= 38 && eta <= 42, `Expected ETA around 40 mins, got ${eta}`);
});

test('Matching: evaluateNutritionSynergy boosts iron/protein foods for vulnerable districts', () => {
  const mockHighIronDistrict = {
    district_name: 'Nandurbar',
    overall_level: 'critical',
    micronutrients: { iron: { risk_pct: 79 } },
    district_context: { stunting_pct: 60 }
  };

  const synergy = evaluateNutritionSynergy('cooked meals', mockHighIronDistrict);
  assert.equal(synergy.score, 15, 'Cooked meals should get maximum synergy in high-stunting/anemic district');
  assert.ok(synergy.note.includes('stunting'));
});

test('Matching: findNGORecommendations enforces constraints and ranks top recipient', () => {
  store.reset();
  const surplusEvents = store.getSurplusEvents();
  const firstEvent = surplusEvents[0]; // Nandurbar cooked meals (S-01)

  const result = findNGORecommendations(firstEvent.id);
  assert.ok(result, 'Result must be returned');
  assert.ok(result.candidates.length > 0, 'Candidate NGOs should be evaluated');
  assert.ok(result.recommended, 'A feasible recommended recipient should be found');

  const topMatch = result.recommended;
  assert.equal(topMatch.feasible, true, 'Top match must be feasible');
  assert.ok(topMatch.score > 70, `Expected strong score, got ${topMatch.score}`);
  assert.ok(topMatch.score_breakdown.nutrition_vulnerability_score >= 10, 'Should include nutrition vulnerability score');
  assert.ok(topMatch.nutrition_insights.food_synergy_note, 'Food synergy note should be populated');
});
