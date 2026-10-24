import React, { useState, useEffect } from 'react';
import { SurplusEvent, MatchingResult, MatchCandidate } from '../types';
import { api } from '../utils/api';
import {
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  Award,
  ChevronRight
} from 'lucide-react';

interface SmartMatchingProps {
  surplusListings: SurplusEvent[];
  selectedSurplusId?: string;
  onSelectSurplusId: (id: string) => void;
  onDispatchAssigned: (deliveryId: string) => void;
}

export const SmartMatching: React.FC<SmartMatchingProps> = ({
  surplusListings,
  selectedSurplusId,
  onSelectSurplusId,
  onDispatchAssigned
}) => {
  const [activeListingId, setActiveListingId] = useState<string>(selectedSurplusId || (surplusListings[0]?.id || ''));
  const [matchResult, setMatchResult] = useState<MatchingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSurplusId) {
      setActiveListingId(selectedSurplusId);
    } else if (surplusListings.length > 0 && !activeListingId) {
      setActiveListingId(surplusListings[0].id);
    }
  }, [selectedSurplusId, surplusListings]);

  useEffect(() => {
    if (activeListingId) {
      runMatching(activeListingId);
    }
  }, [activeListingId]);

  const runMatching = async (eventId: string) => {
    try {
      setLoading(true);
      setAssignmentSuccess(null);
      const res = await api.matching.recommend(eventId);
      setMatchResult(res);
    } catch (err) {
      console.error('Matching failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (candidate: MatchCandidate) => {
    if (!activeListingId) return;
    try {
      setIsAssigning(true);
      const delivery = await api.deliveries.assign({
        surplus_id: activeListingId,
        ngo_id: candidate.ngo.id,
        vehicle_id: candidate.vehicle?.id
      });
      setAssignmentSuccess(`Successfully assigned to ${candidate.ngo.name}! Delivery ${delivery.id} initialized.`);
      setTimeout(() => {
        onDispatchAssigned(delivery.id);
      }, 1200);
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const activeListing = surplusListings.find(s => s.id === activeListingId);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                UNIFIED CORE ENGINE
              </span>
              <span className="text-xs text-slate-400">
                ReRoute Logistics + Anya Nutrition Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Nutrition-Aware Recipient Matching
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Multi-factor algorithmic matching prioritizing NGOs based on local malnutrition severity, dietary nutrient synergies, travel distance, capacity, and safe shelf-life windows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Select Donation:</span>
            <select
              value={activeListingId}
              onChange={(e) => {
                setActiveListingId(e.target.value);
                onSelectSurplusId(e.target.value);
              }}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              {surplusListings.map(s => (
                <option key={s.id} value={s.id}>
                  {s.id}: {s.donor_name} ({s.quantity_meals} meals · {s.pickup_district})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {assignmentSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{assignmentSuccess}</span>
        </div>
      )}

      {/* Selected Donation Details Ribbon */}
      {activeListing && (
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-sm">{activeListing.donor_name}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {activeListing.pickup_district}, {activeListing.pickup_state}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>
              Portions: <strong className="text-emerald-400 font-bold">{activeListing.quantity_meals} meals</strong> ({activeListing.food_weight_kg} kg)
            </span>
            <span>
              Food: <strong className="text-slate-200 capitalize">{activeListing.food_type} ({activeListing.dietary_type})</strong>
            </span>
            <span>
              Storage: <strong className="text-amber-400 uppercase">{activeListing.storage_requirement.replace('_', ' ')}</strong>
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Deadline: {new Date(activeListing.expiry_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono">Evaluating hard constraints & scoring nutrition synergies...</span>
        </div>
      ) : matchResult ? (
        <div className="space-y-6">
          {/* Top Recommendation Highlight Card */}
          {matchResult.recommended ? (
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 rounded-2xl border-2 border-emerald-500/50 p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Best Match — Score: {matchResult.recommended.score}/100
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">TOP RECOMMENDED RECIPIENT</span>
                    <h2 className="text-2xl font-black text-white">{matchResult.recommended.ngo.name}</h2>
                    <p className="text-xs text-slate-400 flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {matchResult.recommended.ngo.address} ({matchResult.recommended.ngo.district}, {matchResult.recommended.ngo.state})
                    </p>
                  </div>

                  {/* Explainability Callout */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-500/30 text-xs text-slate-200 space-y-2">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Algorithmic Matching Rationale:
                    </div>
                    <p className="leading-relaxed">
                      {matchResult.recommended.reason}
                    </p>
                    <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-300">
                      <span className="font-bold text-amber-300">Nutritional Need Alignment: </span>
                      {matchResult.recommended.nutrition_insights.food_synergy_note}
                    </div>
                  </div>

                  {/* Score Breakdown Bar */}
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                      Scoring Factors Breakdown (Max 100 Pts):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                      <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400 text-[10px] block">Nutrition Priority (25)</span>
                        <span className="font-bold text-emerald-400">+{matchResult.recommended.score_breakdown.nutrition_vulnerability_score} pts</span>
                      </div>
                      <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400 text-[10px] block">Deficiency Synergy (15)</span>
                        <span className="font-bold text-teal-400">+{matchResult.recommended.score_breakdown.nutrient_synergy_score} pts</span>
                      </div>
                      <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400 text-[10px] block">Distance / Route (20)</span>
                        <span className="font-bold text-cyan-400">+{matchResult.recommended.score_breakdown.distance_efficiency_score} pts</span>
                      </div>
                      <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400 text-[10px] block">Capacity Match (15)</span>
                        <span className="font-bold text-blue-400">+{matchResult.recommended.score_breakdown.capacity_match_score} pts</span>
                      </div>
                      <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400 text-[10px] block">Reliability Score (15)</span>
                        <span className="font-bold text-indigo-400">+{matchResult.recommended.score_breakdown.ngo_reliability_score} pts</span>
                      </div>
                      <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400 text-[10px] block">Urgency Factor (10)</span>
                        <span className="font-bold text-amber-400">+{matchResult.recommended.score_breakdown.urgency_boost_score} pts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action Block */}
                <div className="lg:w-80 shrink-0 bg-slate-950/70 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distance (Haversine):</span>
                      <span className="font-bold text-white">{matchResult.recommended.distance_km} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Vehicle ETA:</span>
                      <span className="font-bold text-amber-300">~{matchResult.recommended.eta_minutes} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">NGO Daily Capacity:</span>
                      <span className="text-slate-200">{matchResult.recommended.ngo.daily_capacity_meals} meals/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Open Capacity:</span>
                      <span className="text-emerald-400 font-bold">{matchResult.recommended.ngo.current_capacity_meals} meals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Vehicle:</span>
                      <span className="text-slate-200">{matchResult.recommended.vehicle?.id || 'Pending fleet auto-assign'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Driver Contact:</span>
                      <span className="text-slate-200">{matchResult.recommended.vehicle?.driver_name || 'Fleet Operator'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssign(matchResult.recommended!)}
                    disabled={isAssigning}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 transition"
                  >
                    <Truck className="w-4 h-4" />
                    <span>{isAssigning ? 'Assigning...' : 'Assign Donation & Dispatch Route'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-rose-500/30 p-6 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Feasible Recipient Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active NGO satisfied all strict feasibility constraints (distance radius, open capacity, vehicle availability, and expiry deadline).
              </p>
            </div>
          )}

          {/* All Evaluated Candidates Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> All Evaluated Recipient Candidates ({matchResult.candidates.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">NGO Name</th>
                    <th className="py-2.5 px-3">District & State</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Distance / ETA</th>
                    <th className="py-2.5 px-3">Total Score</th>
                    <th className="py-2.5 px-3">Compatibility Reason</th>
                    <th className="py-2.5 px-3 rounded-r-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {matchResult.candidates.map((cand) => (
                    <tr key={cand.ngo.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3 font-semibold text-white">{cand.ngo.name}</td>
                      <td className="py-3 px-3 text-slate-400">{cand.ngo.district}, {cand.ngo.state}</td>
                      <td className="py-3 px-3">
                        {cand.feasible ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Feasible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" /> Infeasible
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {cand.distance_km} km (~{cand.eta_minutes}m)
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-sm text-emerald-400">
                        {cand.score > 0 ? `${cand.score}/100` : '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate" title={cand.reason}>
                        {cand.reason}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {cand.feasible && (
                          <button
                            onClick={() => handleAssign(cand)}
                            disabled={isAssigning}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition"
                          >
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
