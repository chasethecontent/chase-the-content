
import React from 'react';
import { Clip } from '../types';

interface ClipCardProps {
  clip: Clip;
  onVote: (id: string) => void;
  voted: boolean;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip, onVote, voted }) => {
  return (
    <div className="bg-[#151921] rounded-2xl overflow-hidden border border-white/5 group hover:border-indigo-500/50 transition-all shadow-xl shadow-black/20">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={clip.thumbnail} 
          alt={clip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold">
            SP
          </div>
          <span className="text-xs font-bold text-white drop-shadow-md">{clip.streamerName}</span>
        </div>
        <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-semibold text-white leading-snug line-clamp-2">
            {clip.title}
          </h3>
          <button 
            onClick={() => onVote(clip.id)}
            className={`flex flex-col items-center gap-1 min-w-[40px] p-1.5 rounded-lg transition-colors ${voted ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l-8 8h16l-8-8z" />
            </svg>
            <span className="text-xs font-bold">{clip.votes + (voted ? 1 : 0)}</span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {clip.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              #{tag}
            </span>
          ))}
          <span className="ml-auto text-[10px] font-medium text-slate-500 self-center">
            {clip.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClipCard;
