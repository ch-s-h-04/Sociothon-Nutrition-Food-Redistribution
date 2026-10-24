import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  TrendingDown,
  Building2,
  Users,
  Compass,
  Layers,
  Sparkles,
  Info,
  AlertTriangle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export interface StateRecoveryData {
  state: string;
  wastage: number; // kg/day (from ReRoute benchmark)
  shortage: number; // meals/day (from ReRoute benchmark)
  lat: number;
  lng: number;
  hubCity: string;
  recoveryPriority: 'Critical' | 'High' | 'Active';
}

// Data preserved directly from ReRoute's HomePage.tsx
export const INDIA_STATES_DATA: StateRecoveryData[] = [
  { state: 'Maharashtra', wastage: 12500, shortage: 8900, lat: 19.7515, lng: 75.7139, hubCity: 'Mumbai / Pune / Nandurbar', recoveryPriority: 'Critical' },
  { state: 'Delhi NCR', wastage: 8900, shortage: 4200, lat: 28.7041, lng: 77.1025, hubCity: 'New Delhi', recoveryPriority: 'High' },
  { state: 'Karnataka', wastage: 7800, shortage: 6500, lat: 15.3173, lng: 75.7139, hubCity: 'Bengaluru', recoveryPriority: 'High' },
  { state: 'Tamil Nadu', wastage: 6700, shortage: 5800, lat: 11.1271, lng: 78.6569, hubCity: 'Chennai', recoveryPriority: 'Active' },
  { state: 'West Bengal', wastage: 5600, shortage: 7200, lat: 22.9868, lng: 87.8550, hubCity: 'Kolkata', recoveryPriority: 'High' },
  { state: 'Gujarat', wastage: 4900, shortage: 4100, lat: 22.2587, lng: 71.1924, hubCity: 'Ahmedabad', recoveryPriority: 'Active' },
  { state: 'Rajasthan', wastage: 4200, shortage: 6800, lat: 27.0238, lng: 74.2179, hubCity: 'Jaipur', recoveryPriority: 'High' },
  { state: 'Uttar Pradesh', wastage: 9800, shortage: 11200, lat: 26.8467, lng: 80.9462, hubCity: 'Lucknow / Bahraich', recoveryPriority: 'Critical' }
];

