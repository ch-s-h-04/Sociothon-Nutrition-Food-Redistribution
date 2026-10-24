import {
  DistrictSummary,
  DistrictDetail,
  RestaurantDonor,
  RecipientNGO,
  FleetVehicle,
  SurplusEvent,
  MatchingResult,
  DeliveryRecord,
  ImpactMetrics,
  ProviderLeaderboardEntry,
  SurplusStatus,
  DeliveryStatus,
  RecoveryPathway
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status} ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.error) msg = errData.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  // Nutrition Intelligence
  nutrition: {
    getDistricts: () => fetchJson<{ total: number; districts: DistrictSummary[]; metadata: any }>('/nutrition/districts'),
    getDistrictById: (id: string) => fetchJson<DistrictDetail>(`/nutrition/districts/${id}`),
    getStatesOverview: () => fetchJson<{ states: any[] }>('/nutrition/states')
  },

  // Food Surplus Management
  surplus: {
    getAll: (status?: SurplusStatus) => fetchJson<SurplusEvent[]>(`/surplus${status ? `?status=${status}` : ''}`),
    getById: (id: string) => fetchJson<SurplusEvent>(`/surplus/${id}`),
    create: (data: Partial<SurplusEvent>) => fetchJson<SurplusEvent>('/surplus', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: SurplusStatus, metadata?: any) =>
      fetchJson<SurplusEvent>(`/surplus/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, ...metadata }) }),
    delete: (id: string) => fetchJson<{ success: boolean }>(`/surplus/${id}`, { method: 'DELETE' })
  },

  // Nutrition-Aware Smart Matching
  matching: {
    recommend: (eventId: string, now?: string) =>
      fetchJson<MatchingResult>('/matching/recommend', { method: 'POST', body: JSON.stringify({ event_id: eventId, now }) })
  },

  // Routing & Fleet Optimization
  routing: {
    optimizeRoutes: (now?: string) => fetchJson<any>('/routes/optimize', { method: 'POST', body: JSON.stringify({ now }) }),
    optimizeHubs: (k: number = 3) => fetchJson<any>('/routes/hubs', { method: 'POST', body: JSON.stringify({ k }) }),
    runSimulation: () => fetchJson<any>('/routes/simulation', { method: 'POST' })
  },

  // Delivery Tracking & Lifecycle
  deliveries: {
    getAll: () => fetchJson<DeliveryRecord[]>('/deliveries'),
    getById: (id: string) => fetchJson<DeliveryRecord>(`/deliveries/${id}`),
    assign: (data: { surplus_id: string; ngo_id: string; vehicle_id?: string }) =>
      fetchJson<DeliveryRecord>('/deliveries/assign', { method: 'POST', body: JSON.stringify(data) }),
    reserve: (data: { surplus_id: string; ngo_id: string; vehicle_id?: string }) =>
      fetchJson<DeliveryRecord>('/deliveries/reserve', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: DeliveryStatus, recovery_pathway?: RecoveryPathway, notes?: string) =>
      fetchJson<DeliveryRecord>(`/deliveries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, recovery_pathway, notes }) }),
    rateProvider: (id: string, rating: number) =>
      fetchJson(`/deliveries/${id}/provider-rating`, { method: 'POST', body: JSON.stringify({ rating }) })
  },

  // Impact & The Paradox Metrics
  impact: {
    getMetrics: () => fetchJson<ImpactMetrics>('/impact')
  },

  providers: {
    getLeaderboard: () => fetchJson<{
      providers: ProviderLeaderboardEntry[];
      methodology: { reliability: number; ngo_rating: number; safety: number; handover: number; verification: number; principle: string };
    }>('/providers/leaderboard')
  },

  // Entity Management & Reset
  entities: {
    getRestaurants: () => fetchJson<RestaurantDonor[]>('/restaurants'),
    createRestaurant: (data: any) => fetchJson<RestaurantDonor>('/restaurants', { method: 'POST', body: JSON.stringify(data) }),
    getNGOs: () => fetchJson<RecipientNGO[]>('/ngos'),
    createNGO: (data: any) => fetchJson<RecipientNGO>('/ngos', { method: 'POST', body: JSON.stringify(data) }),
    getVehicles: () => fetchJson<FleetVehicle[]>('/vehicles'),
    resetDatabase: () => fetchJson<{ message: string }>('/admin/reset', { method: 'POST' })
  }
};
