
import React, { useState, useEffect } from 'react';
import { Streamer, Clip, User, View } from './types';
import { INITIAL_STREAMERS, INITIAL_CLIPS } from './constants';
import Navbar from './components/Navbar';
import ClipCard from './components/ClipCard';
import MapView from './components/MapView';
import SubmitForm from './components/SubmitForm';
import DeploymentGuide from './components/DeploymentGuide';
import SearchPulse from './components/SearchPulse';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<View>('feed');
  const [streamers, setStreamers] = useState<Streamer[]>(INITIAL_STREAMERS);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('sp_user');
    return saved ? JSON.parse(saved) : {
      id: 'u1',
      username: 'Viewer7',
      points: 125,
      votedIds: []
    };
  });

  useEffect(() => {
    const checkConfig = isSupabaseConfigured();
    setDbConnected(checkConfig);

    const fetchData = async () => {
      if (!checkConfig) {
        setClips(INITIAL_CLIPS);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: clipData } = await supabase
          .from('clips')
          .select('*')
          .order('votes', { ascending: false });

        const { data: streamerData } = await supabase
          .from('streamers')
          .select('*');

        if (clipData && clipData.length > 0) setClips(clipData as any);
        else setClips(INITIAL_CLIPS);

        if (streamerData && streamerData.length > 0) {
          const formatted: Streamer[] = streamerData.map((s: any) => ({
            ...s,
            location: [s.location_lat, s.location_lng]
          }));
          setStreamers(formatted);
        }
      } catch (err) {
        setClips(INITIAL_CLIPS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('sp_user', JSON.stringify(user));
  }, [user]);

  const handleVote = async (id: string) => {
    if (user.votedIds.includes(id)) return;

    // Optimistic Update
    setClips(prev => prev.map(c => c.id === id ? { ...c, votes: (c.votes || 0) + 1 } : c));
    setUser(prev => ({
      ...prev,
      votedIds: [...prev.votedIds, id],
      points: prev.points + 10
    }));

    if (dbConnected) {
      const { data } = await supabase.from('clips').select('votes').eq('id', id).single();
      await supabase.from('clips').update({ votes: (data?.votes || 0) + 1 }).eq('id', id);
    }
  };

  const handleReportLocation = (streamer: Streamer) => {
    alert(`Reporting ${streamer.name}... Verification logic initiated!`);
    setUser(prev => ({ ...prev, points: prev.points + 20 }));
  };

  const handleSubmission = async (data: any) => {
    const newClipObj = {
      streamer_name: 'Anonymous',
      title: data.title,
      thumbnail: `https://picsum.photos/seed/${Date.now()}/400/225`,
      video_url: data.url,
      votes: 0,
      tags: ['NEW']
    };

    if (dbConnected) {
      const { data: inserted } = await supabase.from('clips').insert([newClipObj]).select();
      if (inserted) setClips([inserted[0] as any, ...clips]);
    } else {
      setClips([{ ...newClipObj, id: Date.now().toString(), streamerId: '0', timestamp: 'just now' } as any, ...clips]);
    }
    
    setView('feed');
    setUser(prev => ({ ...prev, points: prev.points + 50 }));
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200">
      <Navbar currentView={view} setView={setView} userPoints={user.points} />

      <main className="container mx-auto">
        {!dbConnected && view !== 'deployment' && (
          <div className="fixed bottom-24 right-6 z-50 animate-bounce">
            <div className="bg-amber-500 text-black px-4 py-2 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Connect Supabase Keys
            </div>
          </div>
        )}

        {view === 'feed' && (
          <div className="pt-32 px-6 pb-20">
            <div className="max-w-4xl mx-auto mb-16 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <div className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  {dbConnected ? 'Live Community Cloud' : 'Local Sandbox Mode'}
                </span>
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase mb-4">StreamPulse</h1>
              <SearchPulse />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        )}

        {view === 'map' && <div className="px-6 pb-20"><MapView streamers={streamers} onReportLocation={handleReportLocation} /></div>}
        {view === 'leaderboard' && (
          <div className="pt-32 px-6 max-w-4xl mx-auto pb-20">
            <h1 className="text-4xl font-black text-white mb-8 italic uppercase tracking-tighter">Leaderboard</h1>
            <div className="space-y-4">
              {streamers.map((s, i) => (
                <div key={s.id} className="bg-[#151921] border border-white/5 p-6 rounded-2xl flex items-center gap-6">
                  <span className="text-2xl font-black text-slate-700">#{i+1}</span>
                  <img src={s.avatar} className="w-14 h-14 rounded-full border-2 border-indigo-500" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{s.name}</h3>
                    <p className="text-xs text-slate-500">{s.bio}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black">{s.votes}</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Trust Score</div>
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
