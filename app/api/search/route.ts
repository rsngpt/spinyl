import { NextResponse } from 'next/server';
import { spotifySearch } from '@/src/lib/spotify';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Missing search query' },
      { status: 400 }
    );
  }

  try {
    // 1. Parallel execution: Spotify + Supabase
    const [spotifyData, { data: users, error: userError }] = await Promise.all([
      spotifySearch(query),
      supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(5)
    ]);

    // 2. Process Spotify Data
    const albums = (spotifyData.albums?.items || []).map((album: any) => ({
      id: album.id,
      name: album.name,
      image: album.images[0]?.url,
      artist: album.artists[0]?.name,
      type: 'album'
    }));

    const tracks = (spotifyData.tracks?.items || []).map((track: any) => ({
      id: track.id,
      name: track.name,
      image: track.album.images[0]?.url,
      artist: track.artists[0]?.name,
      type: 'track'
    }));

    const artists = (spotifyData.artists?.items || []).map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url,
      type: 'artist'
    }));

    // 3. Process Users
    const processedUsers = (users || []).map((user: any) => ({
      id: user.id,
      name: user.username || 'User',
      image: user.avatar_url,
      subtext: 'Spinyl User', // Generic subtext since we don't have full name
      type: 'user'
    }));

    return NextResponse.json({
      albums,
      tracks,
      artists,
      users: processedUsers
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
