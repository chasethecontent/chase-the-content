
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
}

export interface Clip {
  id: string;
  streamerId: string;
  streamerName: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  votes: number;
  timestamp: string;
  tags: string[];
}

export interface User {
  id: string;
  username: string;
  points: number;
  votedIds: string[];
}

export type View = 'feed' | 'map' | 'leaderboard' | 'submit' | 'deployment';
