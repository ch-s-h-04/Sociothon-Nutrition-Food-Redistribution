import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Activity,
  UtensilsCrossed,
  HeartHandshake,
  Route,
  Truck,
  BarChart3,
  PackageCheck,
  RotateCcw
} from 'lucide-react';

interface GuidedDemoWalkthroughProps {
  onNavigateTab: (tab: string) => void;
  onResetDb: () => void;
}

export const GuidedDemoWalkthrough: React.FC<GuidedDemoWalkthroughProps> = ({
  onNavigateTab,
  onResetDb
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: 'Macro Nutrition Intelligence & Priority Area Identification',
      targetTab: 'nutrition',
      desc: 'Browse official NFHS-5 factsheet indicators across India’s aspirational districts. Identify Nandurbar (Maharashtra) with 60.6% child stunting and 62.6% child anemia, requiring urgent high-iron and protein intervention.',
      actionText: 'Open Nutrition Intelligence Map & Factsheets',
      tag: 'Anya'
    },
    {
      step: 2,
      title: 'Food Surplus Registration with Storage Handling Parameters',
      targetTab: 'surplus',
      desc: 'Register a surplus donation of freshly prepared cooked meals (dal tadka, fortified rice, and moringa greens) at Satpura Community Kitchen in Nandurbar with hot holding storage requirements and a 2.5-hour safe consumption deadline.',
      actionText: 'View Surplus Inventory & Register Donation',
      tag: 'ReRoute'
    },
    {
      step: 3,
      title: 'Nutrition-Aware Recipient Matching Engine',
      targetTab: 'matching',
      desc: 'Execute algorithmic matching. Strict feasibility checks enforce dietary compatibility, capacity, and radius. The scoring engine awards +25 points for Nandurbar’s critical nutrition vulnerability and +15 points for micronutrient synergy, recommending Asha Poshan Collective.',
      actionText: 'Run Algorithmic Matching & Inspect Rationale',
      tag: 'Unified Core'
    },
    {
      step: 4,
      title: 'Donation Assignment & Fleet Route Optimization',
      targetTab: 'routing',
      desc: 'Assign the donation to Asha Poshan Collective. Vehicle V-N01 is dispatched. The routing engine calculates realistic road distance (1.35x circuity) and sequences pickup stops by earliest deadline first.',
      actionText: 'Inspect Fleet Route & Stops Schedule',
      tag: 'ReRoute'
    },
    {
      step: 5,
      title: 'Real-Time Delivery Lifecycle Tracking',
      targetTab: 'delivery',
      desc: 'Progress the delivery state machine from "Assigned" to "In Transit" and confirm final handover to the recipient NGO. An audited digital trail is recorded.',
      actionText: 'Open Delivery Dispatch & Confirm Handover',
      tag: 'ReRoute'
    },
    {
      step: 6,
      title: 'The India Paradox & Verified Impact Reflection',
      targetTab: 'impact',
      desc: 'Examine how the completed transaction immediately updates the live impact dashboard, calculating exact kilograms of food saved, CO₂ emissions averted (2.5 kg/kg food), and embedded water conserved (750 L/kg food) alongside national UNEP waste benchmarks.',
      actionText: 'View The India Paradox & Verified Impact',
      tag: 'UNEP/NABCONS'
    },
    {
      step: 7,
      title: 'Precision Fortification & Cultural Meal Planning',
      targetTab: 'planner',
      desc: 'Explore Anya’s linear-programming fortification optimizer allocating PDS vehicles to reduce anemia by 33%, paired with 7-day culturally-appropriate family meal plans respecting local dietary traditions.',
      actionText: 'Open Fortification & Meal Planner',
      tag: 'Anya'
    }
  ];

  const current = steps[currentStep - 1];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 p-8 rounded-3xl border border-amber-500/30 shadow-2xl text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SOCIOTHON HACKATHON LIVE EVALUATION TOUR</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Anya + ReRoute Unified End-to-End Demonstration
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          Experience the complete closed-loop workflow connecting Macro/Micro-Nutrition Intelligence with Operational Food Redistribution across India’s most vulnerable districts.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={onResetDb}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Initial State</span>
          </button>
        </div>
      </div>

      {/* Steps Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((s) => {
          const isActive = s.step === currentStep;
          const isDone = s.step < currentStep;
          return (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-3 rounded-xl border text-left transition ${
                isActive
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : isDone
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span>Step {s.step}</span>
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
              </div>
              <span className="text-[11px] font-medium text-slate-300 line-clamp-1 mt-1">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                STAGE {current.step} OF 7
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                Component: {current.tag}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1.5">{current.title}</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
              disabled={currentStep === steps.length}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
            >
              Next Step
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          {current.desc}
        </p>

        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Clicking below will switch to the active module with preloaded context for this evaluation step.
          </div>

          <button
            onClick={() => onNavigateTab(current.targetTab)}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/25 transition whitespace-nowrap"
          >
            <span>{current.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
