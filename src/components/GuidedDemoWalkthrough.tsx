import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
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
      title: 'Waste Monitoring & Material Flow Accounting',
      targetTab: 'impact',
      desc: 'Monitor macroeconomic food waste indicators (UNEP 78 MT/yr) against verified local platform intercepts. Inspect real-time material recovery rates, human redistribution kg, and organic bio-composting diversion accounting.',
      actionText: 'Open Waste Monitoring & Impact Dashboard',
      tag: 'Monitoring'
    },
    {
      step: 2,
      title: 'Surplus Prevention & Source-Level Waste Logging',
      targetTab: 'surplus',
      desc: 'Register excess meals from a campus dining hall with source segregation (cooked meals, produce, bakery), storage constraints (hot holding >60°C), and safe consumption expiry deadlines.',
      actionText: 'View Surplus Logging & Source Intake',
      tag: 'Segregation'
    },
    {
      step: 3,
      title: 'Smart Recipient & Priority Matching Engine',
      targetTab: 'matching',
      desc: 'Execute algorithmic matching. Strict feasibility checks enforce dietary compatibility, vehicle capacity, and delivery radius, utilizing nutrition vulnerability as a supporting prioritization factor (+25pts for critical stunting/anemia).',
      actionText: 'Run Algorithmic Matching & Inspect Rationale',
      tag: 'Priority Engine'
    },
    {
      step: 4,
      title: 'Optimized Collection Fleet Dispatch & Routing',
      targetTab: 'routing',
      desc: 'Assign the collection batch to Asha Poshan Collective vehicle V-N01. The routing engine calculates realistic road distance (1.35x circuity) and sequences pickup stops by earliest deadline first.',
      actionText: 'Inspect Collection Route & Stops Schedule',
      tag: 'Logistics'
    },
    {
      step: 5,
      title: 'Multi-Pathway Collection & Quality Verification',
      targetTab: 'delivery',
      desc: 'Track collection in transit and verify handover. Food safety enforcement guards against distributing expired batches for human consumption, enabling verified diversion to local aerobic bio-composting.',
      actionText: 'Open Collection Tracker & Test Recovery Handover',
      tag: 'Multi-Pathway'
    },
    {
      step: 6,
      title: 'Closed-Loop Resource Recovery',
      targetTab: 'impact',
      desc: 'Examine how the completed transaction updates the live impact ledger with verified kilograms collected, redistributed, composted, and safely disposed.',
      actionText: 'Inspect Audited Environmental Accounting',
      tag: 'Accounting'
    }
  ];

  const current = steps[currentStep - 1];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-8 rounded-3xl border border-emerald-500/30 shadow-2xl text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SOCIOTHON 2026 · SMART & SUSTAINABLE WASTE MANAGEMENT</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Smart Food Waste Prevention, Recovery & Redistribution Tour
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          Experience the complete closed-loop waste management workflow: source prevention, segregated intake, smart priority matching, collection fleet routing, and multi-pathway resource recovery (human consumption vs. bio-composting).
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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
                STAGE {current.step} OF {steps.length}
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
