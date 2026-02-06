
import { Streamer, Clip } from './types';

export const INITIAL_STREAMERS: Streamer[] = [
  {
    id: 's5',
    name: 'WendolynOrtizz',
    platform: 'Twitch',
    status: 'offline', // Will be updated by API
    location: [19.4326, -99.1332], // Mexico City (Estimated)
    locationName: 'Mexico City, Mexico',
    category: 'Just Chatting',
    votes: 520,
    avatar: 'https://picsum.photos/seed/wendy/200/200',
    bio: 'Rising content star featured in the community tracker.'
  },
  {
    id: 's1',
    name: 'KaiCenat',
    platform: 'Twitch',
    status: 'offline',
    location: [40.7128, -74.0060],
    locationName: 'New York City, USA',
    category: 'Just Chatting',
    votes: 1240,
    avatar: 'https://picsum.photos/seed/kai/200/200',
    bio: 'The biggest streamer in NYC right now.'
  },
  {
    id: 's2',
    name: 'IShowSpeed',
    platform: 'YouTube',
    status: 'online',
    location: [48.8566, 2.3522],
    locationName: 'Paris, France',
    category: 'IRL',
    votes: 3100,
    avatar: 'https://picsum.photos/seed/speed/200/200',
    bio: 'Traveling the world and barking at people.'
  },
  {
    id: 's3',
    name: 'XQC',
    platform: 'Kick',
    status: 'offline',
    location: [34.0522, -118.2437],
    locationName: 'Los Angeles, USA',
    category: 'React',
    votes: 2850,
    avatar: 'https://picsum.photos/seed/xqc/200/200',
    bio: 'The Juicer is currently offline.'
  }
];

export const INITIAL_CLIPS: Clip[] = [
  {
    id: 'c1',
    streamerId: 's2',
    streamerName: 'IShowSpeed',
    title: 'SPEED JUMPS OVER CAR IN PARIS',
    thumbnail: 'https://picsum.photos/seed/clip1/400/225',
    videoUrl: '#',
    votes: 450,
    timestamp: '2 hours ago',
    tags: ['CRAZY', 'IRL', 'PARIS']
  }
];
