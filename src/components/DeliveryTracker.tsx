import React, { useState, useEffect } from 'react';
import { DeliveryRecord } from '../types';
import { api } from '../utils/api';
import {
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  RefreshCw,
  Package,
  Leaf,
  Droplets,
  IndianRupee,
  ShieldCheck
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

  const handleUpdateStatus = async (id: string, newStatus: 'in_transit' | 'delivered') => {
    try {
      setUpdatingId(id);
      await api.deliveries.updateStatus(id, newStatus);
      await loadDeliveries();
      onRefreshParent();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">1. Assigned (Driver Dispatched)</span>;
      case 'in_transit':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">2. En Route / In Transit</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">3. Successfully Delivered</span>;
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
            LIFECYCLE STATE MACHINE
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Real-Time Delivery & Dispatch Tracking
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Operational verification from pickup to NGO handover. Each completed transaction calculates audited environmental offsets and updates the national impact dashboard.
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
          <Truck className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Delivery Dispatches Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Go to the Smart NGO Matching tab and click "Assign Donation & Dispatch Route" on any available surplus listing.
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
                      <span>Vehicle: <strong className="text-slate-200">{del.vehicle_id}</strong></span>
                      <span>Driver: <strong className="text-slate-200">{del.driver_name}</strong></span>
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
                    <span className="text-slate-400">1. Assigned at Depot</span>
                    <span className="text-slate-400">2. En Route to Recipient</span>
                    <span className="text-slate-400">3. Handover Confirmed</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        del.status === 'assigned'
                          ? 'w-1/3 bg-amber-400'
                          : del.status === 'in_transit'
                          ? 'w-2/3 bg-blue-400'
                          : 'w-full bg-emerald-400'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Environmental Offsets Card */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Delivered Quantity</span>
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
                      <Droplets className="w-3 h-3 text-cyan-400" /> Water Saved
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

                {/* State Machine Transition Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {del.dispatched_at && (
                      <span className="mr-3">Dispatched: {new Date(del.dispatched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                    {del.delivered_at && (
                      <span className="text-emerald-400 font-semibold">Delivered: {new Date(del.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {del.status === 'assigned' && (
                      <button
                        onClick={() => handleUpdateStatus(del.id, 'in_transit')}
                        disabled={updatingId === del.id}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{updatingId === del.id ? 'Updating...' : 'Start Transit / Picked Up'}</span>
                      </button>
                    )}

                    {del.status === 'in_transit' && (
                      <button
                        onClick={() => handleUpdateStatus(del.id, 'delivered')}
                        disabled={updatingId === del.id}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{updatingId === del.id ? 'Completing...' : 'Confirm Handover & Deliver'}</span>
                      </button>
                    )}

                    {del.status === 'delivered' && (
                      <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Handover Complete & Verified
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
