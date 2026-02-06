
import React, { useState } from 'react';

const DeploymentGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sql = `
-- 1. Create the Streamers Table
create table streamers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  platform text,
  location_lat float8,
  location_lng float8,
  avatar text,
  votes integer default 0,
  bio text,
  created_at timestamp with time zone default now()
);

-- 2. Create the Clips Table
create table clips (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  video_url text,
  thumbnail text,
  votes integer default 0,
  streamer_name text,
  tags text[],
  created_at timestamp with time zone default now()
);

-- 3. Insert some initial data (Optional)
insert into streamers (name, platform, location_lat, location_lng, avatar, bio)
values ('IShowSpeed', 'YouTube', 48.8566, 2.3522, 'https://picsum.photos/seed/speed/200/200', 'Traveling the world.');
  `.trim();

  const copySql = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 px-6 max-w-5xl mx-auto pb-32">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            Deployment Protocol v1.0
          </div>
        </div>
        <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-6">
          Launch <span className="text-indigo-500">Mission</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
          You have the accounts. Now follow this sequence to move your local code into the global cloud.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        <div className="space-y-12 relative">
          {/* Vertical Progress Line */}
          <div className="absolute left-[19px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent opacity-20 hidden md:block"></div>

          {/* STEP 1: GITHUB */}
          <section className="relative pl-0 md:pl-12">
            <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#0b0e14] border-2 border-indigo-500 flex items-center justify-center z-10 hidden md:flex shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <span className="text-xs font-bold text-white">01</span>
            </div>
            <div className="bg-[#151921] border border-white/5 rounded-3xl p-8 hover:bg-[#1a1f29] transition-all group">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                Push Code to GitHub
              </h3>
              <p className="text-slate-400 text-sm mb-6">Create a "New Repository" on GitHub, then run these commands in your project folder:</p>
              <div className="bg-black/40 rounded-2xl p-6 font-mono text-[11px] text-indigo-300 leading-relaxed border border-white/5">
                <span className="text-slate-600"># Initialize and commit</span><br/>
                git init<br/>
                git add .<br/>
                git commit -m "initial: stream pulse base"<br/><br/>
                <span className="text-slate-600"># Link and push (Replace YOUR_URL)</span><br/>
                git branch -M main<br/>
                git remote add origin https://github.com/YOUR_USER/streampulse.git<br/>
                git push -u origin main
              </div>
            </div>
          </section>

          {/* STEP 2: SUPABASE */}
          <section className="relative pl-0 md:pl-12">
            <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#0b0e14] border-2 border-emerald-500 flex items-center justify-center z-10 hidden md:flex">
              <span className="text-xs font-bold text-white">02</span>
            </div>
            <div className="bg-[#151921] border border-white/5 rounded-3xl p-8 group">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                Database Schema
              </h3>
              <p className="text-slate-400 text-sm mb-6">Open your Supabase <b>SQL Editor</b> and run this. It creates the tables your site needs to store clips.</p>
              <div className="relative">
                <pre className="bg-black/40 rounded-2xl p-6 font-mono text-[10px] text-emerald-300/80 overflow-x-auto border border-white/5 max-h-[250px]">
                  {sql}
                </pre>
                <button 
                  onClick={copySql}
                  className={`absolute top-4 right-4 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {copied ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>
            </div>
          </section>

          {/* STEP 3: VERCEL */}
          <section className="relative pl-0 md:pl-12">
            <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#0b0e14] border-2 border-white flex items-center justify-center z-10 hidden md:flex shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="text-xs font-bold text-white">03</span>
            </div>
            <div className="bg-white text-black rounded-3xl p-8">
              <h3 className="text-2xl font-black italic uppercase mb-2">Deploy to Vercel</h3>
              <p className="text-slate-600 text-sm mb-8 font-medium italic">The final jump into hyperspace.</p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">A</div>
                  <p className="text-sm">Log in to <b>Vercel.com</b> and click <b>"Add New Project"</b>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">B</div>
                  <p className="text-sm">Connect your GitHub account and <b>Import</b> the "streampulse" repository.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">C</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold mb-3">CRITICAL: Environment Variables</p>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">Before clicking "Deploy", expand the "Environment Variables" section and add your Supabase keys from your Supabase Dashboard Settings:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-100 p-3 rounded-xl border border-black/10">
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Key Name</span>
                        <code className="text-[11px] font-bold">VITE_SUPABASE_URL</code>
                      </div>
                      <div className="bg-slate-100 p-3 rounded-xl border border-black/10">
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Key Name</span>
                        <code className="text-[11px] font-bold">VITE_SUPABASE_ANON_KEY</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-8 bg-black text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-slate-900 transition-all shadow-xl active:scale-95">
                Initialize Production Build
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Checklist */}
        <aside className="space-y-6">
          <div className="bg-[#151921] border border-white/10 rounded-3xl p-6 sticky top-32">
            <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Flight Checklist
            </h4>
            <div className="space-y-4">
              {[
                'GitHub Repo Created',
                'Code Pushed to Main',
                'SQL Tables Created',
                'RLS Disabled (Public)',
                'Vercel Project Connected',
                'Env Variables Saved'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{item}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Estimated Time</div>
              <div className="text-xl font-black text-white italic">08:45 <span className="text-slate-600 text-xs font-medium uppercase tracking-normal ml-1">mins</span></div>
            </div>
          </div>
          
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-6">
            <p className="text-[11px] text-indigo-300 leading-relaxed italic">
              "Once deployed, your app will automatically update every time you push new code to your GitHub main branch."
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DeploymentGuide;
