import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UNEP_2024_INDIA_HOUSEHOLD_WASTE_TONNES_PER_YEAR,
  KG_PER_METRIC_TONNE,
  SECONDS_PER_YEAR,
  UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_YEAR,
  UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND,
  UNEP_REPORT_CITATION,
  calculateDeterministicModelledWasteKg
} from '../src/utils/unepWasteEstimate.ts';
import { getPlatformImpactMetrics } from '../server/services/impactService.ts';

test('UNEP 2024 Household Food Waste: Constants and Mathematical Derivation', () => {
  // 1. Verify exact source figures from UNEP Food Waste Index Report 2024
  assert.equal(UNEP_2024_INDIA_HOUSEHOLD_WASTE_TONNES_PER_YEAR, 78192338, 'Annual baseline is exactly 78,192,338 tonnes/year');
  assert.equal(KG_PER_METRIC_TONNE, 1000, 'Conversion factor is 1,000 kg per metric tonne');
  assert.equal(UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_YEAR, 78192338000, 'Baseline in kg is 78,192,338,000 kg/year');

  // 2. Verify seconds per year
  assert.equal(SECONDS_PER_YEAR, 365 * 24 * 60 * 60, 'Seconds per year is 31,536,000');

  // 3. Verify mathematically derived kg per second rate
  const expectedRate = 78192338000 / 31536000;
  assert.equal(UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND, expectedRate, 'Rate is derived directly without rounded hardcoding');
  assert.ok(Math.abs(UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND - 2479.4628) < 0.001, 'Derived rate is ~2,479.46 kg/s');

  // 4. Citation and Metadata
  assert.equal(UNEP_REPORT_CITATION.confidenceLevel, 'Medium', 'Confidence level is Medium');
  assert.equal(UNEP_REPORT_CITATION.sourceUrl, 'https://wedocs.unep.org/items/dbe2cd4c-8384-4636-8359-5847f42b9711', 'Source URL is authentic UNEP document');
  assert.ok(UNEP_REPORT_CITATION.scope.includes('Household food waste only'), 'Scope specifies household sector');
});

test('Deterministic Counter Calculation: Monotonic, Repeatable, No Refresh Jumps', () => {
  const startOfYearMs = Date.UTC(2026, 0, 1, 0, 0, 0);

  // Exactly at start of year -> 0 kg
  const atStart = calculateDeterministicModelledWasteKg(startOfYearMs, 2026);
  assert.equal(atStart, 0, 'Zero elapsed time yields exactly 0 kg');

  // After exactly 1 hour (3600 seconds)
  const after1Hr = calculateDeterministicModelledWasteKg(startOfYearMs + 3600 * 1000, 2026);
  const expected1HrKg = 3600 * UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND;
  assert.equal(after1Hr, expected1HrKg, '1 hour elapsed matches mathematical rate');

  // Determinism check: Calling multiple times with identical timestamp returns identical result
  const testTimestamp = Date.now();
  const val1 = calculateDeterministicModelledWasteKg(testTimestamp);
  const val2 = calculateDeterministicModelledWasteKg(testTimestamp);
  assert.equal(val1, val2, 'Calculation is completely deterministic and stable across calls');

  // Monotonicity check: Later timestamp always yields larger value
  const valLater = calculateDeterministicModelledWasteKg(testTimestamp + 1000);
  assert.ok(valLater > val1, 'Later timestamps monotonically advance the counter');
});

test('Server Impact Metrics: UNEP 2024 Integration and Provenance', () => {
  const impact = getPlatformImpactMetrics();
  const tracker = impact.macro_context_india.live_waste_tracker;

  assert.ok(tracker.estimated_india_waste_kg_current_year > 0, 'Current year estimate is positive');
  assert.equal(tracker.annual_baseline_tonnes, 78192338, 'Backend exposes exact 78,192,338 annual baseline');
  assert.equal(tracker.confidence_level, 'Medium', 'Backend exposes Medium confidence level');
  assert.equal(tracker.kg_per_second_rate, 2479.46, 'Backend rate reflects mathematically rounded 2,479.46 kg/s');
  assert.equal(tracker.source_url, 'https://wedocs.unep.org/items/dbe2cd4c-8384-4636-8359-5847f42b9711', 'Backend points to UNEP document');
});
