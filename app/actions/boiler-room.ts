'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createBoilerRoom(content: string, coverImage: string | null) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be logged in to create a boiler room.' };
        }

        if (!content.trim()) {
            return { success: false, error: 'Content cannot be empty.' };
        }

        const { error } = await supabase.from('boiler_rooms').insert({
            content,
            cover_image: coverImage,
            user_id: user.id
        });

        if (error) {
            console.error('Error inserting boiler room:', error.message);
            return { success: false, error: error.message };
        }

        revalidatePath('/boiler-room');
        return { success: true };
    } catch (e: any) {
        console.error('Exception in createBoilerRoom action:', e);
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}

export async function deleteBoilerRoom(id: string) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Unauthorized.' };
        }

        const { error } = await supabase
            .from('boiler_rooms')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Ensure user owns it

        if (error) {
            console.error('Error deleting boiler room:', error.message);
            return { success: false, error: error.message };
        }

        revalidatePath('/boiler-room');
        return { success: true };
    } catch (e: any) {
        console.error('Exception in deleteBoilerRoom action:', e);
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}

export async function addBoilerRoomComment(boilerRoomId: string, content: string, parentId?: string | null) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'You must be logged in to comment.' };
        }

        if (!content.trim()) {
            return { success: false, error: 'Comment content cannot be empty.' };
        }

        const { data, error } = await supabase
            .from('boiler_room_comments')
            .insert({
                boiler_room_id: boilerRoomId,
                user_id: user.id,
                parent_id: parentId || null,
                content: content.trim()
            })
            .select(`
                id,
                boiler_room_id,
                user_id,
                parent_id,
                content,
                created_at,
                profiles!user_id (
                    username,
                    avatar_url
                )
            `)
            .single();

        if (error) {
            console.error('Error inserting boiler room comment:', error.message);
            return { success: false, error: error.message };
        }

        // Notify Boiler Room Owner & other subscribers
        try {
            // Fetch boiler room owner
            const { data: roomData } = await supabase
                .from('boiler_rooms')
                .select('user_id, content')
                .eq('id', boilerRoomId)
                .single();

            if (roomData && roomData.user_id !== user.id) {
                // Notify owner
                await supabase.from('notifications').insert({
                    user_id: roomData.user_id,
                    type: 'boiler_room_comment',
                    actor_id: user.id,
                    resource_id: boilerRoomId,
                    message: `commented on your boiler room post: "${roomData.content.substring(0, 30)}..."`
                });
            }

            // Notify other subscribers
            const { data: subs } = await supabase
                .from('boiler_room_subscriptions')
                .select('user_id')
                .eq('boiler_room_id', boilerRoomId);

            if (subs) {
                for (const sub of subs) {
                    if (sub.user_id !== user.id && sub.user_id !== roomData?.user_id) {
                        await supabase.from('notifications').insert({
                            user_id: sub.user_id,
                            type: 'boiler_room_comment',
                            actor_id: user.id,
                            resource_id: boilerRoomId,
                            message: `commented on a boiler room you follow: "${roomData?.content.substring(0, 30)}..."`
                        });
                    }
                }
            }

            // Notify mentioned users
            const mentions = content.match(/@(\w+)/g);
            if (mentions) {
                const usernames = mentions.map(m => m.substring(1));
                const { data: mentionedUsers } = await supabase
                    .from('profiles')
                    .select('id, username')
                    .in('username', usernames);

                if (mentionedUsers) {
                    for (const mentionedUser of mentionedUsers) {
                        if (mentionedUser.id !== user.id && mentionedUser.id !== roomData?.user_id) {
                            await supabase.from('notifications').insert({
                                user_id: mentionedUser.id,
                                type: 'boiler_room_comment',
                                actor_id: user.id,
                                resource_id: boilerRoomId,
                                message: `mentioned you in a boiler room comment`
                            });
                        }
                    }
                }
            }
        } catch (notifErr) {
            console.error('Error generating notification:', notifErr);
        }

        revalidatePath('/boiler-room');
        return { success: true, comment: data };
    } catch (e: any) {
        console.error('Exception in addBoilerRoomComment:', e);
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}

export async function getBoilerRoomComments(boilerRoomId: string) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from('boiler_room_comments')
            .select(`
                id,
                boiler_room_id,
                user_id,
                parent_id,
                content,
                created_at,
                profiles!user_id (
                    username,
                    avatar_url
                ),
                boiler_room_comment_likes (
                    user_id
                )
            `)
            .eq('boiler_room_id', boilerRoomId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching boiler room comments:', error.message);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error('Exception in getBoilerRoomComments:', e);
        return [];
    }
}

