import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { DistrictSummary, DistrictDetail } from '../types';
import {
  AlertTriangle,
  MapPin,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface NutritionIntelProps {
  onSelectDistrictForRedistribution?: (districtName: string) => void;
}

export const NutritionIntel: React.FC<NutritionIntelProps> = ({ onSelectDistrictForRedistribution }) => {
  const [districts, setDistricts] = useState<DistrictSummary[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('nandurbar');
  const [districtDetail, setDistrictDetail] = useState<DistrictDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'districts' | 'states'>('districts');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [distRes, stateRes] = await Promise.all([
          api.nutrition.getDistricts(),
          api.nutrition.getStatesOverview()
        ]);
        setDistricts(distRes.districts);
        setStates(stateRes.states);
        if (distRes.districts.length > 0) {
          const defaultD = distRes.districts.find(d => d.id === 'nandurbar') || distRes.districts[0];
          setSelectedDistrictId(defaultD.id);
          const detail = await api.nutrition.getDistrictById(defaultD.id);
          setDistrictDetail(detail);
        }
      } catch (err) {
        console.error('Error loading nutrition data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectDistrict = async (id: string) => {
    setSelectedDistrictId(id);
    try {
      const detail = await api.nutrition.getDistrictById(id);
      setDistrictDetail(detail);
    } catch (err) {
      console.error('Failed to load district detail:', err);
    }
  };

  const filteredDistricts = districts.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = stateFilter === 'all' || d.state === stateFilter;
    return matchesSearch && matchesState;
  });

  const uniqueStates = Array.from(new Set(districts.map(d => d.state)));

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">Critical (≥65%)</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">High (50–64%)</span>;
      case 'moderate':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Moderate (35–49%)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Low (&lt;35%)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ANYA NUTRITION ENGINE
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Source: NFHS-5 (2019-21) Factsheets
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Geographic Nutrition Vulnerability & Indicators
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Real government epidemiological survey data across India’s aspirational districts. Identifies critical micronutrient deficits (Iron, Vitamin A, Zinc, B12, D) to inform targeted food redistribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('districts')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'districts' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Districts ({districts.length})
            </button>
            <button
              onClick={() => setActiveTab('states')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'states' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              State Comparison ({states.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'states' ? (
        /* State Level Nutrition Overview */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" /> State-Wise Nutritional Indicators Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">State</th>
                  <th className="py-3 px-4">Priority Level</th>
                  <th className="py-3 px-4">Avg Child Anemia</th>
                  <th className="py-3 px-4">Avg Stunting (Under 5)</th>
                  <th className="py-3 px-4">Avg Wasting</th>
                  <th className="py-3 px-4">Sample Population</th>
                  <th className="py-3 px-4 rounded-r-lg">Monitored Districts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {states.map((s) => (
                  <tr key={s.state} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">{s.state}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        s.priority_level === 'Critical' ? 'bg-rose-900/40 text-rose-300 border border-rose-700/50' : 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                      }`}>
                        {s.priority_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-amber-300">{s.avg_child_anemia_pct}%</td>
                    <td className="py-3.5 px-4 font-mono text-rose-300">{s.avg_stunting_pct}%</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{s.avg_wasting_pct}%</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{s.total_population_represented.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{s.districts_monitored}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* District Level View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: District Selector List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search district or state..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All States</option>
                  {uniqueStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between px-1">
                <span>Showing {filteredDistricts.length} aspirational districts</span>
                <span>Sorted by severity rank</span>
              </div>
            </div>

            {/* District Cards List */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredDistricts.map((d) => {
                const isSelected = selectedDistrictId === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDistrict(d.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-emerald-400">#{d.rank}</span>
                          <h3 className="font-bold text-sm text-white">{d.name}</h3>
                          {d.tribal && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Tribal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-slate-500" /> {d.state} · Pop: {(d.population / 100000).toFixed(1)}L
                        </p>
                      </div>
                      {getRiskBadge(d.overall_level)}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Child Anemia</span>
                        <span className="font-semibold text-amber-400">{d.anemia_children_pct}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Stunting</span>
                        <span className="font-semibold text-rose-400">{d.stunting_pct}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Fe Deficiency</span>
                        <span className="font-semibold text-orange-400">{d.iron_risk}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed District Profile */}
          <div className="lg:col-span-7">
            {districtDetail ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Rank #{districtDetail.rank} Most Vulnerable
                      </span>
                      {districtDetail.aspirational_district && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          NITI Aayog Aspirational
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mt-1">
                      {districtDetail.district_name}, {districtDetail.state}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dominant communities: <span className="text-slate-300">{districtDetail.dominant_tribe}</span>
                    </p>
                  </div>

                  {onSelectDistrictForRedistribution && (
                    <button
                      onClick={() => onSelectDistrictForRedistribution(districtDetail.district_name)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Target Food Redistribution</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  )}
                </div>

                {/* NFHS-5 Macro Indicators Grid */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> NFHS-5 Official Clinical Indicators (2019–21)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block uppercase">Child Stunting</span>
                      <span className="text-lg font-bold text-rose-400">{districtDetail.district_context.stunting_pct}%</span>
                      <span className="text-[10px] text-slate-500 block">Height-for-age</span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block uppercase">Child Wasting</span>
                      <span className="text-lg font-bold text-amber-400">{districtDetail.district_context.wasting_pct}%</span>
                      <span className="text-[10px] text-slate-500 block">Weight-for-height</span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block uppercase">Child Anemia</span>
                      <span className="text-lg font-bold text-orange-400">{districtDetail.district_context.anemia_children_pct}%</span>
                      <span className="text-[10px] text-slate-500 block">Hb &lt; 11.0 g/dl</span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block uppercase">Women Anemia</span>
                      <span className="text-lg font-bold text-amber-400">{districtDetail.district_context.anemia_women_pct}%</span>
                      <span className="text-[10px] text-slate-500 block">Hb &lt; 12.0 g/dl</span>
                    </div>
                  </div>
                </div>

                {/* Per-Micronutrient Breakdown */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Micronutrient Deficiency Breakdown
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(districtDetail.micronutrients).map(([nutrient, info]) => {
                      const labels: Record<string, string> = {
                        iron: 'Iron (Fe)',
                        vitamin_a: 'Vitamin A',
                        zinc: 'Zinc (Zn)',
                        b12: 'Vitamin B12',
                        vitamin_d: 'Vitamin D'
                      };
                      return (
                        <div key={nutrient} className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-sm text-white">{labels[nutrient] || nutrient}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono text-slate-400">Trend: {info.trend_delta}</span>
                              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                                info.level === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {info.risk_pct}% Risk
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                            <div
                              className={`h-2 rounded-full ${
                                info.level === 'critical' ? 'bg-rose-500' : info.level === 'high' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, info.risk_pct)}%` }}
                            ></div>
                          </div>

                          {/* Primary Causes */}
                          {info.causes && info.causes.length > 0 && (
                            <div className="mt-2 text-xs text-slate-400">
                              <span className="text-slate-500 font-medium">Underlying Factors:</span>
                              <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                                {info.causes.map((c, i) => (
                                  <li key={i}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Provenance note */}
                <div className="p-3.5 bg-slate-800/30 rounded-xl border border-slate-700/40 text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-300">Data Provenance:</span> {districtDetail.data_provenance.source}. Reporting period: {districtDetail.data_provenance.reporting_period}. Values reflect genuine government health factsheets.
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Select a district to view detailed nutrition intelligence
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
