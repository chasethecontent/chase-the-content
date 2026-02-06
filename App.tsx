
import React, { useState, useEffect } from 'react';
import { Streamer, Clip, User, View } from './types';
import { INITIAL_STREAMERS, INITIAL_CLIPS } from './constants';
import Navbar from './components/Navbar';
import ClipCard from './components/ClipCard';
import MapView from './components/MapView';
import SubmitForm from './components/SubmitForm';
import DeploymentGuide from './components/DeploymentGuide';
import SearchPulse from './components/SearchPulse';
import ActivityFeed from './components/ActivityFeed';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<View>('feed');
  const [streamers, setStreamers] = useState<Streamer[]>(INITIAL_STREAMERS);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('sp_user');
    return saved ? JSON.parse(saved) : {
      id: 'u1',
      username: 'Viewer' + Math.floor(Math.random() * 1000),
      points: 125,
      votedIds: []
    };
  });

  useEffect(() => {
    const checkConfig = isSupabaseConfigured();
    setDbConnected(checkConfig);

    const fetchData = async () => {
      setLoading(true);
      try {
        if (!checkConfig) {
          setClips(INITIAL_CLIPS);
          setLoading(false);
          return;
        }

        const { data: clipData } = await supabase.from('clips').select('*').order('votes', { ascending: false });
        const { data: streamerData } = await supabase.from('streamers').select('*');
          
        if (clipData && clipData.length > 0) setClips(clipData as any);
        else setClips(INITIAL_CLIPS);

        if (streamerData && streamerData.length > 0) {
          const formatted: Streamer[] = streamerData.map((s: any) => ({
            ...s,
            location: [s.location_lat, s.location_lng]
          }));
          setStreamers(formatted);
        }
      } catch (err: any) {
        setInitError(err.message || "Failed to connect to database");
        setClips(INITIAL_CLIPS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addActivity = (text: string, type: 'vote' | 'sighting' | 'submission') => {
    setActivities(prev => [{ id: Date.now(), text, type, time: 'Just now' }, ...prev].slice(0, 5));
  };

  const handleVote = async (id: string) => {
    if (user.votedIds.includes(id)) return;
    const clip = clips.find(c => c.id === id);
    
    setClips(prev => prev.map(c => c.id === id ? { ...c, votes: (c.votes || 0) + 1 } : c));
    setUser(prev => ({ ...prev, votedIds: [...prev.votedIds, id], points: prev.points + 10 }));
    addActivity(`${user.username} voted for "${clip?.title}"`, 'vote');

    if (dbConnected) {
      const { data } = await supabase.from('clips').select('votes').eq('id', id).single();
      await supabase.from('clips').update({ votes: (data?.votes || 0) + 1 }).eq('id', id);
    }
  };

  const handleReportLocation = async (streamer: Streamer, newLoc: [number, number]) => {
    // Update local state
    setStreamers(prev => prev.map(s => s.id === streamer.id ? { ...s, location: newLoc } : s));
    setUser(prev => ({ ...prev, points: prev.points + 50 }));
    addActivity(`${user.username} spotted ${streamer.name} at new coordinates!`, 'sighting');

    if (dbConnected) {
      await supabase.from('streamers').update({ 
        location_lat: newLoc[0], 
        location_lng: newLoc[1] 
      }).eq('id', streamer.id);
    }
  };

  const handleSubmission = async (data: any) => {
    const newClipObj = {
      streamer_name: data.streamer || 'Anonymous',
      title: data.title,
      thumbnail: `https://picsum.photos/seed/${Date.now()}/400/225`,
      video_url: data.url,
      votes: 0,
      tags: ['NEW', 'COMMUNITY']
    };

    if (dbConnected) {
      const { data: inserted } = await supabase.from('clips').insert([newClipObj]).select();
      if (inserted) setClips([inserted[0] as any, ...clips]);
    } else {
      setClips([{ ...newClipObj, id: Date.now().toString(), timestamp: 'just now' } as any, ...clips]);
    }
    
    setView('feed');
    setUser(prev => ({ ...prev, points: prev.points + 100 }));
    addActivity(`${user.username} submitted a new viral moment!`, 'submission');
  };

  if (loading && view !== 'deployment') {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(99,102,241,0.4)]"></div>
          <h2 className="text-white font-black italic uppercase tracking-tighter animate-pulse">Initializing Pulse...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200">
      <Navbar currentView={view} setView={setView} userPoints={user.points} />

      <main className="container mx-auto">
        {initError && view !== 'deployment' && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-6">
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 text-red-400 shadow-2xl">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="text-xs font-bold leading-tight">
                DB ERROR: {initError}. 
                <button onClick={() => setView('deployment')} className="underline ml-1 hover:text-white">Run SQL fix.</button>
              </div>
            </div>
          </div>
        )}

        {view === 'feed' && (
          <div className="pt-32 px-6 pb-20 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-12">
            <div>
              <div className="max-w-4xl mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                  <div className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    {dbConnected ? 'Community Live' : 'Sandbox Active'}
                  </span>
                </div>
                <h1 className="text-7xl font-black text-white tracking-tighter italic uppercase mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">StreamPulse</h1>
                <SearchPulse />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clips.map(clip => (
                  <ClipCard 
                    key={clip.id} 
                    clip={clip} 
                    onVote={handleVote}
                    voted={user.votedIds.includes(clip.id)}
                  />
                ))}
              </div>
            </div>

            <div className="hidden xl:block">
              <ActivityFeed activities={activities} />
            </div>
          </div>
        )}

        {view === 'map' && <div className="px-6 pb-20"><MapView streamers={streamers} onReportLocation={handleReportLocation} /></div>}
        {view === 'leaderboard' && (
          <div className="pt-32 px-6 max-w-4xl mx-auto pb-20">
            <h1 className="text-5xl font-black text-white mb-8 italic uppercase tracking-tighter">Verified Content Kings</h1>
            <div className="space-y-4">
              {streamers.sort((a,b) => b.votes - a.votes).map((s, i) => (
                <div key={s.id} className="bg-[#151921] border border-white/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-indigo-500/40 transition-all">
                  <span className="text-3xl font-black text-slate-800 italic group-hover:text-indigo-500/20 transition-colors">0{i+1}</span>
                  <img src={s.avatar} className="w-16 h-16 rounded-full border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                  <div className="flex-1">
                    <h3 className="font-black text-xl text-white italic uppercase">{s.name}</h3>
                    <p className="text-xs text-slate-500 font-medium tracking-wide">{s.bio}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-400 italic">{(s.votes / 10).toFixed(1)}k</div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Trust Points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === 'submit' && <SubmitForm onSubmit={handleSubmission} />}
        {view === 'deployment' && <DeploymentGuide />}
      </main>
    </div>
  );
};

export default App;
