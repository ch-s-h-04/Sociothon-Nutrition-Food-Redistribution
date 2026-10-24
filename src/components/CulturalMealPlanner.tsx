import React, { useState, useEffect } from 'react';
import { FortificationPlan, MealPlan, DistrictSummary } from '../types';
import { api } from '../utils/api';
import {
  PackageCheck,
  Sparkles,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Utensils,
  Leaf,
  Layers,
  Info
} from 'lucide-react';

interface CulturalMealPlannerProps {
  districts: DistrictSummary[];
  initialDistrictId?: string;
}

export const CulturalMealPlanner: React.FC<CulturalMealPlannerProps> = ({
  districts,
  initialDistrictId = 'nandurbar'
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrictId);
  const [culturalGroups, setCulturalGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('tribal_hindu');
  const [fortPlan, setFortPlan] = useState<FortificationPlan | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loadingFort, setLoadingFort] = useState<boolean>(true);
  const [loadingMeals, setLoadingMeals] = useState<boolean>(true);

  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await api.nutrition.getCulturalGroups();
        setCulturalGroups(res.groups);
      } catch (err) {
        console.error('Failed to load cultural groups:', err);
      }
    }
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      loadFortification(selectedDistrict);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    loadMeals(selectedDistrict, selectedGroup);
  }, [selectedDistrict, selectedGroup]);

  const loadFortification = async (distId: string) => {
    try {
      setLoadingFort(true);
      const res = await api.nutrition.getFortificationPlan(distId);
      setFortPlan(res);
    } catch (err) {
      console.error('Failed to load fortification plan:', err);
    } finally {
      setLoadingFort(false);
    }
  };

  const loadMeals = async (distId: string, group: string) => {
    try {
      setLoadingMeals(true);
      const res = await api.nutrition.generateMealPlan({
        district: distId,
        cultural_group: group,
        season: 'monsoon'
      });
      setMealPlan(res);
    } catch (err) {
      console.error('Failed to load meal plan:', err);
    } finally {
      setLoadingMeals(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ANYA NUTRITION PLANNING
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Precision Fortification & Cultural Meal Planner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Linear-programming inspired food vehicle selection for district public distribution, paired with culturally-compliant WHO/ICMR 7-day family meal plans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Target District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Dietary Culture:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              {culturalGroups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fortification Optimization Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-400" /> Precision Fortification Strategy (Optimal Allocation)
            </h2>
            <p className="text-xs text-slate-400">
              Maximizes deficiency reduction per rupee spent under quarterly budget constraints ({fortPlan?.total_quarterly_budget_lakhs} Lakhs INR).
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Allocated: <strong>₹{fortPlan?.allocated_budget_lakhs}L</strong>
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300">
              Remaining: <strong>₹{fortPlan?.unallocated_budget_lakhs}L</strong>
            </span>
          </div>
        </div>

        {loadingFort ? (
          <div className="h-32 flex items-center justify-center text-slate-400 text-xs font-mono">
            Optimizing vehicle selection...
          </div>
        ) : fortPlan ? (
          <div className="space-y-4">
            {/* Selected Vehicles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fortPlan.selected_vehicles.map((v) => (
                <div key={v.vehicle_id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-sm">{v.name}</span>
                    <span className="font-mono text-emerald-400 font-bold text-xs">ROI: {v.roi_efficiency_score}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Channel: {v.delivery_channel}</p>
                  <p className="text-slate-400 text-[11px]">Target: {v.target_group}</p>
                  <div className="pt-2 border-t border-slate-700/60 flex justify-between font-mono text-slate-300">
                    <span>Quarterly Cost:</span>
                    <strong className="text-amber-300">₹{v.quarterly_cost_lakhs} Lakhs</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Projected Deficiency Reductions */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Projected Impact on Micronutrient Deficiencies:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
                {Object.entries(fortPlan.projected_outcomes).map(([nut, out]) => (
                  <div key={nut} className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">{nut}</span>
                    <div className="flex items-center justify-center space-x-1.5 mt-1">
                      <span className="text-slate-400 line-through text-xs">{out.baseline_deficiency_pct}%</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-sm font-bold text-emerald-400">{out.post_intervention_pct}%</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-semibold block mt-0.5">
                      ↓{out.projected_reduction_pct}% ({out.reduction_relative_pct}% rel)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Cultural Meal Planner Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-400" /> Culturally-Aware 7-Day Meal Schedule
            </h2>
            <p className="text-xs text-slate-400">
              Community diet: <strong className="text-slate-200">{mealPlan?.cultural_group}</strong> · District: <strong className="text-slate-200">{mealPlan?.district_context}</strong> · Est. Cost: <strong className="text-emerald-400">₹{mealPlan?.estimated_weekly_cost_inr}/week</strong>
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" /> ICMR/WHO RDA Compliant
          </div>
        </div>

        {/* Bioavailability Notes */}
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-300 space-y-1">
          <span className="font-bold text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Bioavailability & Food Synergy Principles:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400">
            {mealPlan?.bioavailability_notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>

        {/* Weekly Schedule Cards */}
        {loadingMeals ? (
          <div className="h-32 flex items-center justify-center text-slate-400 text-xs font-mono">
            Compiling culturally-verified meal recipes...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealPlan?.weekly_schedule.map((day) => (
              <div key={day.day} className="p-4 rounded-xl bg-slate-800/40 border border-slate-850 hover:border-slate-700 transition space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-white font-mono text-sm">{day.day}</span>
                  <span className="font-mono text-emerald-400 font-semibold text-xs">₹{day.daily_nutrients.cost_inr}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-mono">Breakfast</span>
                  <p className="text-slate-200">{day.breakfast}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-mono">Lunch</span>
                  <p className="text-slate-200">{day.lunch}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-mono">Dinner</span>
                  <p className="text-slate-200">{day.dinner}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-mono text-[10px] text-slate-400">
                  <span>Fe: {day.daily_nutrients.iron_mg}mg</span>
                  <span>Vit A: {day.daily_nutrients.vit_a_mcg}µg</span>
                  <span>Protein: {day.daily_nutrients.protein_g}g</span>
                  <span>{day.daily_nutrients.calories} kcal</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
