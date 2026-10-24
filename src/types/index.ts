export type DietaryType = 'vegetarian' | 'vegan' | 'mixed' | 'non_vegetarian';
export type FoodCategory = 'cooked meals' | 'rice' | 'bread' | 'vegetables' | 'packaged food' | 'bakery' | 'mixed meals';
export type StorageRequirement = 'ambient' | 'cold_storage' | 'hot_holding';
export type SurplusStatus = 'available' | 'matched' | 'assigned' | 'in_transit' | 'delivered' | 'expired';

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

export interface DistrictDetail {
  district_id: string;
  district_name: string;
  state: string;
  population: number;
  tribal: boolean;
  dominant_tribe: string;
  aspirational_district: boolean;
  rank: number;
  data_provenance: {
    source: string;
    reporting_period: string;
    classification: string;
  };
  overall_risk: number;
  overall_level: 'critical' | 'high' | 'moderate' | 'low';
  micronutrients: Record<string, {
    risk_pct: number;
    level: string;
    trend: string;
    trend_delta: string;
    causes: string[];
    seasonal_peak: string;
    confidence: number;
  }>;
  district_context: Record<string, number>;
  context: any;
}

export interface FortificationPlan {
  district_id: string;
  district_name: string;
  population: number;
  total_quarterly_budget_lakhs: number;
  allocated_budget_lakhs: number;
  unallocated_budget_lakhs: number;
  selected_vehicles: Array<{
    vehicle_id: string;
    name: string;
    delivery_channel: string;
    target_group: string;
    fortificants: string[];
    quarterly_cost_lakhs: number;
    roi_efficiency_score: number;
    impact_multipliers: Record<string, number>;
  }>;
  projected_outcomes: Record<string, {
    baseline_deficiency_pct: number;
    post_intervention_pct: number;
    projected_reduction_pct: number;
    reduction_relative_pct: number;
  }>;
  model_provenance: string;
}

export interface MealPlan {
  cultural_group: string;
  district_context: string;
  estimated_weekly_cost_inr: number;
  bioavailability_notes: string[];
  weekly_schedule: Array<{
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    daily_nutrients: {
      calories: number;
      iron_mg: number;
      vit_a_mcg: number;
      protein_g: number;
      cost_inr: number;
    };
  }>;
}

export interface RestaurantDonor {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  state: string;
  operating_hours: string;
  contact_phone: string;
  contact_email: string;
  food_preferences: string[];
  historical_surplus: number;
  average_daily_orders: number;
  reliability_score: number;
  active: boolean;
}

export interface RecipientNGO {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  state: string;
  service_radius_km: number;
  daily_capacity_meals: number;
  current_capacity_meals: number;
  accepted_food_types: FoodCategory[];
  accepted_dietary_types: DietaryType[];
  storage_capabilities: StorageRequirement[];
  operating_hours: string;
  contact_phone: string;
  contact_person: string;
  vehicle_available: boolean;
  reliability_score: number;
  active: boolean;
  target_demographics?: string[];
}

export interface FleetVehicle {
  id: string;
  ngo_id: string;
  driver_name: string;
  driver_phone: string;
  capacity_meals: number;
  current_latitude: number;
  current_longitude: number;
  available_at: string;
  status: 'available' | 'en_route' | 'maintenance';
}

export interface SurplusEvent {
  id: string;
  restaurant_id: string;
  donor_name?: string;
  pickup_address: string;
  pickup_district: string;
  pickup_state: string;
  latitude: number;
  longitude: number;
  food_type: FoodCategory;
  dietary_type: DietaryType;
  quantity_meals: number;
  food_weight_kg: number;
  storage_requirement: StorageRequirement;
  created_at: string;
  available_at: string;
  expiry_at: string;
  contact_name: string;
  contact_phone: string;
  confidence: number;
  status: SurplusStatus;
  assigned_ngo_id?: string;
  assigned_vehicle_id?: string;
  delivery_id?: string;
  notes?: string;
}

export interface MatchCandidate {
  ngo: RecipientNGO;
  distance_km: number;
  eta_minutes: number;
  feasible: boolean;
  score: number;
  reason: string;
  vehicle: FleetVehicle | null;
  score_breakdown: {
    nutrition_vulnerability_score: number;
    nutrient_synergy_score: number;
    distance_efficiency_score: number;
    capacity_match_score: number;
    ngo_reliability_score: number;
    urgency_boost_score: number;
  };
  nutrition_insights: {
    district_name: string;
    overall_risk_level: string;
    critical_deficiencies: string[];
    food_synergy_note: string;
  };
}

export interface MatchingResult {
  surplus_event_id: string;
  urgency: 'Low' | 'Normal' | 'Medium' | 'High';
  recommended: MatchCandidate | null;
  candidates: MatchCandidate[];
  summary: string;
}

export interface DeliveryRecord {
  id: string;
  surplus_id: string;
  donor_id: string;
  donor_name: string;
  ngo_id: string;
  ngo_name: string;
  vehicle_id: string;
  driver_name: string;
  quantity_meals: number;
  food_weight_kg: number;
  food_type: string;
  dietary_type: string;
  status: 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  estimated_distance_km: number;
  estimated_time_minutes: number;
  assigned_at: string;
  dispatched_at?: string;
  delivered_at?: string;
  environmental_impact: {
    co2_avoided_kg: number;
    water_saved_liters: number;
    economic_value_inr: number;
  };
}

export interface ImpactMetrics {
  operational_impact: {
    total_donations_registered: number;
    active_available_surplus: number;
    assigned_in_transit_deliveries: number;
    completed_deliveries: number;
    total_meals_delivered: number;
    total_food_weight_kg_rescued: number;
    environmental_offsets: {
      co2_emissions_averted_kg: number;
      water_footprint_saved_liters: number;
      economic_value_preserved_inr: number;
    };
    provenance: string;
  };
  macro_context_india: {
    annual_food_waste_india_million_tonnes: number;
    people_who_could_be_fed_millions: number;
    food_service_sector_waste_million_tonnes: number;
    global_hunger_index_2025: {
      rank: number;
      out_of: number;
      score: number;
      category: string;
    };
    live_waste_tracker: {
      elapsed_seconds_2026: number;
      estimated_india_waste_kg_current_year: number;
      kg_per_second_rate: number;
      note: string;
    };
    ghi_trend: Array<{ year: number; score: number }>;
    ghi_indicators: Array<{ indicator: string; value: number; unit: string }>;
    provenance: string;
  };
}
