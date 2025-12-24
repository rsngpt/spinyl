'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function followUser(targetUserId: string) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('follows')
        .insert({
            follower_id: user.id,
            following_id: targetUserId
        });

    if (error) {
        console.error('Follow error:', error);
        throw new Error('Failed to follow user');
    }

    revalidatePath(`/profile/${targetUserId}`);
    return { success: true };
}

export async function unfollowUser(targetUserId: string) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('follows')
        .delete()
        .match({
            follower_id: user.id,
            following_id: targetUserId
        });

    if (error) {
        console.error('Unfollow error:', error);
        throw new Error('Failed to unfollow user');
    }

    revalidatePath(`/profile/${targetUserId}`);
    return { success: true };
}