export async function deleteBoilerRoomComment(commentId: string) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized.' };
        }

        const { error } = await supabase
            .from('boiler_room_comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting boiler room comment:', error.message);
            return { success: false, error: error.message };
        }

        revalidatePath('/boiler-room');
        return { success: true };
    } catch (e: any) {
        console.error('Exception in deleteBoilerRoomComment:', e);
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}

export async function toggleBoilerRoomSubscription(boilerRoomId: string) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'You must be logged in to subscribe.' };
        }

        const { data, error: fetchErr } = await supabase
            .from('boiler_room_subscriptions')
            .select('*')
            .eq('boiler_room_id', boilerRoomId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (data) {
            const { error: delErr } = await supabase
                .from('boiler_room_subscriptions')
                .delete()
                .eq('boiler_room_id', boilerRoomId)
                .eq('user_id', user.id);
            if (delErr) throw delErr;
            return { success: true, subscribed: false };
        } else {
            const { error: insErr } = await supabase
                .from('boiler_room_subscriptions')
                .insert({
                    boiler_room_id: boilerRoomId,
                    user_id: user.id
                });
            if (insErr) throw insErr;
            return { success: true, subscribed: true };
        }
    } catch (e: any) {
        console.error('Exception in toggleBoilerRoomSubscription:', e);
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}

export async function checkBoilerRoomSubscription(boilerRoomId: string) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { subscribed: false };

        const { data } = await supabase
            .from('boiler_room_subscriptions')
            .select('*')
            .eq('boiler_room_id', boilerRoomId)
            .eq('user_id', user.id)
            .maybeSingle();

        return { subscribed: !!data };
    } catch (e) {
        console.error('Exception in checkBoilerRoomSubscription:', e);
        return { subscribed: false };
    }
}

export async function editBoilerRoomComment(commentId: string, content: string) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized.' };
        }

        if (!content.trim()) {
            return { success: false, error: 'Comment content cannot be empty.' };
        }

        const { error } = await supabase
            .from('boiler_room_comments')
            .update({
                content: content.trim(),
                updated_at: new Date().toISOString()
            })
            .eq('id', commentId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error updating comment:', error.message);
            return { success: false, error: error.message };
        }

        revalidatePath('/boiler-room');
        return { success: true };
    } catch (e: any) {
        console.error('Exception in editBoilerRoomComment:', e);
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}

export async function getCurrentUserProfile() {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', user.id)
            .single();

        return {
            id: user.id,
            username: profile?.username || null,
            avatar_url: profile?.avatar_url || null
        };
    } catch (e) {
        console.error('Error fetching current user profile:', e);
        return null;
    }
}

export async function toggleBoilerRoomCommentLike(commentId: string) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized.' };
        }

        // Check if like exists
        const { data: existingLike, error: fetchError } = await supabase
            .from('boiler_room_comment_likes')
            .select('comment_id')
            .eq('comment_id', commentId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (fetchError) {
            console.error('Error fetching comment like status:', fetchError.message);
            return { success: false, error: fetchError.message };
        }

        if (existingLike) {
            // Unlike
            const { error: deleteError } = await supabase
                .from('boiler_room_comment_likes')
                .delete()
                .eq('comment_id', commentId)
                .eq('user_id', user.id);

            if (deleteError) {
                console.error('Error deleting comment like:', deleteError.message);
                return { success: false, error: deleteError.message };
            }
            return { success: true, liked: false };
        } else {
            // Like
            const { error: insertError } = await supabase
                .from('boiler_room_comment_likes')
                .insert({
                    comment_id: commentId,
                    user_id: user.id
                });

            if (insertError) {
                console.error('Error inserting comment like:', insertError.message);
                return { success: false, error: insertError.message };
            }

            // Optional: Notify the comment author about the like
            try {
                const { data: commentData } = await supabase
                    .from('boiler_room_comments')
                    .select('user_id, content, boiler_room_id')
                    .eq('id', commentId)
                    .single();

                if (commentData && commentData.user_id !== user.id) {
                    await supabase.from('notifications').insert({
                        user_id: commentData.user_id,
                        type: 'boiler_room_comment',
                        actor_id: user.id,
                        resource_id: commentData.boiler_room_id,
                        message: `liked your comment: "${commentData.content.substring(0, 30)}..."`
                    });
                }
            } catch (notifErr) {
                console.warn('Failed to send comment like notification:', notifErr);
            }

            return { success: true, liked: true };
        }
    } catch (e: any) {
        console.error('Exception in toggleBoilerRoomCommentLike:', e);
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}

