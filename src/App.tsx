import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { NutritionIntel } from './components/NutritionIntel';
import { SurplusManagement } from './components/SurplusManagement';
import { SmartMatching } from './components/SmartMatching';
import { DeliveryTracker } from './components/DeliveryTracker';
import { ImpactDashboard } from './components/ImpactDashboard';
import { ProviderLeaderboard } from './components/ProviderLeaderboard';
import { api } from './utils/api';
import { SurplusEvent } from './types';
import { Heart, Github, ExternalLink } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('matching');
  const [surplusListings, setSurplusListings] = useState<SurplusEvent[]>([]);
  const [selectedSurplusId, setSelectedSurplusId] = useState<string>('');
  const [targetDistrict, setTargetDistrict] = useState<string>('Nandurbar');
  const [isResetting, setIsResetting] = useState<boolean>(false);

  useEffect(() => {
    loadGlobalData();
  }, []);

  const loadGlobalData = async () => {
    try {
      const surplusRes = await api.surplus.getAll();
      setSurplusListings(surplusRes);
      if (surplusRes.length > 0 && !selectedSurplusId) {
        setSelectedSurplusId(surplusRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load global application data:', err);
    }
  };

  const handleResetDb = async () => {
    if (window.confirm('Reset sample database to default seed state?')) {
      try {
        setIsResetting(true);
        await api.entities.resetDatabase();
        await loadGlobalData();
        alert('Database reset to verified initial state.');
      } catch (err: any) {
        alert(`Reset failed: ${err.message}`);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleSelectDistrictForRedistribution = (districtName: string) => {
    setTargetDistrict(districtName);
    setActiveTab('surplus');
  };

  const handleSelectSurplusForMatching = (eventId: string) => {
    setSelectedSurplusId(eventId);
    setActiveTab('matching');
  };

  const activeSurplusCount = surplusListings.filter(s => s.status === 'available').length;
  // in transit deliveries estimate
  const inTransitCount = surplusListings.filter(s => s.status === 'in_transit' || s.status === 'assigned').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSurplusCount={activeSurplusCount}
        inTransitDeliveriesCount={inTransitCount}
        onResetDb={handleResetDb}
        isResetting={isResetting}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'nutrition' && (
          <NutritionIntel
            onSelectDistrictForRedistribution={handleSelectDistrictForRedistribution}
          />
        )}

        {activeTab === 'surplus' && (
          <SurplusManagement
            surplusListings={surplusListings}
            onRefresh={loadGlobalData}
            onSelectForMatching={handleSelectSurplusForMatching}
            preselectedDistrict={targetDistrict}
          />
        )}

        {activeTab === 'matching' && (
          <SmartMatching
            surplusListings={surplusListings}
            selectedSurplusId={selectedSurplusId}
            onSelectSurplusId={setSelectedSurplusId}
            onReservationCreated={loadGlobalData}
          />
        )}

        {activeTab === 'delivery' && (
          <DeliveryTracker
            highlightDeliveryId=""
            onRefreshParent={loadGlobalData}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactDashboard />
        )}

        {activeTab === 'leaderboard' && (
          <ProviderLeaderboard />
        )}

      </main>

      {/* Unified Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-300">
              Sociothon 2026 — Smart Food Waste Prevention, Recovery & Redistribution Platform
            </p>
            <p className="text-[11px] text-slate-500">
              Sociothon 2026 (NSS IIT Roorkee) · Smart & Sustainable Waste Management Challenge · Unifying open components from{' '}
              <a href="https://github.com/Dishank-Sen/Anya" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                Anya
              </a>{' '}
              and{' '}
              <a href="https://github.com/Dishank-Sen/ReRoute" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">
                ReRoute
              </a>.
            </p>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="flex items-center text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span>
              NFHS-5 Factsheets Verified
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">UNEP / EPA WARM Accounting</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
