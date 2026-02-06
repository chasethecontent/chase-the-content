
import React, { useEffect, useRef } from 'react';
import { Streamer } from '../types';

interface MapViewProps {
  streamers: Streamer[];
  onReportLocation: (streamer: Streamer) => void;
}

const MapView: React.FC<MapViewProps> = ({ streamers, onReportLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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
    }

    const L = (window as any).L;
    
    streamers.forEach(streamer => {
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 bg-indigo-500/30 rounded-full animate-ping"></div>
            <img src="${streamer.avatar}" class="w-10 h-10 rounded-full border-2 border-indigo-500 relative z-10" />
            <div class="absolute -bottom-6 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold border border-white/10">
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
          <div class="p-3 bg-[#0b0e14] text-white min-w-[150px]">
            <h3 class="font-bold text-indigo-400 text-base mb-1">${streamer.name}</h3>
            <p class="text-xs text-slate-400 mb-3">📍 ${streamer.locationName}</p>
            <button id="report-${streamer.id}" class="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold py-2 rounded-lg border border-white/10 transition-colors">
              REPORT NEW LOCATION
            </button>
          </div>
        `);
      
      marker.on('popupopen', () => {
        const btn = document.getElementById(`report-${streamer.id}`);
        if (btn) {
          btn.onclick = () => onReportLocation(streamer);
        }
      });
    });

  }, [streamers, onReportLocation]);

  return (
    <div className="w-full h-[calc(100vh-120px)] mt-24 relative overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-6 left-6 z-10 flex gap-2">
        <div className="bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
          32 Online Now
        </div>
        <div className="bg-indigo-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
          1.2k Active Viewers
        </div>
      </div>
      <div className="absolute bottom-6 left-6 z-10 bg-[#0b0e14]/80 backdrop-blur-xl p-5 rounded-3xl border border-white/10 max-w-xs shadow-2xl">
        <h4 className="text-sm font-bold text-white mb-2">Live Pulse Map</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
          Click on a streamer icon to verify their current location or report a new sighting.
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
            <span>Community Trust</span>
            <span className="text-emerald-400">98.2% Verified</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[98%] h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
