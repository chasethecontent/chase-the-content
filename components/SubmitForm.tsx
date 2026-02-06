
import React, { useState } from 'react';
import { User } from '../types';
import { analyzeStreamerTrends } from '../geminiService';

interface SubmitFormProps {
  onSubmit: (data: any) => void;
  user: User;
  isLoggedIn: boolean;
}

const SubmitForm: React.FC<SubmitFormProps> = ({ onSubmit, user, isLoggedIn }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [streamer, setStreamer] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const handleAiCheck = async () => {
    if (!title) return;
    setAnalyzing(true);
    const result = await analyzeStreamerTrends(title);
    setAiInsight(result || 'No insight found.');
    setAnalyzing(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto pt-40 px-6 text-center">
        <div className="bg-[#151921] border border-white/10 rounded-3xl p-12">
          <div className="text-4xl mb-6">🔒</div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Auth Required</h2>
          <p className="text-slate-400 text-sm mb-8 italic">Only verified Chasers can post community content. Join for free to share viral moments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-32 px-6">
      <div className="bg-[#151921] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tighter">Submit a Content Moment</h2>
        <p className="text-slate-400 mb-8 text-sm italic">
          Logged in as <span className="text-indigo-400 font-bold">{user.username}</span>. High-quality clips earn you reputation.
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Streamer Name</label>
            <input 
              type="text" 
              value={streamer}
              onChange={(e) => setStreamer(e.target.value)}
              className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 transition-colors text-white font-medium"
              placeholder="e.g. KaiCenat"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Clip URL (Twitch/YouTube/Kick)</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 transition-colors text-white font-medium"
              placeholder="https://..."
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Catchy Title</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 bg-[#0b0e14] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 transition-colors text-white font-medium"
                placeholder="What happened?"
              />
              <button 
                onClick={handleAiCheck}
                disabled={analyzing}
                className="bg-purple-600/20 text-purple-400 px-6 rounded-2xl hover:bg-purple-600/30 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                {analyzing ? 'Checking...' : 'AI Pulse'}
              </button>
            </div>
          </div>

          {aiInsight && (
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-in slide-in-from-top-2">
              <p className="text-xs text-indigo-300 font-medium italic">
                ✨ Gemini Insight: {aiInsight}
              </p>
            </div>
          )}

          <button 
            onClick={() => onSubmit({ video_url: url, title, streamer_name: streamer })}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black italic uppercase py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all transform active:scale-[0.98]"
          >
            Post Viral Moment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitForm;
