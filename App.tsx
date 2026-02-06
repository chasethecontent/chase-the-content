
import React, { useState, useEffect, useCallback } from 'react';
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

// App component completed to resolve ReactNode return requirement for FC type
const App: React.FC = () => {
  const [view, setView] = useState<View>('feed');
  const [streamers, setStreamers] = useState<Streamer[]>(INITIAL_STREAMERS);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
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

  const fetchData = useCallback(async (checkConfig: boolean) => {
    try {
      let currentStreamers = [...INITIAL_STREAMERS];
      let fetchedClips: Clip[] = [];

      if (checkConfig) {
        const { data: clipData } = await supabase.from('clips').select('*').order('created_at', { ascending: false });
        const { data: streamerData } = await supabase.from('streamers').select('*');
        
        if (clipData) {
          fetchedClips = clipData.map((c: any) => ({
            ...c,
            streamerName: c.streamer_name,
            videoUrl: c.video_url
          }));
        }

        if (streamerData && streamerData.length > 0) {
          currentStreamers = streamerData.map((s: any) => ({
            ...s,
            location: [s.location_lat, s.location_lng]
          }));
        }
      }

      setClips([...fetchedClips, ...INITIAL_CLIPS]);

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
      console.error("Fetch Data Error:", err);
      setClips(INITIAL_CLIPS);
    } finally {
      setLoading(false);
    }
  }, []);

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

    fetchData(checkConfig);
    return () => subscription.unsubscribe();
  }, [fetchData]);

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
    addActivity(`${user.username} updated ${streamer.name}'s location`, 'sighting');
  };

  const handleSubmitClip = async (data: any) => {
    if (dbConnected) {
      const { error } = await supabase.from('clips').insert([{
        ...data,
        user_id: user.id,
        votes: 0,
        tags: ['COMMUNITY', 'VIRAL']
      }]);
      if (error) console.error("Submit Error:", error);
    }
    addActivity(`${user.username} shared a new moment`, 'submission');
    setView('feed');
    fetchData(dbConnected);
  };

  const renderContent = () => {
    switch (view) {
      case 'feed':
        return (
          <div className="pt-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <SearchPulse />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="hidden lg:block">
              <ActivityFeed activities={activities} />
            </div>
          </div>
        );
      case 'map':
        return <MapView streamers={streamers} onReportLocation={handleReportLocation} />;
      case 'list':
        return <StreamerList streamers={streamers} />;
      case 'submit':
        return <SubmitForm onSubmit={handleSubmitClip} user={user} isLoggedIn={!!session} />;
      case 'deployment':
        return <DeploymentGuide />;
      case 'auth':
        return <Auth onComplete={() => setView('feed')} />;
      case 'leaderboard':
        return (
          <div className="pt-40 text-center text-white">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Top Chasers</h2>
            <div className="max-w-xl mx-auto bg-[#151921] rounded-3xl p-8 border border-white/5">
               <div className="flex justify-between items-center py-4 border-b border-white/5">
                 <span className="font-bold">1. Jung_Beast</span>
                 <span className="text-emerald-400 font-black">12,450 pts</span>
               </div>
               <div className="flex justify-between items-center py-4">
                 <span className="font-bold">2. {user.username} (You)</span>
                 <span className="text-emerald-400 font-black">{user.points} pts</span>
               </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 selection:bg-indigo-500/30">
      <Navbar 
        currentView={view} 
        setView={setView} 
        userPoints={user.points} 
        isLoggedIn={!!session}
        username={user.username}
        onLogout={() => supabase.auth.signOut()}
      />
      <main className="pb-20">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
