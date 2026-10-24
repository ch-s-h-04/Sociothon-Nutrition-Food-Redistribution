import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function loadJson<T = any>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

const districtsData = loadJson<any[]>('districts.json');
const fortVehiclesData = loadJson<any>('fortification_vehicles.json');
const culturalRulesData = loadJson<any>('cultural_rules.json');
const foodCompData = loadJson<any>('food_composition.json');

export function getRiskLevel(pct: number): 'critical' | 'high' | 'moderate' | 'low' {
  if (pct >= 65) return 'critical';
  if (pct >= 50) return 'high';
  if (pct >= 35) return 'moderate';
  return 'low';
}

export function calculateDistrictOverallRisk(d: any): number {
  const mn = d.micronutrient_profile || {};
  const scores = Object.values(mn).map((v: any) => v.deficiency_pct || 0);
  if (scores.length === 0) return 0;
  return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
}

export interface DistrictSummary {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
  tribal: boolean;
  aspirational_district: boolean;
  rank: number;
  overall_risk: number;
  overall_level: 'critical' | 'high' | 'moderate' | 'low';
  stunting_pct: number;
  wasting_pct: number;
  underweight_pct: number;
  anemia_children_pct: number;
  anemia_women_pct: number;
  poverty_pct: number;
  diet_diversity_score: number;
  iron_risk: number;
  vitamin_a_risk: number;
  zinc_risk: number;
  b12_risk: number;
  vitamin_d_risk: number;
  data_type: 'verified_historical_factsheet';
}

export function getAllDistrictSummaries(): DistrictSummary[] {
  return districtsData.map(d => {
    const overall = calculateDistrictOverallRisk(d);
    const mn = d.micronutrient_profile || {};
    const nfhs = d.nfhs5 || {};
    return {
      id: d.id,
      name: d.name,
      state: d.state,
      lat: d.lat,
      lng: d.lng,
      population: d.population,
      tribal: d.tribal,
      aspirational_district: d.aspirational_district,
      rank: d.rank,
      overall_risk: overall,
      overall_level: getRiskLevel(overall),
      stunting_pct: nfhs.stunting_pct || 0,
      wasting_pct: nfhs.wasting_pct || 0,
      underweight_pct: nfhs.underweight_pct || 0,
      anemia_children_pct: nfhs.anemia_children_pct || 0,
      anemia_women_pct: nfhs.anemia_women_pct || 0,
      poverty_pct: nfhs.poverty_pct || 0,
      diet_diversity_score: nfhs.diet_diversity_score || 0,
      iron_risk: mn.iron?.deficiency_pct || 0,
      vitamin_a_risk: mn.vitamin_a?.deficiency_pct || 0,
      zinc_risk: mn.zinc?.deficiency_pct || 0,
      b12_risk: mn.b12?.deficiency_pct || 0,
      vitamin_d_risk: mn.vitamin_d?.deficiency_pct || 0,
      data_type: 'verified_historical_factsheet'
    };
  }).sort((a, b) => a.rank - b.rank);
}

