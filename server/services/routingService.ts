import { store } from '../db/store.ts';
import type { SurplusEvent, FleetVehicle, RestaurantDonor, RecipientNGO } from '../types/index.ts';
import { calculateHaversineDistanceKm, estimateTravelTimeMinutes } from './matchingService.ts';

export interface RouteStop {
  stop_index: number;
  type: 'pickup' | 'dropoff';
  location_name: string;
  address: string;
  latitude: number;
  longitude: number;
  quantity_meals: number;
  expiry_at?: string;
  estimated_arrival_minutes: number;
  estimated_distance_leg_km: number;
  surplus_id: string;
}

export interface OptimizedVehicleRoute {
  vehicle_id: string;
  driver_name: string;
  capacity_meals: number;
  total_load_meals: number;
  total_distance_km: number;
  total_duration_minutes: number;
  distance_type: 'road_factor_estimated';
  stops: RouteStop[];
  waypoints: [number, number][];
  is_deadline_feasible: boolean;
}

export interface RouteOptimizationResult {
  routes: OptimizedVehicleRoute[];
  unassigned_events: SurplusEvent[];
  total_fleet_distance_km: number;
  total_fleet_time_minutes: number;
  total_meals_rescued: number;
  total_meals_at_risk: number;
  routing_engine: 'deterministic_nearest_expiry_first_with_road_circuity';
}

export function generateInterpolatedWaypoints(
  start: [number, number],
  end: [number, number],
  intermediateBends: number = 4
): [number, number][] {
  const points: [number, number][] = [start];
  for (let i = 1; i <= intermediateBends; i++) {
    const fraction = i / (intermediateBends + 1);
    // Add small realistic curvature so it looks like city roads rather than a sterile straight line
    const lateralJitter = Math.sin(fraction * Math.PI) * 0.003 * (i % 2 === 0 ? 1 : -1);
    const lat = start[0] + (end[0] - start[0]) * fraction + lateralJitter;
    const lng = start[1] + (end[1] - start[1]) * fraction + lateralJitter;
    points.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
  }
  points.push(end);
  return points;
}

export function optimizeFleetRoutes(currentTimeIso?: string): RouteOptimizationResult {
  const vehicles = store.getVehicles().filter(v => v.status === 'available');
  const availableSurplus = store.getSurplusEvents().filter(s => s.status === 'available' || s.status === 'assigned');
  const now = currentTimeIso ? new Date(currentTimeIso) : new Date();

  // Sort events by expiry time (earliest deadline first)
  const sortedEvents = [...availableSurplus].sort((a, b) => new Date(a.expiry_at).getTime() - new Date(b.expiry_at).getTime());

  const fleetState = vehicles.map(v => ({
    vehicle: v,
    current_lat: v.current_latitude,
    current_lng: v.current_longitude,
    load: 0,
    cumulative_distance_km: 0,
    cumulative_time_mins: 0,
    stops: [] as RouteStop[],
    waypoints: [] as [number, number][]
  }));

  const unassigned: SurplusEvent[] = [];

  for (const event of sortedEvents) {
    let bestOption: { fleetIdx: number; distanceKm: number; etaMins: number } | null = null;
    const minutesToExpiry = (new Date(event.expiry_at).getTime() - now.getTime()) / 60000;

    for (let i = 0; i < fleetState.length; i++) {
      const state = fleetState[i];
      if (state.load + event.quantity_meals <= state.vehicle.capacity_meals) {
        const straightDistance = calculateHaversineDistanceKm(state.current_lat, state.current_lng, event.latitude, event.longitude);
        const roadDistance = Number((straightDistance * 1.35).toFixed(1));
        const legEta = estimateTravelTimeMinutes(straightDistance);
        const arrivalTime = state.cumulative_time_mins + legEta;

        if (arrivalTime < minutesToExpiry) {
          if (!bestOption || arrivalTime < bestOption.etaMins) {
            bestOption = { fleetIdx: i, distanceKm: roadDistance, etaMins: legEta };
          }
        }
      }
    }

    if (!bestOption) {
      unassigned.push(event);
    } else {
      const state = fleetState[bestOption.fleetIdx];
      const startPoint: [number, number] = [state.current_lat, state.current_lng];
      const endPoint: [number, number] = [event.latitude, event.longitude];

      state.load += event.quantity_meals;
      state.cumulative_distance_km = Number((state.cumulative_distance_km + bestOption.distanceKm).toFixed(1));
      state.cumulative_time_mins += bestOption.etaMins;

      state.stops.push({
        stop_index: state.stops.length + 1,
        type: 'pickup',
        location_name: event.donor_name || 'Food Donor',
        address: event.pickup_address,
        latitude: event.latitude,
        longitude: event.longitude,
        quantity_meals: event.quantity_meals,
        expiry_at: event.expiry_at,
        estimated_arrival_minutes: state.cumulative_time_mins,
        estimated_distance_leg_km: bestOption.distanceKm,
        surplus_id: event.id
      });

      const legWaypoints = generateInterpolatedWaypoints(startPoint, endPoint);
      state.waypoints.push(...legWaypoints);
      state.current_lat = event.latitude;
      state.current_lng = event.longitude;
    }
  }

  const routes: OptimizedVehicleRoute[] = fleetState
    .filter(s => s.stops.length > 0)
    .map(s => ({
      vehicle_id: s.vehicle.id,
      driver_name: s.vehicle.driver_name,
      capacity_meals: s.vehicle.capacity_meals,
      total_load_meals: s.load,
      total_distance_km: s.cumulative_distance_km,
      total_duration_minutes: s.cumulative_time_mins,
      distance_type: 'road_factor_estimated',
      stops: s.stops,
      waypoints: s.waypoints,
      is_deadline_feasible: true
    }));

  const totalDist = Number(routes.reduce((sum, r) => sum + r.total_distance_km, 0).toFixed(1));
  const totalMins = routes.reduce((sum, r) => sum + r.total_duration_minutes, 0);
  const rescuedMeals = routes.reduce((sum, r) => sum + r.total_load_meals, 0);
  const mealsAtRisk = unassigned.reduce((sum, e) => sum + e.quantity_meals, 0);

  return {
    routes,
    unassigned_events: unassigned,
    total_fleet_distance_km: totalDist,
    total_fleet_time_minutes: totalMins,
    total_meals_rescued: rescuedMeals,
    total_meals_at_risk: mealsAtRisk,
    routing_engine: 'deterministic_nearest_expiry_first_with_road_circuity'
  };
}

