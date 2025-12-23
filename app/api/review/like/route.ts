import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';



export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  const { user_id, review_id } = await req.json();

  // Check if already liked
  const { data: existing } = await supabase
    .from('review_likes')
    .select('*')
    .eq('user_id', user_id)
    .eq('review_id', review_id)
    .single();

  if (existing) {
    // Unlike
    await supabase
      .from('review_likes')
      .delete()
      .eq('user_id', user_id)
      .eq('review_id', review_id);

    return NextResponse.json({ liked: false });
  }

  // Like
  await supabase
    .from('review_likes')
    .insert({ user_id, review_id });

  return NextResponse.json({ liked: true });
}