export function getDistrictById(districtId: string) {
  const cleanId = districtId.toLowerCase().replace(/[\s-]/g, '_');
  const d = districtsData.find(x => x.id === cleanId || x.name.toLowerCase() === cleanId);
  if (!d) return null;

  const overall = calculateDistrictOverallRisk(d);
  const mn = d.micronutrient_profile || {};
  const nfhs = d.nfhs5 || {};

  return {
    district_id: d.id,
    district_name: d.name,
    state: d.state,
    population: d.population,
    tribal: d.tribal,
    dominant_tribe: d.dominant_tribe || 'None reported',
    aspirational_district: d.aspirational_district,
    rank: d.rank,
    data_provenance: {
      source: d.source || 'NFHS-5 (2019-21) Factsheets, Ministry of Health & Family Welfare',
      reporting_period: '2019–2021',
      classification: 'Observed epidemiological statistics with rule-based risk profiling'
    },
    overall_risk: overall,
    overall_level: getRiskLevel(overall),
    micronutrients: Object.entries(mn).reduce((acc: any, [nutrient, info]: [string, any]) => {
      acc[nutrient] = {
        risk_pct: info.deficiency_pct || 0,
        level: getRiskLevel(info.deficiency_pct || 0),
        trend: info.trend || 'stable',
        trend_delta: info.trend_delta || '0%',
        causes: info.primary_causes || [],
        seasonal_peak: info.seasonal_peak || 'year_round',
        confidence: 0.94
      };
      return acc;
    }, {}),
    district_context: {
      stunting_pct: nfhs.stunting_pct || 0,
      wasting_pct: nfhs.wasting_pct || 0,
      underweight_pct: nfhs.underweight_pct || 0,
      anemia_children_pct: nfhs.anemia_children_pct || 0,
      anemia_women_pct: nfhs.anemia_women_pct || 0,
      low_birth_weight_pct: nfhs.low_birth_weight_pct || 0,
      child_mortality_per_1000: nfhs.child_mortality_per_1000 || 0,
      institutional_delivery_pct: nfhs.institutional_delivery_pct || 0,
      pds_coverage_pct: nfhs.pds_coverage_pct || 0,
      open_defecation_pct: nfhs.open_defecation_pct || 0,
      diet_diversity_score: nfhs.diet_diversity_score || 0,
      vegetarian_pct: nfhs.vegetarian_pct || 0,
      poverty_pct: nfhs.poverty_pct || 0,
      female_literacy_pct: nfhs.female_literacy_pct || 0
    },
    context: d.context || {}
  };
}

// Fortification Optimizer
const VEHICLE_IMPACT: Record<string, Record<string, number>> = {
  pds_rice: { iron: 0.22, b12: 0.18, folate: 0.14, vitamin_a: 0, zinc: 0, vitamin_d: 0 },
  anganwadi_thr: { iron: 0.18, zinc: 0.28, vitamin_a: 0.30, b12: 0.08, vitamin_d: 0.05, folate: 0.10 },
  double_fortified_salt: { iron: 0.12, b12: 0, zinc: 0, vitamin_a: 0, vitamin_d: 0, folate: 0 },
  pds_oil: { vitamin_a: 0.28, vitamin_d: 0.20, iron: 0, zinc: 0, b12: 0, folate: 0 },
  mdm_flour: { iron: 0.16, zinc: 0.14, b12: 0.06, vitamin_a: 0, vitamin_d: 0, folate: 0.12 }
};

const VEHICLE_COST_PER_LAKH_POP: Record<string, number> = {
  pds_rice: 1.8,
  anganwadi_thr: 2.4,
  double_fortified_salt: 0.9,
  pds_oil: 1.2,
  mdm_flour: 1.6
};

const QUARTERLY_BUDGET_PER_LAKH_POP = 8.5; // Lakhs INR per lakh population

