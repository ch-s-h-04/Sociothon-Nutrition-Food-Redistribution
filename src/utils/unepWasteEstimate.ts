/**
 * UNEP Food Waste Index Report 2024 Baseline & Mathematical Derivation
 * 
 * Data Source:
 * United Nations Environment Programme (UNEP) Food Waste Index Report 2024
 * Report Item: https://wedocs.unep.org/items/dbe2cd4c-8384-4636-8359-5847f42b9711
 * 
 * Scope & Caveats:
 * - India household food-waste estimate: 78,192,338 tonnes per year
 * - Confidence level: Medium
 * - Sector: Household consumption only (does not include pre-harvest agricultural loss,
 *   supply-chain transit, or commercial food service / retail sectors)
 * - Temporal context: Statistical survey estimate, NOT a live sensor or real-time measurement of 2026 waste.
 */

export const UNEP_2024_INDIA_HOUSEHOLD_WASTE_TONNES_PER_YEAR = 78_192_338;
export const KG_PER_METRIC_TONNE = 1_000;
export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000 seconds in a standard 365-day year

// Conversion to kilograms per year: 78,192,338 × 1,000 = 78,192,338,000 kg/year
export const UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_YEAR =
  UNEP_2024_INDIA_HOUSEHOLD_WASTE_TONNES_PER_YEAR * KG_PER_METRIC_TONNE;

// Mathematical derivation of average kilograms per second:
// 78,192,338,000 kg ÷ 31,536,000 seconds = 2,479.4627727... kg/second
export const UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND =
  UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_YEAR / SECONDS_PER_YEAR;

export const UNEP_REPORT_CITATION = {
  reportTitle: 'UNEP Food Waste Index Report 2024',
  sourceUrl: 'https://wedocs.unep.org/items/dbe2cd4c-8384-4636-8359-5847f42b9711',
  confidenceLevel: 'Medium',
  sector: 'Household food waste estimate only',
  scope: 'Household food waste only (does not reflect total national waste or 2026 actual waste)',
  scopeNote: 'Applies to household food waste in India. Does not measure retail, food service, pre-harvest loss, or actual 2026 real-time waste.',
  baselineTonnes: UNEP_2024_INDIA_HOUSEHOLD_WASTE_TONNES_PER_YEAR,
  baselineKg: UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_YEAR,
  secondsPerYear: SECONDS_PER_YEAR,
  kgPerSecond: UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND,
  formulaText: '78,192,338 tonnes/year × 1,000 kg/tonne ÷ 31,536,000 s/year = ~2,479.46 kg/s'
} as const;

/**
 * Calculates deterministic cumulative modelled household waste (kg) since start of year (UTC).
 * Uses wall-clock Date.now() so the counter is 100% deterministic and does not jump on refresh.
 */
export function calculateDeterministicModelledWasteKg(timestampMs: number = Date.now(), year: number = 2026): number {
  const startOfYearMs = Date.UTC(year, 0, 1, 0, 0, 0);
  const elapsedSeconds = Math.max(0, (timestampMs - startOfYearMs) / 1000);
  return elapsedSeconds * UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND;
}
