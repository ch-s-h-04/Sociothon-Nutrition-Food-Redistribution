import React, { useState, useEffect } from 'react';
import { ImpactMetrics } from '../types';
import { api } from '../utils/api';
import {
  BarChart3,
  TrendingDown,
  Globe2,
  Leaf,
  Droplets,
  IndianRupee,
  ShieldAlert,
  Info,
  Clock,
  Award,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const ImpactDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [liveCounterKg, setLiveCounterKg] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const data = await api.impact.getMetrics();
        setMetrics(data);
        setLiveCounterKg(data.macro_context_india.live_waste_tracker.estimated_india_waste_kg_current_year);
      } catch (err) {
        console.error('Failed to load impact metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();

    // Live counter incrementer (approx 2474.89 kg/sec -> ~247.5 kg every 100ms)
    const interval = setInterval(() => {
      setLiveCounterKg(prev => prev + 247.49);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner with Real-Time Waste Counter */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 p-6 rounded-2xl border border-rose-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
              THE INDIA PARADOX
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Food Waste Crisis vs. Zero-Hunger Opportunity
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              India wastes ~78 million tonnes of food annually (UNEP 2024), while ranking 102nd in the Global Hunger Index. ReRoute + Anya directly intercepts surplus to feed vulnerable districts.
            </p>
          </div>

          {/* Live Ticker */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-500/40 shadow-inner text-right shrink-0">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Live Estimated Food Waste in India (2026)
            </span>
            <div className="font-mono font-black text-2xl sm:text-3xl text-rose-300 mt-1">
              {Math.floor(liveCounterKg).toLocaleString()} <span className="text-sm text-slate-400 font-normal">kg</span>
            </div>
            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
              Rate: ~2,475 kg wasted every single second (UNEP 2024 baseline)
            </span>
          </div>
        </div>
      </div>

      {/* Platform Real-World Contribution Grid */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Verified Platform Redistribution Impact
            </h2>
            <p className="text-xs text-slate-400">
              Audited outcomes derived directly from recorded and delivered donations on this platform.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
            Realtime Audit Log
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs block uppercase">Meals Delivered</span>
            <span className="text-2xl font-black text-emerald-400">
              {metrics?.operational_impact.total_meals_delivered || 0}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              ({metrics?.operational_impact.total_food_weight_kg_rescued || 0} kg food)
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs block uppercase flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> CO₂ Avoided
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {metrics?.operational_impact.environmental_offsets.co2_emissions_averted_kg || 0} <span className="text-sm text-slate-400">kg</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              2.5 kg CO₂e / kg food saved
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs block uppercase flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Water Saved
            </span>
            <span className="text-2xl font-black text-cyan-400">
              {(metrics?.operational_impact.environmental_offsets.water_footprint_saved_liters || 0).toLocaleString()} <span className="text-sm text-slate-400">L</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              750 L embedded water / kg
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs block uppercase flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-amber-400" /> Economic Value
            </span>
            <span className="text-2xl font-black text-amber-400">
              ₹{(metrics?.operational_impact.environmental_offsets.economic_value_preserved_inr || 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              ₹65 replacement value / meal
            </span>
          </div>
        </div>
      </div>

      {/* Macro Data & GHI Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: GHI Trend & Global Context */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-amber-400" /> Global Hunger Index (GHI) Trend — India
          </h3>
          <p className="text-xs text-slate-400">
            GHI composite indicator combines child undernourishment, stunting, wasting, and mortality. Scores above 20 represent "Serious" hunger levels.
          </p>

          <div className="overflow-x-auto pt-2">
            <div className="flex items-end justify-between h-44 pb-4 border-b border-slate-800 font-mono text-xs">
              {metrics?.macro_context_india.ghi_trend.map((point) => (
                <div key={point.year} className="flex flex-col items-center gap-2">
                  <span className="font-bold text-amber-400 text-xs">{point.score}</span>
                  <div
                    className="w-10 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all"
                    style={{ height: `${(point.score / 35) * 120}px` }}
                  ></div>
                  <span className="text-slate-400 text-[11px] font-semibold">{point.year}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
            {metrics?.macro_context_india.ghi_indicators.map((ind, idx) => (
              <div key={idx} className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block truncate">{ind.indicator}</span>
                <span className="text-base font-bold text-white mt-1 block">{ind.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: National Wastage Paradox Metrics */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Key National Paradox Benchmarks
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">Annual Food Wasted (India)</span>
                <span className="text-lg font-bold text-white">78 Million Tonnes</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">UNEP 2024</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">People Who Could Be Fed</span>
                <span className="text-lg font-bold text-emerald-400">194 Million People</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Potential</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">Food Service Sector Waste</span>
                <span className="text-lg font-bold text-amber-400">11.9 Million Tonnes/yr</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">HPG / UNEP</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">Annual Economic Loss</span>
                <span className="text-lg font-bold text-white">₹1.52 Lakh Crore / yr</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">NABCONS 2022</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300">Methodology Distinction:</span> Macro statistics cite UNEP 2024 & NABCONS 2022 national studies. Real-time platform counter is a deterministic rate projection ($2474.89 \text{ kg/sec}$). Operational impact counters reflect verified completed deliveries stored in the platform database.
          </div>
        </div>
      </div>
    </div>
  );
};
