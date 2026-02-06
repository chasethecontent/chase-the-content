
/**
 * Twitch API Service
 * Handles OAuth2 and Streamer Data Fetching
 */

const getEnv = (key: string): string => {
  const viteKey = `VITE_${key}`;
  try {
    return (
      (import.meta as any).env?.[viteKey] || 
      (window as any).process?.env?.[viteKey] || 
      (window as any).process?.env?.[key] || 
      ''
    );
  } catch {
    return '';
  }
};

const CLIENT_ID = getEnv('TWITCH_CLIENT_ID');
const CLIENT_SECRET = getEnv('TWITCH_CLIENT_SECRET');

let accessToken: string | null = null;

async function getAccessToken() {
  if (accessToken) return accessToken;
  if (!CLIENT_ID || !CLIENT_SECRET) return null;

  try {
    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, {
      method: 'POST',
    });
    const data = await response.json();
    accessToken = data.access_token;
    return accessToken;
  } catch (error) {
    console.error('Twitch Auth Error:', error);
    return null;
  }
}

export async function getLiveStreams(usernames: string[]) {
  const token = await getAccessToken();
  if (!token || !CLIENT_ID) return [];

  try {
    const query = usernames.map(u => `user_login=${u.toLowerCase()}`).join('&');
    const response = await fetch(`https://api.twitch.tv/helix/streams?${query}`, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error('Twitch Data Fetch Error:', error);
    return [];
  }
}

export async function getTwitchUsers(usernames: string[]) {
  const token = await getAccessToken();
  if (!token || !CLIENT_ID) return [];

  try {
    const query = usernames.map(u => `login=${u.toLowerCase()}`).join('&');
    const response = await fetch(`https://api.twitch.tv/helix/users?${query}`, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error('Twitch User Fetch Error:', error);
    return [];
  }
}
