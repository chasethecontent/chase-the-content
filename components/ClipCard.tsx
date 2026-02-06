import React, { useState, useMemo } from 'react';
import { Clip, User } from '../types';
import Comments from './Comments';

interface ClipCardProps {
  clip: Clip;
  onVote: (id: string) => void;
  voted: boolean;
  currentUser: User;
  dbConnected: boolean;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip, onVote, voted, currentUser, dbConnected }) => {
  const [showComments, setShowComments] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract embed URL based on platform
  const embedUrl = useMemo(() => {
    const url = clip.video_url || clip.videoUrl || '';
    if (!url) return null;

    // Kick Clips: https://kick.com/username/clips/clip_ID
    // Robust regex to capture the ID after /clips/ regardless of what's before it
    const kickMatch = url.match(/kick\.com\/[^\/]+\/clips\/(clip_[a-zA-Z0-9_]+)/i);
    if (kickMatch) {
      // The standard and most reliable endpoint for Kick clips is /clips/ID
      return `https://player.kick.com/clips/${kickMatch[1]}`;
    }

    // YouTube: https://www.youtube.com/watch?v=ID or https://youtu.be/ID
    const ytMatch = url.match(/(?:v=|be\/|embed\/)([^&?/\s]+)/);
    if (ytMatch && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&modestbranding=1&rel=0`;
    }

    // Twitch Clips: https://clips.twitch.tv/Slug or https://www.twitch.tv/user/clip/Slug
    const twitchMatch = url.match(/clips\.twitch\.tv\/([^&?/\s]+)/) || url.match(/twitch\.tv\/.*\/clip\/([^&?/\s]+)/);
    if (twitchMatch) {
      const parent = window.location.hostname;
      return `https://clips.twitch.tv/embed?clip=${twitchMatch[1]}&parent=${parent}&autoplay=true`;
    }

    return null;
  }, [clip.video_url, clip.videoUrl]);

  return (
    <div className="bg-[#151921] rounded-2xl overflow-hidden border border-white/5 group hover:border-indigo-500/50 transition-all shadow-xl shadow-black/20">
      <div className="relative aspect-video overflow-hidden bg-black">
        {!isPlaying ? (
          <>
            <img 
              src={clip.thumbnail} 
              alt={clip.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                CH
              </div>
              <span className="text-xs font-bold text-white drop-shadow-md">{clip.streamerName}</span>
            </div>
            <button 
              onClick={() => setIsPlaying(true)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-indigo-600/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-2xl shadow-indigo-500/40"
            >
              <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </>
        ) : (
          <div className="w-full h-full relative">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-[10px] uppercase font-black tracking-widest italic">Embed Format Unsupported</span>
              </div>
            )}
            <button 
              onClick={() => setIsPlaying(false)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all z-20 hover:scale-110"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-semibold text-white leading-snug line-clamp-2 italic uppercase text-sm tracking-tight">
            {clip.title}
          </h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => onVote(clip.id)}
              className={`flex flex-col items-center gap-1 min-w-[44px] p-2 rounded-xl transition-all ${voted ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4l-8 8h16l-8-8z" />
              </svg>
              <span className="text-[10px] font-black tracking-tighter">{clip.votes + (voted ? 1 : 0)}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex flex-col items-center gap-1 min-w-[44px] p-2 rounded-xl transition-all ${showComments ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-[8px] font-black uppercase tracking-tighter">Chat</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {clip.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-slate-800/50 rounded text-[9px] font-black text-slate-500 uppercase tracking-widest border border-white/5">
              #{tag}
            </span>
          ))}
        </div>

        {showComments && (
          <Comments 
            clipId={clip.id} 
            currentUser={currentUser} 
            dbConnected={dbConnected} 
          />
        )}
      </div>
    </div>
  );
};

export default ClipCard;