// K-medoids Hub Optimization
export function optimizeHubLocations(k: number = 3) {
  const restaurants = store.getRestaurants();
  const validK = Math.max(1, Math.min(k, restaurants.length));

  // Initialize medoids evenly spaced
  let medoids = Array.from({ length: validK }, (_, i) => restaurants[Math.floor((i * restaurants.length) / validK)]);

  for (let iter = 0; iter < 4; iter++) {
    const clusters: RestaurantDonor[][] = medoids.map(() => []);
    restaurants.forEach(r => {
      let bestMedoidIdx = 0;
      let minDistance = Infinity;
      medoids.forEach((m, idx) => {
        const d = calculateHaversineDistanceKm(r.latitude, r.longitude, m.latitude, m.longitude);
        if (d < minDistance) {
          minDistance = d;
          bestMedoidIdx = idx;
        }
      });
      clusters[bestMedoidIdx].push(r);
    });

    medoids = clusters.map((cluster, idx) => {
      if (cluster.length === 0) return medoids[idx];
      let bestCandidate = cluster[0];
      let minTotalDist = Infinity;
      cluster.forEach(candidate => {
        const totalDist = cluster.reduce((sum, other) => sum + calculateHaversineDistanceKm(candidate.latitude, candidate.longitude, other.latitude, other.longitude), 0);
        if (totalDist < minTotalDist) {
          minTotalDist = totalDist;
          bestCandidate = candidate;
        }
      });
      return bestCandidate;
    });
  }

  const hubs = medoids.map((m, i) => {
    const served = restaurants.filter(r => {
      const closestMedoid = medoids.reduce((bestIdx, medoid, idx) => {
        const dist = calculateHaversineDistanceKm(r.latitude, r.longitude, medoid.latitude, medoid.longitude);
        const bestDist = calculateHaversineDistanceKm(r.latitude, r.longitude, medoids[bestIdx].latitude, medoids[bestIdx].longitude);
        return dist < bestDist ? idx : bestIdx;
      }, 0);
      return closestMedoid === i;
    });

    const avgDist = served.length > 0
      ? Number((served.reduce((sum, r) => sum + calculateHaversineDistanceKm(r.latitude, r.longitude, m.latitude, m.longitude), 0) / served.length).toFixed(1))
      : 0;

    return {
      hub_id: `HUB-${i + 1}`,
      recommended_hub_location: {
        name: m.name,
        address: m.address,
        district: m.district,
        state: m.state,
        latitude: m.latitude,
        longitude: m.longitude
      },
      donors_served_count: served.length,
      average_coverage_radius_km: avgDist,
      estimated_aggregation_capacity_meals: served.length * 120
    };
  });

  return {
    k: validK,
    algorithm: 'k-medoids clustering with haversine distance metric',
    hubs
  };
}
