import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';



export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('albums')
    .select(`
      id,
      spotify_id,
      name,
      cover_image,
      reviews (
        rating
      )
    `);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  // calculate avg rating
  const albums = data.map((album: any) => {
    const ratings = album.reviews.map((r: any) => r.rating);
    const avg =
      ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : null;

    return {
      id: album.spotify_id,
      name: album.name,
      cover_image: album.cover_image,
      avg_rating: avg ? Number(avg.toFixed(1)) : null,
    };
  });

  return NextResponse.json(albums);
}
