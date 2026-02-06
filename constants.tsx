
import { Streamer, Clip } from './types';

export const INITIAL_STREAMERS: Streamer[] = [
  {
    id: 's1',
    name: 'KaiCenat',
    platform: 'Twitch',
    status: 'online',
    location: [40.7128, -74.0060], // NYC
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
    location: [48.8566, 2.3522], // Paris
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
    location: [34.0522, -118.2437], // LA
    locationName: 'Los Angeles, USA',
    category: 'React',
    votes: 2850,
    avatar: 'https://picsum.photos/seed/xqc/200/200',
    bio: 'The Juicer is currently offline.'
  },
  {
    id: 's4',
    name: 'Mizkif',
    platform: 'Twitch',
    status: 'online',
    location: [30.2672, -97.7431], // Austin
    locationName: 'Austin, Texas',
    category: 'IRL Event',
    votes: 950,
    avatar: 'https://picsum.photos/seed/miz/200/200',
    bio: 'Hosting another crazy gym stream.'
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
  },
  {
    id: 'c2',
    streamerId: 's1',
    streamerName: 'KaiCenat',
    title: 'The entire block came out for Kai',
    thumbnail: 'https://picsum.photos/seed/clip2/400/225',
    videoUrl: '#',
    votes: 890,
    timestamp: '5 hours ago',
    tags: ['NYC', 'AMP', 'HYPE']
  },
  {
    id: 'c3',
    streamerId: 's4',
    streamerName: 'Mizkif',
    title: 'Weightlifting competition goes wrong',
    thumbnail: 'https://picsum.photos/seed/clip3/400/225',
    videoUrl: '#',
    votes: 210,
    timestamp: '1 day ago',
    tags: ['GYM', 'FUNNY']
  }
];
