'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function addComment(reviewId: string, content: string, parentId?: string, spotifyId?: string) {
    const supabase = await getSupabaseServerClient();

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Unauthorized' };
    }

    if (!content.trim()) {
        return { success: false, message: 'Comment cannot be empty' };
    }

    try {
        // 2. Insert Comment
        const { data, error } = await supabase
            .from('comments')
            .insert({
                review_id: reviewId,
                user_id: user.id,
                parent_id: parentId || null,
                content: content.trim()
            })
            .select(`
                *,
                profiles (
                    username,
                    avatar_url
                )
            `)
            .single();

        if (error) {
            console.error('Error addComment DB Insert:', error);
            // Return specific error for debugging
            return { success: false, message: `DB Error: ${error.message} (Details: ${error.details || 'none'})` };
        }

        // 3. Trigger Notifications (Non-blocking)
        try {
            // Fetch review details to get owner
            const { data: reviewData } = await supabase
                .from('reviews')
                .select('user_id, album_id, albums(spotify_id)')
                .eq('id', reviewId)
                .single();

            const album = Array.isArray(reviewData?.albums) ? reviewData.albums[0] : reviewData?.albums;
            const targetSpotifyId = spotifyId || (album as any)?.spotify_id;

            if (reviewData && reviewData.user_id !== user.id) {
                // Notify Review Owner
                await supabase.from('notifications').insert({
                    user_id: reviewData.user_id, // Recipient
                    type: 'comment',
                    actor_id: user.id, // Commenter
                    resource_id: targetSpotifyId, // Link to album
                    comment_id: data.id,
                    message: `commented on your review`
                });
            }

            // Handle Reply Notification (if this is a reply)
            if (parentId) {
                const { data: parentComment } = await supabase
                    .from('comments')
                    .select('user_id')
                    .eq('id', parentId)
                    .single();

                // Notify parent author ONLY if they are not me AND not the review owner (who already got notified above)
                if (parentComment && parentComment.user_id !== user.id && parentComment.user_id !== reviewData?.user_id) {
                    await supabase.from('notifications').insert({
                        user_id: parentComment.user_id,
                        type: 'comment',
                        actor_id: user.id,
                        resource_id: targetSpotifyId,
                        comment_id: data.id,
                        message: `replied to your comment`
                    });
                }
            }

            // Handle Mentions
            const mentions = content.match(/@(\w+)/g);
            if (mentions) {
                const usernames = mentions.map(m => m.substring(1));
                const { data: mentionedUsers } = await supabase
                    .from('profiles')
                    .select('id, username')
                    .in('username', usernames);

                if (mentionedUsers) {
                    for (const mentionedUser of mentionedUsers) {
                        if (mentionedUser.id !== user.id) {
                            await supabase.from('notifications').insert({
                                user_id: mentionedUser.id,
                                type: 'mention',
                                actor_id: user.id,
                                resource_id: targetSpotifyId,
                                comment_id: data.id,
                                message: `mentioned you in a comment`
                            });
                        }
                    }
                }
            }
        } catch (notifError) {
            console.error('Notification Error (Ignored):', notifError);
            // Do not fail the request if notifications fail
        }

        // 4. Revalidate
        if (spotifyId) {
            revalidatePath(`/album/${spotifyId}`);
        }

        return { success: true, comment: data };
    } catch (e) {
        console.error('Exception addComment:', e);
        return { success: false, message: 'Unexpected error' };
    }
}

export async function getComments(reviewId: string) {
    const supabase = await getSupabaseServerClient();

    try {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles (
                    username,
                    avatar_url
                )
            `)
            .eq('review_id', reviewId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error getComments:', error);
            return [];
        }

        return data;
    } catch (e) {
        console.error('Exception getComments:', e);
        return [];
    }
}

export async function deleteComment(commentId: string, spotifyId?: string) {
    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleteComment:', error);
            return { success: false, message: 'Failed to delete' };
        }

        if (spotifyId) {
            revalidatePath(`/album/${spotifyId}`);
        }

        return { success: true };
    } catch (e) {
        return { success: false, message: 'Error deleting comment' };
    }
}