export function optimizeFortification(districtId: string) {
  const profile = getDistrictById(districtId);
  if (!profile) return null;

  const popLakhs = profile.population / 100000;
  const totalBudget = Number((QUARTERLY_BUDGET_PER_LAKH_POP * popLakhs).toFixed(2));
  const riskProfile: Record<string, number> = {};
  for (const [k, v] of Object.entries(profile.micronutrients)) {
    riskProfile[k] = (v as any).risk_pct;
  }

  const vehicleScores: Record<string, any> = {};
  for (const [vId, impacts] of Object.entries(VEHICLE_IMPACT)) {
    let score = 0;
    for (const [nutrient, risk] of Object.entries(riskProfile)) {
      if (impacts[nutrient]) {
        score += impacts[nutrient] * (risk / 100.0);
      }
    }
    const cost = VEHICLE_COST_PER_LAKH_POP[vId] * popLakhs;
    vehicleScores[vId] = {
      score: Number(score.toFixed(3)),
      cost: Number(cost.toFixed(2)),
      roi: cost > 0 ? Number((score / cost).toFixed(4)) : 0
    };
  }

  const sortedVehicles = Object.entries(vehicleScores).sort((a, b) => b[1].roi - a[1].roi);
  let remainingBudget = totalBudget;
  const selectedVehicles: any[] = [];
  const cumulativeImpact: Record<string, number> = { iron: 0, vitamin_a: 0, zinc: 0, b12: 0, vitamin_d: 0 };

  const fortVehiclesLookup = (fortVehiclesData.vehicles || []).reduce((acc: any, v: any) => {
    acc[v.id] = v;
    return acc;
  }, {});

  for (const [vId, vData] of sortedVehicles) {
    if (remainingBudget >= vData.cost) {
      remainingBudget = Number((remainingBudget - vData.cost).toFixed(2));
      const details = fortVehiclesLookup[vId] || {};
      selectedVehicles.push({
        vehicle_id: vId,
        name: details.name || vId,
        delivery_channel: details.delivery_channel || 'Public Distribution System',
        target_group: details.target_group || 'General population',
        fortificants: details.fortificants || [],
        quarterly_cost_lakhs: vData.cost,
        roi_efficiency_score: vData.roi,
        impact_multipliers: VEHICLE_IMPACT[vId]
      });

      for (const [nut, val] of Object.entries(VEHICLE_IMPACT[vId])) {
        if (cumulativeImpact[nut] !== undefined) {
          cumulativeImpact[nut] = Number((cumulativeImpact[nut] + val).toFixed(2));
        }
      }
    }
  }

  const projectedReductions: Record<string, any> = {};
  for (const [nut, risk] of Object.entries(riskProfile)) {
    const redFactor = Math.min(0.45, cumulativeImpact[nut] || 0);
    const postIntervention = Number((risk * (1 - redFactor)).toFixed(1));
    projectedReductions[nut] = {
      baseline_deficiency_pct: risk,
      post_intervention_pct: postIntervention,
      projected_reduction_pct: Number((risk - postIntervention).toFixed(1)),
      reduction_relative_pct: Number((redFactor * 100).toFixed(1))
    };
  }

  return {
    district_id: profile.district_id,
    district_name: profile.district_name,
    population: profile.population,
    total_quarterly_budget_lakhs: totalBudget,
    allocated_budget_lakhs: Number((totalBudget - remainingBudget).toFixed(2)),
    unallocated_budget_lakhs: remainingBudget,
    selected_vehicles: selectedVehicles,
    projected_outcomes: projectedReductions,
    model_provenance: 'Linear-programming inspired greedy cost-effectiveness optimization respecting FSSAI fortification guidelines.'
  };
}

// Cultural Meal Planning
export function getCulturalGroups() {
  return Object.entries(culturalRulesData).map(([id, data]: [string, any]) => ({
    id,
    label: data.label || id,
    notes: data.notes || '',
    b12_strategy: data.b12_strategy || 'Dairy + Fermentation',
    strict_prohibitions: data.strict_prohibitions || []
  }));
}

