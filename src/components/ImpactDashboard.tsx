import React, { useState, useEffect } from 'react';
import { ImpactMetrics } from '../types';
import { api } from '../utils/api';
import { IndiaRecoveryMap } from './IndiaRecoveryMap';
import {
  UNEP_2024_INDIA_HOUSEHOLD_WASTE_TONNES_PER_YEAR,
  UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND,
  UNEP_REPORT_CITATION,
  calculateDeterministicModelledWasteKg
} from '../utils/unepWasteEstimate';
import {
  BarChart3,
  TrendingDown,
  Globe2,
  ShieldAlert,
  Info,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  Recycle,
  Sprout,
  Truck,
  Scale,
  Percent,
  ExternalLink
} from 'lucide-react';

export const ImpactDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  // Deterministic initial value based on elapsed time from start of current year
  const [liveCounterKg, setLiveCounterKg] = useState<number>(() => calculateDeterministicModelledWasteKg());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const data = await api.impact.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load impact metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();

    // 100ms ticker recalculating deterministically from wall-clock Date.now()
    // Mathematically derived: 78,192,338 tonnes/yr × 1,000 kg/t ÷ 31,536,000 s/yr = ~2,479.46 kg/s
    const interval = setInterval(() => {
      setLiveCounterKg(calculateDeterministicModelledWasteKg());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const op = metrics?.operational_impact;

  return (
    <div className="space-y-6">
      {/* Top Banner with Real-Time Waste Counter */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-6 rounded-2xl border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                SOCIOTHON 2026 · SMART WASTE MANAGEMENT MONITORING
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Smart Food Waste Prevention, Monitoring & Resource Recovery
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Decentralized technology-driven solution for campuses, dining halls, and canteens. Intercepts surplus at the source, verifies multi-pathway recovery (human redistribution vs. organic bio-composting), and calculates audited material diversion rates.
            </p>
          </div>

          {/* National Household Food Waste Benchmark (UNEP 2024 Modelled Estimate) */}
          <div className="bg-slate-950/85 p-4 sm:p-5 rounded-xl border border-rose-500/30 shadow-inner shrink-0 max-w-md w-full md:w-auto text-left space-y-2.5">
            {/* Header Badge & Citation Link */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase text-rose-400 font-bold tracking-wider">
                  National Benchmark · Modelled Estimate
                </span>
              </div>
              <a
                href={UNEP_REPORT_CITATION.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition underline-offset-2 hover:underline"
                title="View official UNEP Food Waste Index Report 2024"
              >
                <span>UNEP 2024</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Prominent Verified Annual Baseline */}
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Estimated Annual Household Food Waste in India:
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                  78.2 Million Tonnes
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ({UNEP_2024_INDIA_HOUSEHOLD_WASTE_TONNES_PER_YEAR.toLocaleString()} t/yr)
                </span>
              </div>
            </div>

            {/* Modelled Cumulative Ticker (2026 Year-to-Date Projection) */}
            <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Cumulative 2026 Projection (YTD):</span>
                <span className="text-rose-400 font-semibold">~{UNEP_2024_INDIA_HOUSEHOLD_WASTE_KG_PER_SECOND.toFixed(2)} kg/s</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-rose-300">
                {Math.floor(liveCounterKg).toLocaleString()} <span className="text-xs text-slate-400 font-normal">kg</span>
              </div>
              <p className="text-[9.5px] text-slate-500 leading-tight mt-1">
                Modelled projection assuming uniform rate (78.2 MT ÷ 31.54M s). Not live-measured waste.
              </p>
            </div>

            {/* Context, Scope & Confidence Level Note */}
            <div className="flex items-start gap-1.5 text-[10px] text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60 leading-normal">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div>
                  <strong className="text-slate-300">Scope:</strong> Household consumption only (Medium Confidence).
                </div>
                <div>
                  Excludes retail, commercial catering & pre-harvest loss. Independent from audited platform records below.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* India Food Recovery Network Map (Geographical Coordination ReRoute Component) */}
      <IndiaRecoveryMap />

      {/* Verified Platform Operational Waste Stream (Primary Grid) */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/30 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Audited Material Waste Stream & Recovery Accounting
            </h2>
            <p className="text-xs text-slate-400">
              Operational metrics computed directly from verified platform database transaction records.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold shrink-0">
            Verified Platform Records
          </span>
        </div>

        {/* Primary Waste Stream Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs block uppercase flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-blue-400" /> Total Surplus Registered
            </span>
            <span className="text-2xl font-black text-white">
              {op?.total_registered_kg ?? 0} <span className="text-sm font-normal text-slate-400">kg</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              {op?.total_registered_meals ?? 0} meals logged at source
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs block uppercase flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-cyan-400" /> Quantity Collected
            </span>
            <span className="text-2xl font-black text-cyan-400">
              {op?.collected_kg ?? 0} <span className="text-sm font-normal text-slate-400">kg</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              {op?.pending_collection_kg ?? 0} kg pending collection
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs block uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Human Redistribution
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {op?.redistributed_kg ?? 0} <span className="text-sm font-normal text-slate-400">kg</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              {op?.redistributed_meals ?? 0} meals delivered to NGOs
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs block uppercase flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-lime-400" /> Organic Bio-Composting
            </span>
            <span className="text-2xl font-black text-lime-400">
              {op?.composted_kg ?? 0} <span className="text-sm font-normal text-slate-400">kg</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              Verified diversion to a composting partner
            </span>
          </div>
        </div>

        {/* Key Recovery Ratios & Logistics Performance */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          <div className="bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/30">
            <span className="text-slate-400 text-[10px] uppercase block flex items-center gap-1">
              <Percent className="w-3 h-3 text-emerald-400" /> Material Recovery Rate
            </span>
            <span className="text-xl font-bold text-emerald-300">
              {op?.recovery_rate_pct ?? 0}%
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              (Redistributed + Composted) / Registered
            </span>
          </div>

          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase block">Human Redistribution Rate</span>
            <span className="text-xl font-bold text-teal-300">
              {op?.redistribution_rate_pct ?? 0}%
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              Edible surplus redirected to hungry
            </span>
          </div>

          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase block">Safe Municipal Disposal</span>
            <span className="text-xl font-bold text-slate-300">
              {op?.disposed_kg ?? 0} kg
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              {op?.disposed_count ?? 0} spoiled batches discarded
            </span>
          </div>

          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase block flex items-center gap-1">
              <Truck className="w-3 h-3 text-cyan-400" /> Collection Efficiency
            </span>
            <span className="text-xl font-bold text-cyan-300">
              {op?.collection_efficiency_kg_per_km ?? 0} kg/km
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              Across {op?.collection_distance_km ?? 0} km fleet transit
            </span>
          </div>
        </div>

      </div>

      {/* Macro Data & GHI Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: GHI Trend & Global Context */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-amber-400" /> Global Hunger Index (GHI) Trend — India
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              Macro Benchmark
            </span>
          </div>
          <p className="text-xs text-slate-400">
            GHI composite indicator combines child undernourishment, stunting, wasting, and mortality. Scores above 20 represent "Serious" hunger levels, reinforcing the urgent need to divert edible food waste to high-need communities.
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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> National Wastage Paradox
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
              UNEP / NABCONS
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-slate-400 block">Annual Household Food Waste (India)</span>
                <span className="text-lg font-bold text-white">78.2 Million Tonnes</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono">UNEP 2024</span>
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
            <span className="font-bold text-slate-300">Methodology Distinction:</span> Macro statistics cite published research (UNEP 2024 & NABCONS 2022). Operational metrics above reflect verified transactional entries in the platform database with zero synthetic inflation.
          </div>
        </div>
      </div>
    </div>
  );
};
