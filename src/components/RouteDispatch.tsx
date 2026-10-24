import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  Route,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingDown,
  Navigation,
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';

export const RouteDispatch: React.FC = () => {
  const [routePlan, setRoutePlan] = useState<any | null>(null);
  const [hubsPlan, setHubsPlan] = useState<any | null>(null);
  const [simResults, setSimResults] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'routes' | 'hubs' | 'simulation'>('routes');

  useEffect(() => {
    loadRoutingData();
  }, []);

  const loadRoutingData = async () => {
    try {
      setLoading(true);
      const [routes, hubs, sim] = await Promise.all([
        api.routing.optimizeRoutes(),
        api.routing.optimizeHubs(3),
        api.routing.runSimulation()
      ]);
      setRoutePlan(routes);
      setHubsPlan(hubs);
      setSimResults(sim);
    } catch (err) {
      console.error('Failed to load routing data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            REROUTE FLEET LOGISTICS
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Route Optimization & Fleet Dispatch
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Earliest-expiry-first stop sequencing with road network circuity model (1.35x), vehicle capacity constraints, and aggregation hub clustering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('routes')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'routes' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Fleet Routes ({routePlan?.routes?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('hubs')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'hubs' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            K-Medoids Hubs
          </button>
          <button
            onClick={() => setActiveSubTab('simulation')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'simulation' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Network Simulation
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono">Optimizing vehicle schedules and waypoint trajectories...</span>
        </div>
      ) : activeSubTab === 'routes' ? (
        <div className="space-y-6">
          {/* Metrics ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Active Vehicles</span>
              <span className="text-xl font-bold text-white">{routePlan?.routes?.length || 0}</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Total Rescued Meals</span>
              <span className="text-xl font-bold text-emerald-400">{routePlan?.total_meals_rescued || 0}</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Fleet Road Distance</span>
              <span className="text-xl font-bold text-cyan-400">{routePlan?.total_fleet_distance_km || 0} km</span>
              <span className="text-[10px] text-slate-500 block">1.35x circuity factor</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Cumulative Fleet Transit</span>
              <span className="text-xl font-bold text-amber-400">{routePlan?.total_fleet_time_minutes || 0} mins</span>
            </div>
          </div>

          {/* Routes list */}
          <div className="space-y-4">
            {routePlan?.routes?.map((route: any) => (
              <div key={route.vehicle_id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Vehicle {route.vehicle_id}</h3>
                      <p className="text-xs text-slate-400">
                        Driver: <span className="text-slate-200">{route.driver_name}</span> · Capacity: {route.total_load_meals}/{route.capacity_meals} meals
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                      Distance: <strong>{route.total_distance_km} km</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                      Duration: <strong>~{route.total_duration_minutes} mins</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      ✓ Feasible Deadlines
                    </span>
                  </div>
                </div>

                {/* Waypoint Stops Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
                    Scheduled Stops Sequence (Earliest Expiry First):
                  </h4>
                  <div className="space-y-3">
                    {route.stops.map((stop: any, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {stop.stop_index}
                        </div>
                        <div className="flex-1 bg-slate-800/50 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-bold text-white text-sm">{stop.location_name}</span>
                            <p className="text-slate-400 text-[11px]">{stop.address}</p>
                          </div>
                          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-300">
                            <span>Pickup: <strong className="text-emerald-400">{stop.quantity_meals} meals</strong></span>
                            <span>Leg: <strong>{stop.estimated_distance_leg_km} km</strong></span>
                            <span>Arrival: <strong>+{stop.estimated_arrival_minutes}m</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeSubTab === 'hubs' ? (
        /* K-medoids hubs */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" /> K-Medoids Optimal Collection Hubs
          </h3>
          <p className="text-xs text-slate-400">
            Calculates optimal aggregation nodes minimizing total transit distance from decentralized food donors into centralized cold-chain collection points.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
            {hubsPlan?.hubs?.map((hub: any) => (
              <div key={hub.hub_id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">{hub.hub_id}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                    Serves {hub.donors_served_count} Donors
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{hub.recommended_hub_location.name}</h4>
                  <p className="text-xs text-slate-400">{hub.recommended_hub_location.district}, {hub.recommended_hub_location.state}</p>
                </div>
                <div className="pt-2 border-t border-slate-700/60 text-xs font-mono text-slate-300 flex justify-between">
                  <span>Avg Coverage Radius:</span>
                  <strong className="text-cyan-300">{hub.average_coverage_radius_km} km</strong>
                </div>
                <div className="text-xs font-mono text-slate-300 flex justify-between">
                  <span>Aggregation Capacity:</span>
                  <strong className="text-amber-300">{hub.estimated_aggregation_capacity_meals} meals</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Simulation comparison */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-400" /> Operational Simulation: Baseline vs ReRoute Integrated
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Baseline */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-rose-500/30 space-y-4">
              <span className="text-xs font-mono uppercase text-rose-400 font-bold block">
                Standard Ad-Hoc Redistribution (Baseline)
              </span>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recovered Meals:</span>
                  <span className="font-bold text-white">{simResults?.baseline?.recovered_meals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Food Wasted from Expiry:</span>
                  <span className="font-bold text-rose-400">{simResults?.baseline?.expired_meals_wasted} meals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Pickup Window:</span>
                  <span className="font-bold text-amber-300">~{simResults?.baseline?.average_pickup_time_minutes} mins</span>
                </div>
              </div>
            </div>

            {/* ReRoute */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/40 space-y-4 shadow-lg shadow-emerald-950/20">
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold block">
                ReRoute Integrated Optimization
              </span>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recovered Meals:</span>
                  <span className="font-bold text-emerald-400">{simResults?.reroute_integrated?.recovered_meals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Food Wasted from Expiry:</span>
                  <span className="font-bold text-emerald-300">{simResults?.reroute_integrated?.expired_meals_wasted} meals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Pickup Window:</span>
                  <span className="font-bold text-cyan-300">~{simResults?.reroute_integrated?.average_pickup_time_minutes} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fleet Route Distance:</span>
                  <span className="font-bold text-white">{simResults?.reroute_integrated?.total_road_distance_km} km</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">
            *{simResults?.provenance}
          </p>
        </div>
      )}
    </div>
  );
};
