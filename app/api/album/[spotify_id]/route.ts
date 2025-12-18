import { NextResponse } from 'next/server';
import { spotifyFetch } from '@/src/lib/spotify';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(
  _req: Request,
  { params }: { params: { spotify_id: string } }
) {
  const spotifyId = params.spotify_id;

  // 1️⃣ Spotify: album + tracks (live)
  const album = await spotifyFetch(`albums/${spotifyId}`);

  // 2️⃣ Supabase: reviews + likes
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      review_text,
      created_at,
      user_id,
      likes(count)
    `)
    .eq('album_id',
      supabase
        .from('albums')
        .select('id')
        .eq('spotify_id', spotifyId)
    );

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
    reviews: reviews ?? [],
  });
}
