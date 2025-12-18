import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';



export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('albums')
    .select(`
      spotify_id,
      name,
      cover_image,
      reviews ( rating )
    `);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const ranked = data
    .map((album: any) => {
      const ratings = album.reviews.map((r: any) => r.rating);
      if (ratings.length === 0) return null;

      const avg =
        ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;

      return {
        spotify_id: album.spotify_id,
        name: album.name,
        cover_image: album.cover_image,
        avg_rating: Number(avg.toFixed(2)),
        review_count: ratings.length,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.avg_rating - a.avg_rating)
    .slice(0, 20);

  return NextResponse.json(ranked);
}