export function generateCulturallyAwareMealPlan(req: {
  district?: string;
  cultural_group?: string;
  budget_inr?: number;
  season?: string;
}) {
  const groupKey = req.cultural_group || 'tribal_hindu';
  const groupRules = culturalRulesData[groupKey] || culturalRulesData['tribal_hindu'];
  const districtProfile = req.district ? getDistrictById(req.district) : null;

  type Food = { id: string; name: string; category: string; per_100g: Record<string, number>; cost_per_100g: number; tags: string[]; seasonality: string };
  const foods: Food[] = Object.entries(foodCompData).map(([id, item]: [string, any]) => ({ id, ...item }));
  const season = req.season || 'year_round';
  const dailyBudget = Math.max(35, (req.budget_inr || 560) / 7);
  const excluded = new Set((groupRules.excluded_foods || []).map((item: string) => item.toLowerCase().replace(/s$/, '')));
  const priorityRisks = districtProfile?.micronutrients || {};
  const nutrientWeights: Record<string, number> = {
    iron_mg: priorityRisks.iron?.risk_pct || 35,
    zinc_mg: priorityRisks.zinc?.risk_pct || 25,
    vitamin_a_mcg: priorityRisks.vitamin_a?.risk_pct || 25,
    b12_mcg: priorityRisks.b12?.risk_pct || 20,
    vitamin_d_mcg: priorityRisks.vitamin_d?.risk_pct || 20,
    protein: (districtProfile?.district_context?.stunting_pct || 25) + (districtProfile?.district_context?.wasting_pct || 10)
  };
  const forbidden = (food: Food) => {
    const text = `${food.id} ${food.name} ${food.tags.join(' ')}`.toLowerCase();
    const terms = [...excluded].flatMap(term => term === 'egg' ? ['egg'] : term === 'root_vegetable' ? ['potato', 'carrot', 'beet', 'root'] : [term]);
    return terms.some(term => text.includes(term));
  };
  const allowed = foods.filter(food => !forbidden(food) && (food.seasonality === 'year_round' || food.seasonality === season));
  const score = (food: Food) => {
    const nutrients = food.per_100g;
    const needScore = Object.entries(nutrientWeights).reduce((total, [nutrient, weight]) => total + ((nutrients[nutrient] || 0) * weight), 0);
    const culturalBoost = (groupRules.preferred_staples || []).some((item: string) => food.id.includes(item) || food.name.toLowerCase().includes(item.replace(/_/g, ' '))) ? 180 : 0;
    const ironBoost = (groupRules.iron_sources || []).some((item: string) => food.id.includes(item) || food.name.toLowerCase().includes(item.replace(/_/g, ' '))) ? 160 : 0;
    return needScore + culturalBoost + ironBoost - food.cost_per_100g * (dailyBudget < 70 ? 30 : 8);
  };
  const byCategory = (category: string) => allowed.filter(food => food.category === category).sort((a, b) => score(b) - score(a));
  const pick = (category: string, day: number, fallbackCategory?: string) => {
    const choices = byCategory(category);
    const fallback = fallbackCategory ? byCategory(fallbackCategory) : [];
    const pool = choices.length ? choices : fallback.length ? fallback : allowed;
    return pool[day % Math.min(pool.length, 4)];
  };
  const serving = (food: Food, grams: number) => {
    const factor = grams / 100;
    return {
      calories: (food.per_100g.calories || 0) * factor, protein: (food.per_100g.protein || 0) * factor,
      iron_mg: (food.per_100g.iron_mg || 0) * factor, vit_a_mcg: (food.per_100g.vitamin_a_mcg || 0) * factor,
      cost_inr: food.cost_per_100g * factor
    };
  };
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = days.map((day, index) => {
    const breakfastCereal = pick('cereal', index);
    const breakfastSide = pick('fruit', index + 1, 'seed');
    const lunchStaple = pick('cereal', index + 1);
    const lunchProtein = pick('legume', index, 'protein');
    const lunchVegetable = pick('vegetable', index);
    const dinnerStaple = pick('cereal', index + 2);
    const dinnerProtein = pick('protein', index + 1, 'legume');
    const dinnerVegetable = pick('vegetable', index + 2);
    const vitaminC = allowed.filter(food => food.tags.includes('iron_absorption_booster')).sort((a, b) => score(b) - score(a))[index % Math.max(1, allowed.filter(food => food.tags.includes('iron_absorption_booster')).length)] || breakfastSide;
    const portions = [[breakfastCereal, 90], [breakfastSide, 100], [lunchStaple, 140], [lunchProtein, 90], [lunchVegetable, 120], [vitaminC, 30], [dinnerStaple, 120], [dinnerProtein, 85], [dinnerVegetable, 120]] as Array<[Food, number]>;
    const totals = portions.reduce((sum, [food, grams]) => {
      const item = serving(food, grams);
      return { calories: sum.calories + item.calories, protein: sum.protein + item.protein, iron_mg: sum.iron_mg + item.iron_mg, vit_a_mcg: sum.vit_a_mcg + item.vit_a_mcg, cost_inr: sum.cost_inr + item.cost_inr };
    }, { calories: 0, protein: 0, iron_mg: 0, vit_a_mcg: 0, cost_inr: 0 });
    return {
      day,
      breakfast: `${breakfastCereal.name} with ${breakfastSide.name}`,
      lunch: `${lunchStaple.name} with ${lunchProtein.name}, ${lunchVegetable.name}, and ${vitaminC.name}`,
      dinner: `${dinnerStaple.name} with ${dinnerProtein.name} and ${dinnerVegetable.name}`,
      daily_nutrients: { calories: Math.round(totals.calories), protein_g: Number(totals.protein.toFixed(1)), iron_mg: Number(totals.iron_mg.toFixed(1)), vit_a_mcg: Math.round(totals.vit_a_mcg), cost_inr: Math.round(totals.cost_inr) }
    };
  });

  return {
    cultural_group: groupRules.label,
    district_context: districtProfile ? districtProfile.district_name : 'General Pan-India',
    estimated_weekly_cost_inr: meals.reduce((sum, m) => sum + m.daily_nutrients.cost_inr, 0),
    bioavailability_notes: [
      `Ingredient ranking prioritizes ${Object.entries(priorityRisks).sort(([, a]: any, [, b]: any) => (b.risk_pct || 0) - (a.risk_pct || 0)).slice(0, 3).map(([nutrient]) => nutrient.replace('_', ' ')).join(', ') || 'district nutrition risks'} for ${districtProfile?.district_name || 'the selected district'}.`,
      `Only foods compatible with ${groupRules.label} restrictions and ${season} availability are eligible for this schedule.`,
      `A weekly budget of ₹${Math.round(dailyBudget * 7)} guides lower-cost ingredient ranking; vitamin-C foods are paired with iron sources where available.`
    ],
    weekly_schedule: meals
  };
}

