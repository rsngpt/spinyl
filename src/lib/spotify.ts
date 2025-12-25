import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/* =======================
   Types
======================= */

type SpotifyTokenResponse = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  release_date: string;
  total_tracks: number;
  images: { url: string }[];
  artists: { name: string }[];
  genres?: string[];
  tracks: {
    items: {
      id: string;
      name: string;
      duration_ms: number;
      preview_url: string | null;
      external_urls: { spotify: string };
    }[];
  };
};

/* =======================
   Constants & Cache
======================= */

const TOKEN_URL = 'https://accounts.spotify.com/api/token';

let accessToken: string | null = null;
let tokenExpiresAt = 0;

/* =======================
   Utils
======================= */

// Runtime-safe Base64 (Node + Edge)
function base64Encode(value: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value).toString('base64');
  }
  return btoa(value);
}

/* =======================
   Auth
======================= */

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify client credentials');
  }

  const credentials = base64Encode(`${clientId}:${clientSecret}`);

  const response = await axios.post<SpotifyTokenResponse>(
    TOKEN_URL,
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const token = response.data.access_token;
  const expiresIn = response.data.expires_in;

  accessToken = token;
  tokenExpiresAt = Date.now() + expiresIn * 1000;

  return token;
}

/* =======================
   Spotify Helpers
======================= */

// Generic fetch (album details, tracks, etc.)
export async function spotifyFetch(endpoint: string, accessToken?: string) {
  const token = accessToken || await getAccessToken();

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Spotify API Error [${endpoint}]:`, error.response?.status, error.response?.data);
    }
    throw error;
  }
}

// Album search (used by /api/search)
export async function spotifySearch(
  query: string,
  types: string[] = ['album', 'artist', 'track']
): Promise<any> {
  const token = await getAccessToken();

  const response = await axios.get(
    'https://api.spotify.com/v1/search',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: query,
        type: types.join(','),
        limit: 8, // Reduce limit per category to keep response light
      },
    }
  );

  if (!response.data) {
    console.error('Spotify API response missing data:', JSON.stringify(response.data));
    return {};
  }

  return response.data; // Returns { albums: {}, artists: {}, tracks: {} }
}

// User Top Tracks
export async function getUserTopTracks(token: string) {
  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/tracks',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 10,
          time_range: 'short_term'
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user top tracks:', error);
    return null;
  }
}

// User Recently Played
export async function getUserRecentlyPlayed(token: string) {
  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 10,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user recently played:', error);
    return null;
  }
}
