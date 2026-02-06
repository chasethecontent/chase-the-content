
import React, { useState } from 'react';
import { analyzeStreamerTrends } from '../geminiService';

interface SubmitFormProps {
  onSubmit: (data: any) => void;
}

const SubmitForm: React.FC<SubmitFormProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const handleAiCheck = async () => {
    if (!title) return;
    setAnalyzing(true);
    const result = await analyzeStreamerTrends(title);
    setAiInsight(result || 'No insight found.');
    setAnalyzing(false);
  };

  return (
    <div className="max-w-2xl mx-auto pt-32 px-6">
      <div className="bg-[#151921] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Submit a Pulse Moment</h2>
        <p className="text-slate-400 mb-8 text-sm">
          Found something crazy? Share it with the community. High-quality clips earn you more reputation.
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Clip URL (Twitch/YouTube/Kick)</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#0b0e14] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
              placeholder="https://..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Catchy Title</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 bg-[#0b0e14] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
                placeholder="What happened?"
              />
              <button 
                onClick={handleAiCheck}
                disabled={analyzing}
                className="bg-purple-600/20 text-purple-400 px-4 py-3 rounded-xl hover:bg-purple-600/30 transition-colors text-xs font-bold flex items-center gap-2"
              >
                {analyzing ? 'Checking...' : 'AI Verify'}
              </button>
            </div>
          </div>

          {aiInsight && (
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <p className="text-xs text-indigo-300 font-medium italic">
                ✨ Gemini Insight: {aiInsight}
              </p>
            </div>
          )}

          <button 
            onClick={() => onSubmit({ url, title })}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-[0.98]"
          >
            Post Moment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitForm;