export const IndiaRecoveryMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [selectedState, setSelectedState] = useState<StateRecoveryData>(INDIA_STATES_DATA[0]);
  const [tileError, setTileError] = useState<boolean>(false);

  // Authenticate CARTO basemap via environment variable
  const cartoApiKey = (import.meta.env.VITE_CARTO_API_KEY || '').trim();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map with dark CARTO basemap tiles (matching ReRoute & Anya)
    const map = L.map(mapRef.current, {
      center: [22.2, 79.8],
      zoom: 4.5,
      minZoom: 3.8,
      maxZoom: 7,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false
    });

    if (cartoApiKey) {
      // CARTO raster basemap endpoint with authenticated API key
      const tileUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoApiKey)}`;
      const tileLayer = L.tileLayer(tileUrl, {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
      });

      tileLayer.on('tileerror', () => {
        setTileError(true);
      });

      tileLayer.addTo(map);
    }

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Invalidate map size after mounting to prevent partial rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Update map markers when selected state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    INDIA_STATES_DATA.forEach((s) => {
      const isSelected = selectedState.state === s.state;
      const markerColor = s.recoveryPriority === 'Critical' 
        ? '#f43f5e' 
        : s.recoveryPriority === 'High' 
        ? '#f59e0b' 
        : '#10b981';

      const circle = L.circleMarker([s.lat, s.lng], {
        radius: isSelected ? 12 : 8,
        fillColor: markerColor,
        fillOpacity: isSelected ? 1 : 0.75,
        color: isSelected ? '#ffffff' : '#0f172a',
        weight: isSelected ? 2.5 : 1
      });

      circle.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; padding: 2px 4px; line-height: 1.4;">
          <strong style="color: #f8fafc; font-size: 12px;">${s.state}</strong><br/>
          <span style="color: #94a3b8;">Surplus Wastage:</span> <strong style="color: #fb7185;">${s.wastage.toLocaleString()} kg/day</strong><br/>
          <span style="color: #94a3b8;">Deficit Shortage:</span> <strong style="color: #fbbf24;">${s.shortage.toLocaleString()} meals/day</strong><br/>
          <span style="color: #2dd4bf; font-size: 10px;">Primary Hub: ${s.hubCity}</span>
        </div>`,
        { direction: 'top', offset: [0, -6], opacity: 0.95 }
      );

      circle.on('click', () => {
        setSelectedState(s);
      });

      layer.addLayer(circle);
    });
  }, [selectedState]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-emerald-500/30 p-6 shadow-xl space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
              ReRoute Geographical Network
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-teal-400" /> Multi-Hub Spatial Coordination
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" /> India's Food Recovery Network
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
            Geographical coordination nodes bridging surplus food generation with high-vulnerability community redistribution. Intercepts edible waste before safe consumption windows expire.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            8 State Hubs Active
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Explanatory Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Interactive Leaflet Map */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F19] shadow-inner">
            <div ref={mapRef} className="w-full h-full z-0" />

            {/* Missing API Key Configuration Warning */}
            {!cartoApiKey && (
              <div className="absolute inset-x-4 top-14 z-[1000] bg-slate-950/95 border border-amber-500/50 p-3 rounded-xl shadow-2xl backdrop-blur-md text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-amber-300">CARTO Basemap API Key Required</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    CARTO now requires authentication. Please configure <code className="px-1 py-0.5 bg-slate-900 rounded text-amber-300 font-mono border border-slate-700">VITE_CARTO_API_KEY</code> in your <code className="px-1 py-0.5 bg-slate-900 rounded text-amber-300 font-mono border border-slate-700">.env</code> file.
                  </p>
                  <a
                    href="https://carto.com/basemaps/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2"
                  >
                    Request free CARTO Basemap key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Tile Error / Auth Failure Warning */}
            {cartoApiKey && tileError && (
              <div className="absolute inset-x-4 top-14 z-[1000] bg-slate-950/95 border border-rose-500/50 p-3 rounded-xl shadow-2xl backdrop-blur-md text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-rose-300">CARTO Tile Authentication Error</div>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">
                    CARTO rejected the tile requests. Verify that your <code className="px-1 py-0.5 bg-slate-900 rounded font-mono text-rose-300">VITE_CARTO_API_KEY</code> is active and authorized for browser access.
                  </p>
                </div>
              </div>
            )}

            {/* Map Overlay Badge */}
            <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-md pointer-events-none">
              <span className="text-[10px] font-mono text-emerald-400 font-semibold block uppercase">
                Active Coordination Nodes
              </span>
              <span className="text-xs text-slate-300 font-medium">Click any node to inspect region</span>
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 shadow-md font-mono text-[10px] text-slate-300 space-y-1 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Critical Recovery Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>High Deficit Regional Node</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Active Redistribution Hub</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
            <span>Tile Basemap: © CARTO / OpenStreetMap</span>
            <span>Dataset Provenance: ReRoute State Baseline & NFHS-5</span>
          </div>
        </div>

        {/* Right: Selected State Explanatory Card & State Breakdown */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
          {/* Active State Details */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase block">
                  Selected Regional Node
                </span>
                <h3 className="text-xl font-extrabold text-white">{selectedState.state}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Primary Coordination Hub: <strong className="text-slate-200">{selectedState.hubCity}</strong>
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                selectedState.recoveryPriority === 'Critical'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : selectedState.recoveryPriority === 'High'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {selectedState.recoveryPriority} Priority
              </span>
            </div>

            {/* Waste vs Shortage Gauges (Preserved from ReRoute HomePage.tsx) */}
            <div className="space-y-3 font-mono pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Estimated Surplus Food Wastage:</span>
                  <span className="text-rose-400 font-bold">{selectedState.wastage.toLocaleString()} kg/day</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-red-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (selectedState.wastage / 12500) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Source: Food service & hospitality intercept potential
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Community Meal Shortage:</span>
                  <span className="text-amber-400 font-bold">{selectedState.shortage.toLocaleString()} meals/day</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (selectedState.shortage / 11200) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Identified deficit across registered community kitchens & shelters
                </span>
              </div>
            </div>
          </div>

          {/* Quick State Selector Pills */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block uppercase mb-2">
              Select Regional Network Node:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INDIA_STATES_DATA.map((s) => (
                <button
                  key={s.state}
                  onClick={() => setSelectedState(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    selectedState.state === s.state
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {s.state}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
