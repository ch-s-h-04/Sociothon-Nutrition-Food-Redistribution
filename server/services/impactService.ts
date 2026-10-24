import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { store } from '../db/store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// UNEP Food Waste Index Report 2024 Benchmark Constants
export const UNEP_2024_INDIA_HOUSEHOLD_WASTE_TONNES_PER_YEAR = 78_192_338;
export const KG_PER_METRIC_TONNE = 1_000;
export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000 seconds
export const UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_YEAR =
  UNEP_2024_INDIA_HOUSEHOLD_WASTE_TONNES_PER_YEAR * KG_PER_METRIC_TONNE;
export const UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND =
  UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_YEAR / SECONDS_PER_YEAR;

function loadFoodWasteData() {
  const filePath = path.join(DATA_DIR, 'india_food_waste_dashboard_data.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getPlatformImpactMetrics() {
  const deliveries = store.getDeliveries();
  const surplus = store.getSurplusEvents();
  const rawData = loadFoodWasteData();

  const deliveredRecords = deliveries.filter(d => d.status === 'delivered');
  const compostRecords = deliveries.filter(d => d.status === 'diverted_to_compost');
  const disposedRecords = deliveries.filter(d => d.status === 'disposed');
  const inTransitRecords = deliveries.filter(d => d.status === 'in_transit');
  const assignedRecords = deliveries.filter(d => d.status === 'assigned');

  // Weights & counts
  const totalRegisteredKg = Number(surplus.reduce((sum, s) => sum + s.food_weight_kg, 0).toFixed(1));
  const totalRegisteredMeals = surplus.reduce((sum, s) => sum + s.quantity_meals, 0);

  const pendingCollectionKg = Number(
    surplus
      .filter(s => s.status === 'available' || s.status === 'assigned' || s.status === 'in_transit')
      .reduce((sum, s) => sum + s.food_weight_kg, 0)
      .toFixed(1)
  );

  const redistributedMeals = deliveredRecords.reduce((sum, d) => sum + d.quantity_meals, 0);
  const redistributedKg = Number(deliveredRecords.reduce((sum, d) => sum + d.food_weight_kg, 0).toFixed(1));
  const compostedKg = Number(compostRecords.reduce((sum, d) => sum + d.food_weight_kg, 0).toFixed(1));
  const compostYieldKg = Number(compostRecords.reduce((sum, d) => sum + (d.environmental_impact.compost_generated_kg || 0), 0).toFixed(1));
  const disposedKg = Number(disposedRecords.reduce((sum, d) => sum + d.food_weight_kg, 0).toFixed(1));

  // Collected kg = sum of batches that have been picked up/processed (delivered + composted + disposed + in_transit)
  const collectedKg = Number((redistributedKg + compostedKg + disposedKg + inTransitRecords.reduce((sum, d) => sum + d.food_weight_kg, 0)).toFixed(1));

  // Diversion / Recovery rates
  const recoveryRatePct = totalRegisteredKg > 0 
    ? Number((((redistributedKg + compostedKg) / totalRegisteredKg) * 100).toFixed(1)) 
    : 0;
  const redistributionRatePct = totalRegisteredKg > 0 
    ? Number(((redistributedKg / totalRegisteredKg) * 100).toFixed(1)) 
    : 0;

  // Collection logistics
  const totalDistanceKm = Number(deliveries.reduce((sum, d) => sum + (d.estimated_distance_km || 0), 0).toFixed(1));
  const collectionEfficiency = totalDistanceKm > 0 
    ? Number((collectedKg / totalDistanceKm).toFixed(2)) 
    : 0;

  // Environmental offsets from delivered and composted items
  const actualCo2Avoided = Number(
    deliveries
      .filter(d => d.status === 'delivered' || d.status === 'diverted_to_compost')
      .reduce((sum, d) => sum + d.environmental_impact.co2_avoided_kg, 0)
      .toFixed(1)
  );
  const actualWaterSaved = deliveries
    .filter(d => d.status === 'delivered')
    .reduce((sum, d) => sum + d.environmental_impact.water_saved_liters, 0);
  const actualEconomicSaved = deliveries
    .filter(d => d.status === 'delivered' || d.status === 'diverted_to_compost')
    .reduce((sum, d) => sum + d.environmental_impact.economic_value_inr, 0);

  // Modelled statistical projection derived mathematically from UNEP Food Waste Index 2024
  // Baseline: 78,192,338 tonnes/year -> 78,192,338,000 kg ÷ 31,536,000 seconds = ~2,479.4628 kg/sec
  const startOfYear = Date.UTC(2026, 0, 1, 0, 0, 0);
  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - startOfYear) / 1000);
  const estimatedIndiaWasteSinceStartOfYearKg = Math.round(elapsedSeconds * UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND);

  return {
    operational_impact: {
      total_donations_registered: surplus.length,
      active_available_surplus: surplus.filter(s => s.status === 'available').length,
      assigned_in_transit_deliveries: inTransitRecords.length + assignedRecords.length,
      completed_deliveries: deliveredRecords.length,
      diverted_to_compost_count: compostRecords.length,
      disposed_count: disposedRecords.length,
      total_registered_kg: totalRegisteredKg,
      total_registered_meals: totalRegisteredMeals,
      pending_collection_kg: pendingCollectionKg,
      collected_kg: collectedKg,
      redistributed_kg: redistributedKg,
      redistributed_meals: redistributedMeals,
      total_meals_delivered: redistributedMeals,
      total_food_weight_kg_rescued: redistributedKg,
      composted_kg: compostedKg,
      compost_yield_kg: compostYieldKg,
      disposed_kg: disposedKg,
      recovery_rate_pct: recoveryRatePct,
      redistribution_rate_pct: redistributionRatePct,
      collection_distance_km: totalDistanceKm,
      collection_efficiency_kg_per_km: collectionEfficiency,
      environmental_offsets: {
        co2_emissions_averted_kg: actualCo2Avoided,
        water_footprint_saved_liters: actualWaterSaved,
        economic_value_preserved_inr: actualEconomicSaved
      },
      provenance: 'Derived directly from verified platform database transaction records.'
    },
    macro_context_india: {
      annual_food_waste_india_million_tonnes: rawData.data.paradox.annual_food_waste_india.value,
      people_who_could_be_fed_millions: rawData.data.paradox.people_who_could_be_fed.value,
      food_service_sector_waste_million_tonnes: rawData.data.paradox.food_service_sector_waste_india.value,
      global_hunger_index_2025: rawData.data.paradox.global_hunger_index_2025,
      live_waste_tracker: {
        elapsed_seconds_2026: Math.round(elapsedSeconds),
        estimated_india_waste_kg_current_year: estimatedIndiaWasteSinceStartOfYearKg,
        kg_per_second_rate: Number(UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND.toFixed(2)),
        annual_baseline_tonnes: UNEP_2024_INDIA_HOUSEHOLD_WASTE_TONNES_PER_YEAR,
        confidence_level: 'Medium',
        scope: 'Household food waste estimate only (not total national waste or 2026 actual waste)',
        source_url: 'https://wedocs.unep.org/items/dbe2cd4c-8384-4636-8359-5847f42b9711',
        note: 'Modelled statistical projection assuming constant rate derived from UNEP Food Waste Index 2024 (78,192,338 tonnes/year).'
      },
      ghi_trend: rawData.data.ghi_trend || [],
      ghi_indicators: rawData.data.ghi_india_indicators_2025 || [],
      provenance: 'Illustrative research benchmarks derived from UNEP Food Waste Index 2024 & NABCONS Food Waste Study 2022.'
    }
  };
}
