import { store } from '../db/store.ts';
import type { DeliveryRecord, SurplusStatus } from '../types/index.ts';
import { calculateHaversineDistanceKm, estimateTravelTimeMinutes } from './matchingService.ts';

export interface AssignDeliveryInput {
  surplus_id: string;
  ngo_id: string;
  vehicle_id?: string;
}

export function calculateEnvironmentalImpact(foodWeightKg: number, mealsCount: number) {
  // Documented LCA parameters:
  // 1 kg food waste averted = 2.5 kg CO2 equivalent emissions prevented (FAO / UNEP Food Waste Index 2024)
  // 1 kg food saved = 750 liters embedded agricultural water conserved (Water Footprint Network India)
  // 1 meal saved = ₹65 estimated consumer replacement value
  return {
    co2_avoided_kg: Number((foodWeightKg * 2.5).toFixed(1)),
    water_saved_liters: Math.round(foodWeightKg * 750),
    economic_value_inr: Math.round(mealsCount * 65)
  };
}

export function assignDonationToNGO(input: AssignDeliveryInput): DeliveryRecord {
  const surplus = store.getSurplusById(input.surplus_id);
  if (!surplus) {
    throw new Error(`Surplus listing ${input.surplus_id} not found`);
  }
  if (surplus.status === 'delivered') {
    throw new Error(`Surplus listing ${input.surplus_id} is already marked as delivered`);
  }

  const ngo = store.getNGOById(input.ngo_id);
  if (!ngo) {
    throw new Error(`NGO recipient ${input.ngo_id} not found`);
  }

  // Find vehicle
  const vehicles = store.getVehicles();
  const vehicle = input.vehicle_id
    ? vehicles.find(v => v.id === input.vehicle_id)
    : vehicles.find(v => v.ngo_id === ngo.id && v.status === 'available') || vehicles.find(v => v.ngo_id === ngo.id);

  if (!vehicle) {
    throw new Error(`No transport vehicle found for NGO ${ngo.name}`);
  }

  const distanceKm = calculateHaversineDistanceKm(surplus.latitude, surplus.longitude, ngo.latitude, ngo.longitude);
  const roadDistKm = Number((distanceKm * 1.35).toFixed(1));
  const etaMins = estimateTravelTimeMinutes(distanceKm);

  const deliveryId = `DEL-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`;
  const impact = calculateEnvironmentalImpact(surplus.food_weight_kg, surplus.quantity_meals);

  const delivery: DeliveryRecord = {
    id: deliveryId,
    surplus_id: surplus.id,
    donor_id: surplus.restaurant_id,
    donor_name: surplus.donor_name || 'Food Donor',
    ngo_id: ngo.id,
    ngo_name: ngo.name,
    vehicle_id: vehicle.id,
    driver_name: vehicle.driver_name,
    quantity_meals: surplus.quantity_meals,
    food_weight_kg: surplus.food_weight_kg,
    food_type: surplus.food_type,
    dietary_type: surplus.dietary_type,
    status: 'assigned',
    pickup_lat: surplus.latitude,
    pickup_lng: surplus.longitude,
    dropoff_lat: ngo.latitude,
    dropoff_lng: ngo.longitude,
    estimated_distance_km: roadDistKm,
    estimated_time_minutes: etaMins,
    assigned_at: new Date().toISOString(),
    environmental_impact: impact
  };

  // Update store
  store.addDelivery(delivery);
  store.updateSurplus(surplus.id, {
    status: 'assigned',
    assigned_ngo_id: ngo.id,
    assigned_vehicle_id: vehicle.id,
    delivery_id: delivery.id
  });
  store.updateVehicle(vehicle.id, { status: 'en_route' });

  // Update NGO capacity
  const remainingCap = Math.max(0, ngo.current_capacity_meals - surplus.quantity_meals);
  store.updateNGO(ngo.id, { current_capacity_meals: remainingCap });

  return delivery;
}

export function updateDeliveryStatus(deliveryId: string, status: 'assigned' | 'in_transit' | 'delivered' | 'cancelled'): DeliveryRecord {
  const delivery = store.getDeliveryById(deliveryId);
  if (!delivery) {
    throw new Error(`Delivery record ${deliveryId} not found`);
  }

  const now = new Date().toISOString();
  const updates: Partial<DeliveryRecord> = { status };

  if (status === 'in_transit' && !delivery.dispatched_at) {
    updates.dispatched_at = now;
    store.updateSurplus(delivery.surplus_id, { status: 'in_transit' });
    store.updateVehicle(delivery.vehicle_id, { status: 'en_route' });
  } else if (status === 'delivered') {
    updates.delivered_at = now;
    store.updateSurplus(delivery.surplus_id, { status: 'delivered' });
    store.updateVehicle(delivery.vehicle_id, { status: 'available' });
  } else if (status === 'cancelled') {
    store.updateSurplus(delivery.surplus_id, { status: 'available' });
    store.updateVehicle(delivery.vehicle_id, { status: 'available' });
    const ngo = store.getNGOById(delivery.ngo_id);
    if (ngo) {
      store.updateNGO(ngo.id, { current_capacity_meals: ngo.current_capacity_meals + delivery.quantity_meals });
    }
  }

  const updated = store.updateDelivery(deliveryId, updates);
  if (!updated) {
    throw new Error(`Failed to update delivery ${deliveryId}`);
  }
  return updated;
}

export function getAllDeliveries(): DeliveryRecord[] {
  return store.getDeliveries();
}

export function getDeliveryById(id: string): DeliveryRecord | undefined {
  return store.getDeliveryById(id);
}
