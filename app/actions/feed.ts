'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';

export type FeedItem = {
    id: string;
    created_at: string;
    rating: number;
    review_text: string | null;
    user_id: string;
    album_id: string;
    profiles: {
        username: string | null;
        avatar_url: string | null;
    } | null;
    albums: {
        name: string;
        cover_image: string | null;
        spotify_id: string | null;
        artists: string[] | null;
    } | null;
    likes_count: number;
    comments_count: number;
    is_liked_by_user: boolean;
};

export async function getGlobalFeed(offset = 0, limit = 10): Promise<FeedItem[]> {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch Reviews with details
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
            id,
            created_at,
            rating,
            review_text,
            user_id,
            album_id,
            profiles (username, avatar_url),
            albums (name, cover_image, spotify_id, artists)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching feed:', error);
        return [];
    }

    if (!reviews || reviews.length === 0) return [];

    // 2. Fetch Aggregates (Likes & Comments)
    // We can't easily do a subquery count with Supabase js client simply for all rows efficiently in one go without a view/RPC.
    // But for 10 items, we can parallel fetch or use a stored procedure if available.
    // For now, let's just do it in parallel for simplicity as volume is low.
    // TODO: Optimize this with a Postgres Function/View later.

    const reviewIds = reviews.map(r => r.id);

    // Likes Count
    const { data: likesCounts } = await supabase
        .from('review_likes')
        .select('review_id')
        .in('review_id', reviewIds);

    // Comments Count
    const { data: commentsCounts } = await supabase
        .from('comments')
        .select('review_id')
        .in('review_id', reviewIds);

    // Filter User Likes
    let userLikes = new Set<string>();
    if (user) {
        const { data: myLikes } = await supabase
            .from('review_likes')
            .select('review_id')
            .eq('user_id', user.id)
            .in('review_id', reviewIds);

        myLikes?.forEach(l => userLikes.add(l.review_id));
    }

    // Process Counts
    const likesMap = new Map<string, number>();
    likesCounts?.forEach((l: any) => {
        likesMap.set(l.review_id, (likesMap.get(l.review_id) || 0) + 1);
    });

    const commentsMap = new Map<string, number>();
    commentsCounts?.forEach((c: any) => {
        commentsMap.set(c.review_id, (commentsMap.get(c.review_id) || 0) + 1);
    });

    // 3. Assemble
    return reviews.map((r: any) => ({
        ...r,
        likes_count: likesMap.get(r.id) || 0,
        comments_count: commentsMap.get(r.id) || 0,
        is_liked_by_user: userLikes.has(r.id)
    }));
}
