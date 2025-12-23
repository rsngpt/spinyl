import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      review_text,
      created_at,
      albums (
        spotify_id,
        name,
        cover_image
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
