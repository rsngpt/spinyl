'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function toggleLikeReview(reviewId: string) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Check if already liked
    const { data: existingLike } = await supabase
        .from('review_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('review_id', reviewId)
        .single();

    if (existingLike) {
        // Unlike
        const { error } = await supabase
            .from('review_likes')
            .delete()
            .match({ user_id: user.id, review_id: reviewId });

        if (error) {
            console.error('Unlike error:', error);
            throw new Error('Failed to unlike review');
        }
    } else {
        // Like
        const { error } = await supabase
            .from('review_likes')
            .insert({
                user_id: user.id,
                review_id: reviewId
            });

        if (error) {
            console.error('Like error:', error);
            throw new Error('Failed to like review');
        }
    }

    revalidatePath(`/profile/[id]`, 'page'); // Revalidate all profiles potentially
    // Better strategy might be specific path validation if we knew the user ID of the profile being viewed, 
    // but generic revalidation is safer for now.
    return { success: true, isLiked: !existingLike };
}