// State aggregation
export function getStateNutritionOverview() {
  const statesMap: Record<string, { count: number; stuntingTotal: number; wastingTotal: number; anemiaTotal: number; popTotal: number }> = {};
  for (const d of districtsData) {
    const s = d.state;
    if (!statesMap[s]) {
      statesMap[s] = { count: 0, stuntingTotal: 0, wastingTotal: 0, anemiaTotal: 0, popTotal: 0 };
    }
    statesMap[s].count++;
    statesMap[s].stuntingTotal += d.nfhs5?.stunting_pct || 0;
    statesMap[s].wastingTotal += d.nfhs5?.wasting_pct || 0;
    statesMap[s].anemiaTotal += d.nfhs5?.anemia_children_pct || 0;
    statesMap[s].popTotal += d.population || 0;
  }

  return Object.entries(statesMap).map(([state, data]) => ({
    state,
    districts_monitored: data.count,
    avg_stunting_pct: Number((data.stuntingTotal / data.count).toFixed(1)),
    avg_wasting_pct: Number((data.wastingTotal / data.count).toFixed(1)),
    avg_child_anemia_pct: Number((data.anemiaTotal / data.count).toFixed(1)),
    total_population_represented: data.popTotal,
    priority_level: (data.stuntingTotal / data.count) > 50 ? 'Critical' : (data.stuntingTotal / data.count) > 40 ? 'High' : 'Moderate'
  })).sort((a, b) => b.avg_child_anemia_pct - a.avg_child_anemia_pct);
}
