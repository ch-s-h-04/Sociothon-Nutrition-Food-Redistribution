import { store } from '../db/store.ts';
import type { SurplusEvent, SurplusStatus, FoodCategory, DietaryType, StorageRequirement } from '../types/index.ts';

export function calculateFoodWeightKg(quantityMeals: number): number {
  // Documented counting standard: 1 standard recovered meal portion = 0.38 kg
  return Number((quantityMeals * 0.38).toFixed(1));
}

export interface CreateSurplusInput {
  restaurant_id?: string;
  donor_name?: string;
  pickup_address: string;
  pickup_district: string;
  pickup_state: string;
  latitude: number;
  longitude: number;
  food_type: FoodCategory;
  dietary_type: DietaryType;
  quantity_meals: number;
  storage_requirement?: StorageRequirement;
  available_at?: string;
  expiry_at: string;
  contact_name: string;
  contact_phone: string;
  notes?: string;
}

export function createSurplusListing(input: CreateSurplusInput): SurplusEvent {
  // Input validations
  if (!input.pickup_address || !input.pickup_district || !input.pickup_state) {
    throw new Error('Pickup location (address, district, state) is required');
  }
  if (!input.food_type) {
    throw new Error('Food category is required');
  }
  if (!input.dietary_type) {
    throw new Error('Dietary classification is required');
  }
  if (!input.quantity_meals || input.quantity_meals <= 0) {
    throw new Error('Quantity in meals must be greater than zero');
  }
  if (!input.expiry_at) {
    throw new Error('Expiry / safe-consumption deadline is required');
  }
  if (!input.contact_name || !input.contact_phone) {
    throw new Error('Contact details (name and phone) are required');
  }

  const id = `S-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`;
  const now = new Date().toISOString();

  // If restaurant_id provided, associate or fall back
  let donorName = input.donor_name;
  if (input.restaurant_id) {
    const r = store.getRestaurantById(input.restaurant_id);
    if (r) {
      donorName = donorName || r.name;
    }
  }

  const newEvent: SurplusEvent = {
    id,
    restaurant_id: input.restaurant_id || `D-${Date.now().toString().slice(-4)}`,
    donor_name: donorName || 'Community Food Donor',
    pickup_address: input.pickup_address,
    pickup_district: input.pickup_district,
    pickup_state: input.pickup_state,
    latitude: input.latitude,
    longitude: input.longitude,
    food_type: input.food_type,
    dietary_type: input.dietary_type,
    quantity_meals: Number(input.quantity_meals),
    food_weight_kg: calculateFoodWeightKg(input.quantity_meals),
    storage_requirement: input.storage_requirement || 'ambient',
    created_at: now,
    available_at: input.available_at || now,
    expiry_at: input.expiry_at,
    contact_name: input.contact_name,
    contact_phone: input.contact_phone,
    confidence: 90,
    status: 'available',
    notes: input.notes || ''
  };

  return store.addSurplus(newEvent);
}

export function getAllSurplusListings(statusFilter?: SurplusStatus): SurplusEvent[] {
  const events = store.getSurplusEvents();
  if (statusFilter) {
    return events.filter(e => e.status === statusFilter);
  }
  return events;
}

export function getSurplusListingById(id: string): SurplusEvent | undefined {
  return store.getSurplusById(id);
}

export function updateSurplusStatus(id: string, status: SurplusStatus, metadata?: { assigned_ngo_id?: string; assigned_vehicle_id?: string; delivery_id?: string }): SurplusEvent {
  const existing = store.getSurplusById(id);
  if (!existing) {
    throw new Error(`Surplus listing ${id} not found`);
  }

  const updates: Partial<SurplusEvent> = { status };
  if (metadata?.assigned_ngo_id) updates.assigned_ngo_id = metadata.assigned_ngo_id;
  if (metadata?.assigned_vehicle_id) updates.assigned_vehicle_id = metadata.assigned_vehicle_id;
  if (metadata?.delivery_id) updates.delivery_id = metadata.delivery_id;

  const updated = store.updateSurplus(id, updates);
  if (!updated) {
    throw new Error(`Failed to update surplus listing ${id}`);
  }
  return updated;
}

export function deleteSurplusListing(id: string): boolean {
  return store.deleteSurplus(id);
}
