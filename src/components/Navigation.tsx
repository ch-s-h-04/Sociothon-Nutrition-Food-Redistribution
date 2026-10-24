import React from 'react';
import {
  Activity,
  HeartHandshake,
  BarChart3,
  UtensilsCrossed,
  Sparkles,
  RotateCcw,
  Trophy,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSurplusCount: number;
  inTransitDeliveriesCount: number;
  onResetDb: () => void;
  isResetting: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  activeSurplusCount,
  inTransitDeliveriesCount,
  onResetDb,
  isResetting
}) => {
  const navItems = [
    { id: 'impact', label: 'Waste Monitoring & Impact', icon: BarChart3, badge: null, tag: 'UNEP/WARM' },
    { id: 'surplus', label: 'Surplus Prevention & Logging', icon: UtensilsCrossed, badge: activeSurplusCount > 0 ? activeSurplusCount : null, tag: 'Segregation' },
    { id: 'matching', label: 'Smart Recipient Matching', icon: HeartHandshake, badge: 'Unified', tag: 'Core' },
    { id: 'delivery', label: 'Reservation Tracking', icon: HeartHandshake, badge: inTransitDeliveriesCount > 0 ? `${inTransitDeliveriesCount} active` : null, tag: 'Recovery' },
    { id: 'nutrition', label: 'Nutrition Intelligence', icon: Activity, badge: null, tag: 'Supporting' },
    { id: 'leaderboard', label: 'Provider Leaderboard', icon: Trophy, badge: 'Trust', tag: 'Impact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('wizard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  SOCIOTHON 2026
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono font-medium">
                  NSS IIT Roorkee
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Smart Food Waste Prevention, Recovery & Redistribution
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onResetDb}
              disabled={isResetting}
              title="Reset sample database to default seed state"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Seed Data</span>
            </button>
            <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                Waste Management Challenge
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? item.special
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (item.special ? 'text-amber-400' : 'text-emerald-400') : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    item.special
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
