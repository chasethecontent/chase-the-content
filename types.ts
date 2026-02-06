
export interface Streamer {
  id: string;
  name: string;
  platform: 'Twitch' | 'YouTube' | 'Kick' | 'Other';
  status: 'online' | 'offline';
  location: [number, number]; // [lat, lng]
  locationName: string;
  category: string;
  votes: number;
  avatar: string;
  bio: string;
  viewerCount?: number;
}

export interface Comment {
  id: string;
  clip_id: string;
  user_id: string;
  username: string;
  text: string;
  created_at: string;
}

export interface Clip {
  id: string;
  streamerId?: string;
  streamerName: string;
  title: string;
  thumbnail: string;
  video_url?: string; // Standardized with Supabase field name
  videoUrl?: string;  // Fallback for demo
  votes: number;
  timestamp?: string;
  tags: string[];
  user_id?: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  points: number;
  votedIds: string[];
}

export type View = 'feed' | 'map' | 'leaderboard' | 'submit' | 'deployment' | 'list' | 'auth';
