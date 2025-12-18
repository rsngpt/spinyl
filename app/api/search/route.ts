import { NextResponse } from 'next/server';
import { spotifySearch } from '@/src/lib/spotify';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Missing search query' },
      { status: 400 }
    );
  }

  try {
    const albums = await spotifySearch(query);

    // 🔹 Clean & simplify response
    const cleanAlbums = albums.map((album: any) => ({
      id: album.id,
      name: album.name,
      release_date: album.release_date,
      total_tracks: album.total_tracks,
      cover_image: album.images[0]?.url || null,
      artists: album.artists.map((a: any) => a.name),
    }));

    return NextResponse.json(cleanAlbums);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Spotify search failed' },
      { status: 500 }
    );
  }
}
