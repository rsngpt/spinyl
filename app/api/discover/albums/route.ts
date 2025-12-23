import { NextResponse } from 'next/server';
import { spotifyFetch } from '@/src/lib/spotify';

export async function GET() {
  try {
    // Fetch new releases from Spotify
    const data = await spotifyFetch('browse/new-releases?limit=20');

    // Check if we got valid data
    if (!data || !data.albums || !data.albums.items) {
      console.warn('Spotify API returned unexpected structure:', data);
      return NextResponse.json([]);
    }

    // Map Spotify structure to our app's Album structure
    const albums = data.albums.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      cover_image: item.images?.[0]?.url || null,
      avg_rating: null, // New releases won't have local ratings yet
    }));

    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error in /api/discover/albums:', error);
    // Return empty array instead of 500 to prevent frontend crash
    return NextResponse.json([]);
  }
}
