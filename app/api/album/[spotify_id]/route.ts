import { NextResponse, NextRequest } from 'next/server';
import { spotifyFetch } from '@/src/lib/spotify';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';

export async function GET(
  request: NextRequest,
  context: any
) {
  const supabase = getSupabaseServerClient();
  const spotifyId = context.params.spotify_id;

  // 1️⃣ Spotify: album + tracks (live)
  const album = await spotifyFetch(`albums/${spotifyId}`);

  // 2️⃣ Supabase: reviews (cached)
  const { data: albumRow } = await supabase
    .from('albums')
    .select('id')
    .eq('spotify_id', spotifyId)
    .single();

  let reviews: any[] = [];

  if (albumRow) {
    const { data } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        review_text,
        created_at,
        user_id
      `)
      .eq('album_id', albumRow.id);

    reviews = data ?? [];
  }

  return NextResponse.json({
    spotify: {
      id: album.id,
      name: album.name,
      artists: album.artists.map((a: any) => a.name),
      cover: album.images[0]?.url,
      tracks: album.tracks.items.map((t: any) => ({
        id: t.id,
        name: t.name,
        duration_ms: t.duration_ms,
      })),
    },
    reviews,
  });
}
