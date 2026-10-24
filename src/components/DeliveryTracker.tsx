import React, { useState, useEffect } from 'react';
import { DeliveryRecord, DeliveryStatus, RecoveryPathway } from '../types';
import { api } from '../utils/api';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  RefreshCw,
  Package,
  Leaf,
  Droplets,
  IndianRupee,
  ShieldCheck,
  Sprout,
  AlertTriangle,
  Trash2,
  ShieldAlert
} from 'lucide-react';

interface DeliveryTrackerProps {
  highlightDeliveryId?: string;
  onRefreshParent: () => void;
}

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({
  highlightDeliveryId,
  onRefreshParent
}) => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveries();
  }, [highlightDeliveryId]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.deliveries.getAll();
      setDeliveries(res);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: string, 
    newStatus: DeliveryStatus, 
    pathway?: RecoveryPathway,
    notes?: string
  ) => {
    try {
      setUpdatingId(id);
      await api.deliveries.updateStatus(id, newStatus, pathway, notes);
      await loadDeliveries();
      onRefreshParent();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'assigned':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">1. Reserved</span>;
      case 'in_transit':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">2. Collection in progress</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">3. Delivered (Human Redistribution)</span>;
      case 'diverted_to_compost':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-lime-500/20 text-lime-300 border border-lime-500/30">3. Diverted to Bio-Composting</span>;
      case 'disposed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">3. Safely Disposed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            SOCIOTHON 2026 · COLLECTION & RESOURCE RECOVERY
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Food Reservation & Recovery Tracking
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            End-to-end custody verification. Validates safe consumption deadlines, prevents unsafe distribution of expired food, and enables organic bio-composting diversion for non-edible surplus.
          </p>
        </div>

        <button
          onClick={loadDeliveries}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Dispatches</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-mono">
          Loading delivery dispatches...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Food Reservations Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Go to the NGO Matching tab and reserve an available food donation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((del) => {
            const isTarget = highlightDeliveryId === del.id;
            return (
              <div
                key={del.id}
                className={`bg-slate-900 rounded-2xl border p-6 transition shadow-xl ${
                  isTarget
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{del.id}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-xs text-slate-400">Surplus ID: {del.surplus_id}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <h3 className="text-lg font-bold text-white">{del.donor_name}</h3>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-lg font-bold text-emerald-300">{del.ngo_name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span>Assigned: {new Date(del.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(del.status)}
                    <span className="font-mono text-xs text-slate-300">
                      Est. Distance: <strong>{del.estimated_distance_km} km</strong> (~{del.estimated_time_minutes}m)
                    </span>
                  </div>
                </div>

                {/* Progress Steps State Machine */}
                <div className="py-4">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">1. Assigned at Donor</span>
                    <span className="text-slate-400">2. Collection Transit & Inspection</span>
                    <span className="text-slate-400">3. Verified Recovery Handover</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        del.status === 'assigned'
                          ? 'w-1/3 bg-amber-400'
                          : del.status === 'in_transit'
                          ? 'w-2/3 bg-blue-400'
                          : del.status === 'diverted_to_compost'
                          ? 'w-full bg-lime-400'
                          : del.status === 'disposed'
                          ? 'w-full bg-rose-500'
                          : 'w-full bg-emerald-400'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Environmental Offsets Card */}
                {del.status === 'diverted_to_compost' ? (
                  <div className="bg-lime-950/20 p-4 rounded-xl border border-lime-500/30 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Diverted Waste</span>
                      <span className="font-bold text-lime-300 text-sm">{del.food_weight_kg} kg</span>
                      <span className="text-slate-500 text-[10px] block">Landfill diversion</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-lime-400" /> Methane Avoided
                      </span>
                      <span className="font-bold text-lime-400 text-sm">{del.environmental_impact.co2_avoided_kg} kg CO₂e</span>
                      <span className="text-slate-500 text-[10px] block">EPA WARM 0.85 kg/kg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase flex items-center gap-1">
                        <Sprout className="w-3 h-3 text-emerald-400" /> Compost Yield
                      </span>
                      <span className="font-bold text-emerald-400 text-sm">{del.environmental_impact.compost_generated_kg || (del.food_weight_kg * 0.25).toFixed(1)} kg</span>
                      <span className="text-slate-500 text-[10px] block">Soil organic amendment</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-amber-400" /> Compost Value
                      </span>
                      <span className="font-bold text-amber-400 text-sm">₹{del.environmental_impact.economic_value_inr}</span>
                      <span className="text-slate-500 text-[10px] block">₹8/kg compost value</span>
                    </div>
                  </div>
                ) : del.status === 'disposed' ? (
                  <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/30 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Disposed Weight</span>
                      <span className="font-bold text-rose-300 text-sm">{del.food_weight_kg} kg</span>
                      <span className="text-slate-500 text-[10px] block">Municipal waste</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase flex items-center gap-1">
                        <Trash2 className="w-3 h-3 text-rose-400" /> CO₂ Offset
                      </span>
                      <span className="font-bold text-slate-400 text-sm">0 kg CO₂e</span>
                      <span className="text-slate-500 text-[10px] block">Non-recovered</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-slate-500" /> Water Saved
                      </span>
                      <span className="font-bold text-slate-400 text-sm">0 L</span>
                      <span className="text-slate-500 text-[10px] block">Lost to landfill</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-slate-500" /> Economic Value
                      </span>
                      <span className="font-bold text-slate-400 text-sm">₹0</span>
                      <span className="text-slate-500 text-[10px] block">Total write-off</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Quantity</span>
                      <span className="font-bold text-white text-sm">{del.quantity_meals} meals</span>
                      <span className="text-slate-500 text-[10px] block">({del.food_weight_kg} kg)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-emerald-400" /> CO₂ Avoided
                      </span>
                      <span className="font-bold text-emerald-400 text-sm">{del.environmental_impact.co2_avoided_kg} kg CO₂e</span>
                      <span className="text-slate-500 text-[10px] block">2.5 kg CO₂/kg food</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase flex items-center gap-1">
                        <Droplets className="w-3.5 h-3 text-cyan-400" /> Water Saved
                      </span>
                      <span className="font-bold text-cyan-400 text-sm">{del.environmental_impact.water_saved_liters.toLocaleString()} L</span>
                      <span className="text-slate-500 text-[10px] block">750 L/kg food</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-amber-400" /> Economic Value
                      </span>
                      <span className="font-bold text-amber-400 text-sm">₹{del.environmental_impact.economic_value_inr.toLocaleString()}</span>
                      <span className="text-slate-500 text-[10px] block">₹65/meal saved</span>
                    </div>
                  </div>
                )}

                {/* State Machine Transition Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    {del.dispatched_at && (
                      <span className="mr-3">Dispatched: {new Date(del.dispatched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                    {del.delivered_at && (
                      <span className="text-emerald-400 font-semibold">Completed: {new Date(del.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                    {del.recovery_notes && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{del.recovery_notes}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {del.status === 'assigned' && (
                      <button
                        onClick={() => handleUpdateStatus(del.id, 'in_transit')}
                        disabled={updatingId === del.id}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>{updatingId === del.id ? 'Updating...' : 'Start collection'}</span>
                      </button>
                    )}

                    {del.status === 'in_transit' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(del.id, 'delivered', 'human_consumption')}
                          disabled={updatingId === del.id}
                          title="Confirm edible food handover for human consumption"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Redistribute (Edible)</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(del.id, 'diverted_to_compost', 'composting_resource_recovery', 'Diverted to aerobic bio-composting unit for soil recovery.')}
                          disabled={updatingId === del.id}
                          title="Divert to composting facility if safe consumption window passed"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-lime-600 hover:bg-lime-700 text-white shadow-md shadow-lime-600/20 transition flex items-center gap-1.5"
                        >
                          <Sprout className="w-3.5 h-3.5" />
                          <span>Divert to Compost</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(del.id, 'disposed', 'disposal', 'Safely discarded via compliant municipal waste stream.')}
                          disabled={updatingId === del.id}
                          title="Discard if spoiled/contaminated"
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Dispose</span>
                        </button>
                      </>
                    )}

                    {del.status === 'delivered' && (
                      <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Human Redistribution Verified
                      </span>
                    )}

                    {del.status === 'diverted_to_compost' && (
                      <span className="text-xs font-mono text-lime-400 font-semibold flex items-center gap-1">
                        <Sprout className="w-4 h-4 text-lime-400" /> Bio-Composting Recovery Verified
                      </span>
                    )}

                    {del.status === 'disposed' && (
                      <span className="text-xs font-mono text-rose-400 font-semibold flex items-center gap-1">
                        <Trash2 className="w-4 h-4 text-rose-400" /> Safe Municipal Disposal Logged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
