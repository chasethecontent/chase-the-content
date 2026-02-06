
import React, { useState } from 'react';
import { getStreamerPulse, PulseResult } from '../geminiService';

const SearchPulse: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PulseResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const pulse = await getStreamerPulse(query);
    setResult(pulse);
    setLoading(false);
  };

  return (
    <div className="w-full mb-12">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-focus-within:bg-indigo-500/40 transition-all rounded-3xl"></div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chase the content... (e.g. Kai Cenat Paris, xQc, etc.)"
          className="w-full bg-[#151921] border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-indigo-500 relative z-10 transition-all text-lg shadow-2xl"
        />
        <button 
          type="submit"
          className="absolute right-4 top-3 bottom-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl font-bold z-20 transition-all active:scale-95 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Tracking...' : 'Chase Content'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Content Report</span>
          </div>
          <p className="text-slate-200 leading-relaxed italic text-sm md:text-base mb-4">
            "{result.text}"
          </p>
          
          {result.links.length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Verified Sources:</span>
              <div className="flex flex-wrap gap-2">
                {result.links.map((link, idx) => (
                  <a 
                    key={idx} 
                    href={link.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-indigo-500/5 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold text-indigo-400 transition-colors"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPulse;
