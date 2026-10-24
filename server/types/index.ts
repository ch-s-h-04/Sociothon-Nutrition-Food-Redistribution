export type DietaryType = 'vegetarian' | 'vegan' | 'mixed' | 'non_vegetarian';
export type FoodCategory = 'cooked meals' | 'rice' | 'bread' | 'vegetables' | 'packaged food' | 'bakery' | 'mixed meals';
export type StorageRequirement = 'ambient' | 'cold_storage' | 'hot_holding';
export type SurplusStatus = 
  | 'available' 
  | 'assigned' 
  | 'in_transit' 
  | 'delivered' 
  | 'diverted_to_compost' 
  | 'disposed' 
  | 'expired';

export type DeliveryStatus = 
  | 'assigned' 
  | 'in_transit' 
  | 'delivered' 
  | 'diverted_to_compost' 
  | 'disposed' 
  | 'cancelled';

export type RecoveryPathway = 
  | 'human_consumption' 
  | 'composting_resource_recovery' 
  | 'disposal';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  district?: string;
  state?: string;
}

export interface RestaurantDonor {
  id: string;
  name: string;
  type: 'restaurant' | 'hotel' | 'cafe' | 'canteen' | 'caterer';
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

export interface ProviderLeaderboardEntry {
  rank: number;
  provider_id: string;
  provider_name: string;
  provider_type: RestaurantDonor['type'];
  district: string;
  state: string;
  trust_score: number;
  badge: 'Gold' | 'Silver' | 'Bronze' | 'Verified';
  reliability_score: number;
  ngo_rating: number | null;
  ngo_rating_count: number;
  safety_score: number;
  handover_score: number;
  verification_score: number;
  verified_handovers: number;
  meals_redistributed: number;
}

export interface ProviderRating {
  delivery_id: string;
  provider_id: string;
  ngo_id: string;
  rating: number;
  created_at: string;
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
  status: DeliveryStatus;
  recovery_pathway?: RecoveryPathway;
  recovery_notes?: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  estimated_distance_km: number;
  estimated_time_minutes: number;
  assigned_at: string;
  dispatched_at?: string;
  delivered_at?: string;
  provider_rating?: ProviderRating;
}
