import { store } from '../db/store.ts';
import type { DeliveryRecord, DeliveryStatus, RecoveryPathway, SurplusStatus, ProviderRating } from '../types/index.ts';
import { calculateHaversineDistanceKm, estimateTravelTimeMinutes } from './matchingService.ts';

export interface AssignDeliveryInput {
  surplus_id: string;
  ngo_id: string;
  vehicle_id?: string;
}

export function calculateEnvironmentalImpact(
  foodWeightKg: number, 
  mealsCount: number, 
  pathway: RecoveryPathway = 'human_consumption'
) {
  // Documented LCA parameters:
  // Human consumption: 
  //   1 kg food waste averted = 2.5 kg CO2 equivalent emissions prevented (FAO / UNEP Food Waste Index 2024)
  //   1 kg food saved = 750 liters embedded agricultural water conserved (Water Footprint Network India)
  //   1 meal saved = ₹65 estimated consumer replacement value
  // Organic Composting / Bio-recovery:
  //   1 kg diverted to compost = 0.85 kg CO2e prevented (EPA WARM anaerobic landfill methane avoided)
  //   0.25 kg organic soil compost generated per 1 kg wet food waste
  //   ₹8 / kg organic compost market value
  // Disposal:
  //   0 offsets

  if (pathway === 'composting_resource_recovery') {
    const compostKg = Number((foodWeightKg * 0.25).toFixed(1));
    return {
      co2_avoided_kg: Number((foodWeightKg * 0.85).toFixed(1)),
      water_saved_liters: 0,
      economic_value_inr: Math.round(compostKg * 8),
      compost_generated_kg: compostKg
    };
  }

  if (pathway === 'disposal') {
    return {
      co2_avoided_kg: 0,
      water_saved_liters: 0,
      economic_value_inr: 0,
      compost_generated_kg: 0
    };
  }

  return {
    co2_avoided_kg: Number((foodWeightKg * 2.5).toFixed(1)),
    water_saved_liters: Math.round(foodWeightKg * 750),
    economic_value_inr: Math.round(mealsCount * 65),
    compost_generated_kg: 0
  };
}

export function assignDonationToNGO(input: AssignDeliveryInput): DeliveryRecord {
  const surplus = store.getSurplusById(input.surplus_id);
  if (!surplus) {
    throw new Error(`Surplus listing ${input.surplus_id} not found`);
  }
  if (['delivered', 'diverted_to_compost', 'disposed'].includes(surplus.status)) {
    throw new Error(`Surplus listing ${input.surplus_id} is already processed (${surplus.status})`);
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
  const impact = calculateEnvironmentalImpact(surplus.food_weight_kg, surplus.quantity_meals, 'human_consumption');

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

export function updateDeliveryStatus(
  deliveryId: string, 
  status: DeliveryStatus,
  pathway?: RecoveryPathway,
  notes?: string
): DeliveryRecord {
  const delivery = store.getDeliveryById(deliveryId);
  if (!delivery) {
    throw new Error(`Delivery record ${deliveryId} not found`);
  }

  const surplus = store.getSurplusById(delivery.surplus_id);
  const now = new Date().toISOString();
  const updates: Partial<DeliveryRecord> = { status };

  if (notes) {
    updates.recovery_notes = notes;
  }

  // FOOD SAFETY ENFORCEMENT:
  // If attempting to deliver for human consumption, verify safe consumption deadline has not expired.
  if (status === 'delivered') {
    if (surplus && surplus.expiry_at) {
      const expiryTimestamp = new Date(surplus.expiry_at).getTime();
      const currentTimestamp = Date.now();
      if (currentTimestamp > expiryTimestamp) {
        throw new Error(
          `Food Safety Violation: Surplus listing ${surplus.id} expired at ${surplus.expiry_at}. ` +
          `Expired food cannot be redistributed for human consumption. ` +
          `Please divert this batch to composting / resource recovery or safe disposal.`
        );
      }
    }

    updates.recovery_pathway = pathway || 'human_consumption';
    updates.delivered_at = now;
    updates.environmental_impact = calculateEnvironmentalImpact(
      delivery.food_weight_kg, 
      delivery.quantity_meals, 
      'human_consumption'
    );

    store.updateSurplus(delivery.surplus_id, { status: 'delivered' });
    store.updateVehicle(delivery.vehicle_id, { status: 'available' });

  } else if (status === 'diverted_to_compost') {
    // Divert batch to organic composting / bio-resource recovery
    updates.recovery_pathway = 'composting_resource_recovery';
    updates.recovery_notes = notes || 'Diverted to local aerobic bio-composting unit for soil amendment.';
    updates.delivered_at = now;
    updates.environmental_impact = calculateEnvironmentalImpact(
      delivery.food_weight_kg, 
      delivery.quantity_meals, 
      'composting_resource_recovery'
    );

    store.updateSurplus(delivery.surplus_id, { status: 'diverted_to_compost' });
    store.updateVehicle(delivery.vehicle_id, { status: 'available' });

  } else if (status === 'disposed') {
    // Safely discard spoiled/non-recoverable waste
    updates.recovery_pathway = 'disposal';
    updates.recovery_notes = notes || 'Disposed via compliant municipal organic waste stream.';
    updates.delivered_at = now;
    updates.environmental_impact = calculateEnvironmentalImpact(
      delivery.food_weight_kg, 
      delivery.quantity_meals, 
      'disposal'
    );

    store.updateSurplus(delivery.surplus_id, { status: 'disposed' });
    store.updateVehicle(delivery.vehicle_id, { status: 'available' });

  } else if (status === 'in_transit') {
    if (!delivery.dispatched_at) {
      updates.dispatched_at = now;
    }
    store.updateSurplus(delivery.surplus_id, { status: 'in_transit' });
    store.updateVehicle(delivery.vehicle_id, { status: 'en_route' });

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

function attachProviderRating(delivery: DeliveryRecord): DeliveryRecord {
  return { ...delivery, provider_rating: store.getProviderRatingByDeliveryId(delivery.id) };
}

export function getAllDeliveries(): DeliveryRecord[] {
  return store.getDeliveries().map(attachProviderRating);
}

export function getDeliveryById(id: string): DeliveryRecord | undefined {
  const delivery = store.getDeliveryById(id);
  return delivery ? attachProviderRating(delivery) : undefined;
}

export function rateProviderForDelivery(deliveryId: string, ratingValue: number): ProviderRating {
  if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    throw new Error('Rating must be a whole number from 1 to 5');
  }

  const delivery = store.getDeliveryById(deliveryId);
  if (!delivery) throw new Error(`Delivery '${deliveryId}' not found`);
  if (delivery.status !== 'delivered') {
    throw new Error('Providers can only be rated after a verified NGO handover');
  }

  return store.upsertProviderRating({
    delivery_id: delivery.id,
    provider_id: delivery.donor_id,
    ngo_id: delivery.ngo_id,
    rating: ratingValue,
    created_at: new Date().toISOString()
  });
}
