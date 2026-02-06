
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
import StreamerList from './components/StreamerList';
import Auth from './components/Auth';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { getLiveStreams } from './lib/twitch';

// Helper to check if string is a valid UUID
const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const App: React.FC = () => {
  const [view, setView] = useState<View>('feed');
  const [streamers, setStreamers] = useState<Streamer[]>(INITIAL_STREAMERS);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);

  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('sp_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id) return parsed;
      }
    } catch (e) {}
    return {
      id: 'u' + Math.random().toString(36).substr(2, 9),
      username: 'Chaser' + Math.floor(Math.random() * 1000),
      points: 100,
      votedIds: []
    };
  });

  useEffect(() => {
    const checkConfig = isSupabaseConfigured();
    setDbConnected(checkConfig);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(prev => ({
          ...prev,
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
          email: session.user.email
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(prev => ({
          ...prev,
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
          email: session.user.email
        }));
      } else {
        setUser({
          id: 'u' + Math.random().toString(36).substr(2, 9),
          username: 'GuestChaser',
          points: 0,
          votedIds: []
        });
      }
    });

    const fetchData = async () => {
      setLoading(true);
      try {
        let currentStreamers = [...INITIAL_STREAMERS];
        if (checkConfig) {
          const { data: clipData } = await supabase.from('clips').select('*').order('created_at', { ascending: false });
          const { data: streamerData } = await supabase.from('streamers').select('*');
          
          if (clipData) {
            const mappedClips = clipData.map((c: any) => ({
              ...c,
              streamerName: c.streamer_name,
              videoUrl: c.video_url
            }));
            // Merge DB clips with initial ones if DB is empty, otherwise show DB
            setClips(mappedClips.length > 0 ? mappedClips : INITIAL_CLIPS);
          } else {
            setClips(INITIAL_CLIPS);
          }

          if (streamerData && streamerData.length > 0) {
            currentStreamers = streamerData.map((s: any) => ({
              ...s,
              location: [s.location_lat, s.location_lng]
            }));
          }
        } else {
          setClips(INITIAL_CLIPS);
        }

        const twitchNames = currentStreamers
          .filter(s => s.platform === 'Twitch')
          .map(s => s.name);
        
        const liveData = await getLiveStreams(twitchNames);
        
        const updatedStreamers = currentStreamers.map(s => {
          const liveInfo = liveData.find((l: any) => l.user_name.toLowerCase() === s.name.toLowerCase());
          return {
            ...s,
            status: liveInfo ? 'online' : 'offline',
            category: liveInfo ? liveInfo.game_name : s.category,
            viewerCount: liveInfo ? liveInfo.viewer_count : 0
          };
        });

        setStreamers(updatedStreamers as Streamer[]);

      } catch (err: any) {
        setInitError(err.message || "Failed to sync data");
        setClips(INITIAL_CLIPS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('sp_user', JSON.stringify(user));
  }, [user]);

  const addActivity = (text: string, type: 'vote' | 'sighting' | 'submission') => {
    setActivities(prev => [{ id: Date.now(), text, type, time: 'Just now' }, ...prev].slice(0, 5));
  };

  const handleVote = async (id: string) => {
    if (user.votedIds.includes(id)) return;
    
    setClips(prev => prev.map(c => c.id === id ? { ...c, votes: (c.votes || 0) + 1 } : c));
    setUser(prev => ({ ...prev, votedIds: [...prev.votedIds, id], points: prev.points + 10 }));
    addActivity(`${user.username} voted for a viral moment`, 'vote');

    if (dbConnected && isUUID(id)) {
      try {
        const { data } = await supabase.from('clips').select('votes').eq('id', id).single();
        await supabase.from('clips').update({ votes: (data?.votes || 0) + 1 }).eq('id', id);
      } catch (e) {
        console.error("Vote persistence error:", e);
      }
    }
  };

  const handleReportLocation = async (streamer: Streamer, newLoc: [number, number]) => {
    setStreamers(prev => prev.map(s => s.id === streamer.id ? { ...s, location: newLoc } : s));
    setUser(prev => ({ ...prev, points: prev.points + 50 }));
    addActivity(`${user.username} spotted ${streamer.name} at new coordinates!`, 'sighting');
  };

  const handleSubmission = async (data: any) => {
    const newClipObj: any = { 
      streamer_name: data.streamer_name || data.streamer || 'Unknown',
      title: data.title,
      video_url: data.video_url,
      thumbnail: `https://picsum.photos/seed/${Math.random()}/400/225`,
      votes: 0, 
      tags: ['NEW']
    };

    // Only add user_id if it's a real UUID from Auth
    if (isUUID(user.id)) {
      newClipObj.user_id = user.id;
    }

    if (dbConnected) {
      const { data: inserted, error } = await supabase.from('clips').insert([newClipObj]).select();
      if (!error && inserted && inserted.length > 0) {
        const mapped = {
          ...inserted[0],
          streamerName: inserted[0].streamer_name,
          videoUrl: inserted[0].video_url
        };
        setClips(prev => [mapped as any, ...prev]);
      } else {
        console.error("Submission Error:", error);
      }
    } else {
      const demoClip = { 
        ...newClipObj, 
        id: Date.now().toString(), 
        streamerName: newClipObj.streamer_name,
        videoUrl: newClipObj.video_url,
        timestamp: 'just now' 
      };
      setClips(prev => [demoClip as any, ...prev]);
    }
    
    setView('feed');
    setUser(prev => ({ ...prev, points: prev.points + 100 }));
    addActivity(`${user.username} shared a moment!`, 'submission');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('feed');
  };

  if (loading && view !== 'deployment') {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white font-black italic uppercase tracking-tighter animate-pulse">Chasing Content...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200">
      <Navbar 
        currentView={view} 
        setView={setView} 
        userPoints={user.points} 
        isLoggedIn={!!session} 
        username={user.username}
        onLogout={handleLogout}
      />

      <main className="container mx-auto">
        {view === 'auth' && <Auth onComplete={() => setView('feed')} />}
        
        {view === 'feed' && (
          <div className="pt-32 px-6 pb-20 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-12">
            <div>
              <div className="max-w-4xl mb-16">
                <h1 className="text-7xl font-black text-white tracking-tighter italic uppercase mb-4">Chase The Content</h1>
                <SearchPulse />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clips.map(clip => (
                  <ClipCard 
                    key={clip.id} 
                    clip={clip} 
                    onVote={handleVote} 
                    voted={user.votedIds.includes(clip.id)} 
                    currentUser={user}
                    dbConnected={dbConnected}
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
        {view === 'list' && <div className="px-6 pb-20"><StreamerList streamers={streamers} /></div>}
        {view === 'leaderboard' && (
          <div className="pt-32 px-6 max-w-4xl mx-auto pb-20">
             <h1 className="text-5xl font-black text-white mb-8 italic uppercase tracking-tighter">Verified Content Kings</h1>
             <div className="space-y-4">
               {streamers.sort((a,b) => b.votes - a.votes).map((s, i) => (
                 <div key={s.id} className="bg-[#151921] border border-white/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-indigo-500/40 transition-all">
                   <span className="text-3xl font-black text-slate-800 italic">0{i+1}</span>
                   <div className="relative">
                     <img src={s.avatar} className="w-16 h-16 rounded-full border-2 border-indigo-500" />
                     {s.status === 'online' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#151921] rounded-full animate-pulse"></div>}
                   </div>
                   <div className="flex-1">
                     <h3 className="font-black text-xl text-white italic uppercase">{s.name}</h3>
                     <p className="text-xs text-slate-500">{s.status === 'online' ? `Live: ${s.category}` : s.bio}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
        {view === 'submit' && <SubmitForm onSubmit={handleSubmission} user={user} isLoggedIn={!!session} />}
        {view === 'deployment' && <DeploymentGuide />}
      </main>
    </div>
  );
};

export default App;
