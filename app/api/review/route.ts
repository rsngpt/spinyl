import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();

  const {
    user_id,
    album, // spotify album object (cleaned)
    rating,
    review_text,
  } = body;

  if (!album?.spotify_id || !user_id) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }

  // 1️⃣ Check if album exists
  const { data: existingAlbum } = await supabase
    .from('albums')
    .select('id')
    .eq('spotify_id', album.spotify_id)
    .single();

  let albumId = existingAlbum?.id;

  // 2️⃣ Insert album if not exists
  if (!albumId) {
    const { data: newAlbum, error } = await supabase
      .from('albums')
      .insert({
        spotify_id: album.spotify_id,
        name: album.name,
        release_date: album.release_date,
        cover_image: album.cover_image,
        artists: album.artists,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Album insert failed' },
        { status: 500 }
      );
    }

    albumId = newAlbum.id;
  }

  // 3️⃣ Insert review
  const { error: reviewError } = await supabase
    .from('reviews')
    .insert({
  user_id,
  album_id: albumId,
  rating,
  review_text,
});
;

  if (reviewError) {
    return NextResponse.json(
      { error: 'Review insert failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
