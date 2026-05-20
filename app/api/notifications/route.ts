import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Data (Parallel)
        // A. Follows (New followers)
        const followsPromise = supabase
            .from('follows')
            .select(`
                follower_id,
                created_at,
                follower:profiles!follows_follower_id_fkey (username, avatar_url)
            `)
            .eq('following_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        // B. Reviews from Followed Users
        const { data: followingData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

        const followingIds = followingData?.map((f: any) => f.following_id) || [];

        const reviewsPromise = followingIds.length > 0 ? supabase
            .from('reviews')
            .select(`
                id,
                created_at,
                profiles!user_id (username, avatar_url),
                albums (id, spotify_id, name, cover_image)
            `)
            .in('user_id', followingIds)
            .order('created_at', { ascending: false })
            .limit(20)
            : Promise.resolve({ data: [], error: null });

        // C. Real Notifications
        const realNotificationsPromise = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        const [followsRes, reviewsRes, realNotifsRes] = await Promise.all([followsPromise, reviewsPromise, realNotificationsPromise]);

        // Process Real Notifications (Fetch Actors & Comments)
        let realNotifsWithDetails: any[] = [];
        if (realNotifsRes.data && realNotifsRes.data.length > 0) {
            const actorIds = [...new Set(realNotifsRes.data.map((n: any) => n.actor_id).filter(Boolean))];
            const commentIds = [...new Set(realNotifsRes.data.map((n: any) => n.comment_id).filter(Boolean))];

            const [actorsRes, commentsRes] = await Promise.all([
                actorIds.length > 0 ? supabase.from('profiles').select('id, username, avatar_url').in('id', actorIds) : { data: [] },
                commentIds.length > 0 ? supabase.from('comments').select('id, review_id, reviews(id, albums(spotify_id))').in('id', commentIds) : { data: [] }
            ]);

            const actorMap = new Map(actorsRes.data?.map((a: any) => [a.id, a] as [any, any]) || []);
            const commentMap = new Map(commentsRes.data?.map((c: any) => [c.id, c] as [any, any]) || []);

            realNotifsWithDetails = realNotifsRes.data.map((n: any) => ({
                ...n,
                actor: n.actor_id ? actorMap.get(n.actor_id) : null,
                comments: n.comment_id ? commentMap.get(n.comment_id) : null
            }));
        }

        // Normalize Data for Display
        const followItems = (followsRes.data || []).map((f: any) => ({
            type: 'follow',
            id: `follow-${f.follower_id}-${f.created_at}`,
            created_at: f.created_at,
            follower: f.follower,
            follower_user_id: f.follower_id
        }));

        const reviewItems = (reviewsRes.data || []).map((r: any) => ({
            type: 'review',
            id: r.id,
            created_at: r.created_at,
            profiles: r.profiles,
            albums: r.albums
        }));

        const realNotifItems = realNotifsWithDetails.map((n: any) => ({
            type: n.type || 'system',
            id: n.id,
            created_at: n.created_at,
            message: n.message,
            resource_id: n.resource_id,
            actor: n.actor,
            comment_id: n.comment_id,
            comments: n.comments,
            review_id: n.comments?.review_id
        }));

        const allNotifications = [...followItems, ...reviewItems, ...realNotifItems].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return NextResponse.json({ notifications: allNotifications });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
