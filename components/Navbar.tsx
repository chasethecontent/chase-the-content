
import React from 'react';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  userPoints: number;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, userPoints }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b0e14]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setView('feed')}
        >
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center animate-pulse">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            Chase The Content
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button 
            onClick={() => setView('feed')}
            className={`transition-colors ${currentView === 'feed' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            Clip Feed
          </button>
          <button 
            onClick={() => setView('list')}
            className={`transition-colors ${currentView === 'list' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            Streamers
          </button>
          <button 
            onClick={() => setView('map')}
            className={`transition-colors ${currentView === 'map' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            Live Map
          </button>
          <button 
            onClick={() => setView('leaderboard')}
            className={`transition-colors ${currentView === 'leaderboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            Leaderboard
          </button>
          <button 
            onClick={() => setView('deployment')}
            className={`transition-colors ${currentView === 'deployment' ? 'text-amber-400' : 'text-slate-400 hover:text-white'} flex items-center gap-1.5`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            Go Live Guide
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setView('submit')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          Submit Clip
        </button>
        <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Reputation</span>
          <span className="text-sm font-bold text-emerald-400">{userPoints} pts</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
