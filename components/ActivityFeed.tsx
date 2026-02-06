
import React from 'react';

interface Activity {
  id: number;
  text: string;
  type: 'vote' | 'sighting' | 'submission';
  time: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const icons = {
    vote: '🔥',
    sighting: '📍',
    submission: '🎥'
  };

  return (
    <div className="sticky top-32">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Live Community Stream</h3>
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="bg-[#151921]/50 border border-white/5 p-6 rounded-3xl text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Waiting for updates...</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-[#151921] border border-white/5 p-4 rounded-2xl flex gap-3 items-start animate-in slide-in-from-right-4 duration-500"
            >
              <span className="text-lg">{icons[activity.type]}</span>
              <div>
                <p className="text-xs text-slate-200 font-medium leading-tight mb-1">
                  {activity.text}
                </p>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  {activity.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-3xl">
        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Top Contributor</h4>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-black text-white italic">JB</div>
          <div>
            <div className="text-sm font-black text-white italic uppercase">Jung_Beast</div>
            <div className="text-[10px] font-bold text-slate-500">Rank: Elite Tracker</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
