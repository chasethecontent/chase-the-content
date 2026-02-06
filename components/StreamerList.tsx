
import React, { useState } from 'react';
import { Streamer } from '../types';

interface StreamerListProps {
  streamers: Streamer[];
}

const StreamerList: React.FC<StreamerListProps> = ({ streamers }) => {
  const [tab, setTab] = useState<'online' | 'offline'>('online');

  const onlineStreamers = streamers
    .filter(s => s.status === 'online')
    .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));

  const offlineStreamers = streamers
    .filter(s => s.status === 'offline');

  const displayList = tab === 'online' ? onlineStreamers : offlineStreamers;

  return (
    <div className="pt-32 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Content Hub</h2>
        <div className="flex bg-[#151921] p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setTab('online')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tab === 'online' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Online ({onlineStreamers.length})
          </button>
          <button 
            onClick={() => setTab('offline')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${tab === 'offline' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Offline ({offlineStreamers.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayList.length > 0 ? (
          displayList.map((streamer) => (
            <div 
              key={streamer.id} 
              className="bg-[#151921] border border-white/5 hover:border-indigo-500/30 p-6 rounded-[32px] flex items-center gap-6 transition-all group"
            >
              <div className="relative">
                <img 
                  src={streamer.avatar} 
                  alt={streamer.name} 
                  className="w-20 h-20 rounded-full border-2 border-indigo-500/50 group-hover:border-indigo-500 transition-colors shadow-2xl"
                />
                {streamer.status === 'online' && (
                  <div className="absolute -bottom-1 -right-1 bg-red-600 text-[8px] font-black px-2 py-0.5 rounded-full border-2 border-[#151921] animate-pulse">
                    LIVE
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                    {streamer.name}
                  </h3>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded uppercase tracking-widest">
                    {streamer.platform}
                  </span>
                </div>
                <p className="text-slate-400 text-sm font-medium line-clamp-1 italic">
                  {streamer.status === 'online' ? `Streaming ${streamer.category}` : streamer.bio}
                </p>
                <div className="flex items-center gap-4 mt-3">
                   <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{streamer.locationName}</span>
                   </div>
                   {streamer.status === 'online' && (
                     <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-red-500"></div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                          {streamer.viewerCount?.toLocaleString()} Viewers
                        </span>
                     </div>
                   )}
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end">
                 <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Trust Score</div>
                 <div className="text-3xl font-black text-white italic">{(streamer.votes / 10).toFixed(1)}k</div>
              </div>

              <button className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="bg-[#151921]/50 border border-white/5 border-dashed p-20 rounded-[40px] text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              {tab === 'online' ? '🌙' : '👻'}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 italic uppercase">No {tab} content found</h3>
            <p className="text-slate-500 text-sm">Everyone is currently {tab === 'online' ? 'offline' : 'online'} right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamerList;
