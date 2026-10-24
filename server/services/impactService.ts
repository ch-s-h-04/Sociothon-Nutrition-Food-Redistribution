import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { store } from '../db/store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function loadFoodWasteData() {
  const filePath = path.join(DATA_DIR, 'india_food_waste_dashboard_data.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getPlatformImpactMetrics() {
  const deliveries = store.getDeliveries();
  const surplus = store.getSurplusEvents();
  const rawData = loadFoodWasteData();

  const deliveredRecords = deliveries.filter(d => d.status === 'delivered');
  const inTransitRecords = deliveries.filter(d => d.status === 'in_transit');

  // Actual platform metrics (from recorded completed transactions)
  const actualMealsDelivered = deliveredRecords.reduce((sum, d) => sum + d.quantity_meals, 0);
  const actualKgDelivered = Number(deliveredRecords.reduce((sum, d) => sum + d.food_weight_kg, 0).toFixed(1));
  const actualCo2Avoided = Number(deliveredRecords.reduce((sum, d) => sum + d.environmental_impact.co2_avoided_kg, 0).toFixed(1));
  const actualWaterSaved = deliveredRecords.reduce((sum, d) => sum + d.environmental_impact.water_saved_liters, 0);
  const actualEconomicSaved = deliveredRecords.reduce((sum, d) => sum + d.environmental_impact.economic_value_inr, 0);

  // Live counter calculation (from UNEP / NABCONS baseline)
  // Annual baseline: 78,000,000,000 kg/year -> 2474.8858 kg/sec
  const startOfYear = new Date('2026-01-01T00:00:00Z').getTime();
  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - startOfYear) / 1000);
  const estimatedIndiaWasteSinceStartOfYearKg = Math.round(elapsedSeconds * 2474.8858);

  return {
    operational_impact: {
      total_donations_registered: surplus.length,
      active_available_surplus: surplus.filter(s => s.status === 'available').length,
      assigned_in_transit_deliveries: inTransitRecords.length,
      completed_deliveries: deliveredRecords.length,
      total_meals_delivered: actualMealsDelivered,
      total_food_weight_kg_rescued: actualKgDelivered,
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
        kg_per_second_rate: 2474.89,
        note: 'Dashboard-derived statistical projection based on UNEP Food Waste Index 2024 (78 MT/yr).'
      },
      ghi_trend: rawData.data.ghi_trend || [],
      ghi_indicators: rawData.data.ghi_india_indicators_2025 || [],
      provenance: 'UNEP Food Waste Index 2024 & NABCONS Food Waste Study 2022'
    }
  };
}
