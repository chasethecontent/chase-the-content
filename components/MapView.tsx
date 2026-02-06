
import React, { useEffect, useRef, useState } from 'react';
import { Streamer } from '../types';

interface MapViewProps {
  streamers: Streamer[];
  onReportLocation: (streamer: Streamer, newLoc: [number, number]) => void;
}

const MapView: React.FC<MapViewProps> = ({ streamers, onReportLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [reportingStreamer, setReportingStreamer] = useState<Streamer | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // @ts-ignore
      const L = window.L;
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([20, 0], 2);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Handle map clicks for reporting
      mapInstanceRef.current.on('click', (e: any) => {
        // We use a ref-like check or functional state to see if we are in reporting mode
        const latlng = e.latlng;
        // This is handled via the reportingStreamer state
      });
    }
  }, []);

  // Use another effect to handle the click logic so it has access to the latest reportingStreamer state
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleMapClick = (e: any) => {
      if (reportingStreamer) {
        const confirmed = window.confirm(`Update ${reportingStreamer.name}'s location to these coordinates?`);
        if (confirmed) {
          onReportLocation(reportingStreamer, [e.latlng.lat, e.latlng.lng]);
          setReportingStreamer(null);
        }
      }
    };

    mapInstanceRef.current.off('click');
    mapInstanceRef.current.on('click', handleMapClick);

    return () => mapInstanceRef.current.off('click');
  }, [reportingStreamer, onReportLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = (window as any).L;

    // Clear existing markers if needed (optional for simplicity we just add/update)
    streamers.forEach(streamer => {
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 bg-indigo-500/30 rounded-full animate-ping"></div>
            <img src="${streamer.avatar}" class="w-10 h-10 rounded-full border-2 border-indigo-500 relative z-10 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <div class="absolute -bottom-7 whitespace-nowrap bg-[#0b0e14] px-2 py-0.5 rounded text-[10px] font-black italic uppercase border border-indigo-500/30 text-indigo-400 tracking-tighter shadow-xl">
              ${streamer.name}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker(streamer.location, { icon: customIcon })
        .addTo(mapInstanceRef.current);

      marker.bindPopup(`
          <div class="p-3 bg-[#0b0e14] text-white min-w-[180px]">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 class="font-black text-white italic uppercase text-sm">${streamer.name}</h3>
            </div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Last seen: ${streamer.locationName || 'Unknown'}</p>
            <button id="report-${streamer.id}" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black py-2.5 rounded-xl transition-all uppercase tracking-widest italic shadow-lg shadow-indigo-500/20">
              UPDATE LOCATION
            </button>
          </div>
        `, { className: 'dark-popup' });
      
      marker.on('popupopen', () => {
        const btn = document.getElementById(`report-${streamer.id}`);
        if (btn) {
          btn.onclick = () => {
            setReportingStreamer(streamer);
            mapInstanceRef.current.closePopup();
          };
        }
      });
    });
  }, [streamers]);

  return (
    <div className="w-full h-[calc(100vh-140px)] mt-28 relative overflow-hidden rounded-[40px] border border-white/5 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Placement Overlay */}
      {reportingStreamer && (
        <div className="absolute inset-x-0 top-0 z-[1000] p-6 flex justify-center pointer-events-none">
          <div className="bg-indigo-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-bounce pointer-events-auto border-2 border-white/20">
            <span className="font-black italic uppercase tracking-tighter">Placement Mode: Click on Map to set {reportingStreamer.name}'s Spot</span>
            <button 
              onClick={() => setReportingStreamer(null)}
              className="bg-black/20 hover:bg-black/40 p-1 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        <div className="bg-[#0b0e14]/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">32 Online Now</span>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 z-10 bg-[#0b0e14]/80 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 max-w-sm shadow-2xl group">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          </div>
          <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Community Pulse</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
          Spot a streamer in the wild? Help the community by updating their pin. Accurate reporting increases your reputation rank.
        </p>
        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reports Today</div>
            <div className="text-xl font-black text-white tabular-nums">1,240</div>
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Accuracy</div>
            <div className="text-xl font-black text-emerald-400 tabular-nums">98.4%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
