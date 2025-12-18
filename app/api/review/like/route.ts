import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
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
