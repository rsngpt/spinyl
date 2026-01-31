'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';

// Update FeedItem to support both types
export type ReviewFeedItem = {
    type: 'review';
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

export type HotTakeFeedItem = {
    type: 'hot_take';
    id: string;
    created_at: string;
    user_id: string;
    content: string;
    score: number;
    comments_count: number;
    user_vote: 0 | 1 | -1; // 0 = none, 1 = up, -1 = down
    profiles: {
        username: string | null;
        avatar_url: string | null;
    } | null;
};

export type FeedItem = (ReviewFeedItem | HotTakeFeedItem) & {
    layoutType?: 'vertical' | 'horizontal';
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
        .order('id', { ascending: false }) // Stable sort for identical timestamps
        .range(offset, offset + limit - 1);

    // 1b. Fetch Hot Takes with Counts and User Vote
    // We need to fetch hot_takes and LEFT JOIN hot_take_votes for the current user
    let hotTakesQuery = supabase
        .from('hot_takes')
        .select(`
            id,
            created_at,
            content,
            user_id,
            score,
            comments_count,
            profiles (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data: hotTakes, error: hotTakeError } = await hotTakesQuery;

    // Fetch user votes for these hot takes if logged in
    const hotTakeIds = (hotTakes || []).map(h => h.id);
    const hotTakeVotesMap = new Map<string, number>();

    if (user && hotTakeIds.length > 0) {
        const { data: myVotes } = await supabase
            .from('hot_take_votes')
            .select('hot_take_id, vote_type')
            .eq('user_id', user.id)
            .in('hot_take_id', hotTakeIds);

        myVotes?.forEach(v => {
            hotTakeVotesMap.set(v.hot_take_id, v.vote_type);
        });
    }

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }

    // 2. Fetch Aggregates (Likes & Comments for REVIEWS only for now)
    const reviewIds = (reviews || []).map(r => r.id);

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
    if (user && reviewIds.length > 0) {
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

    // 3. Assemble Reviews
    const reviewItems: FeedItem[] = (reviews || []).map((r: any) => ({
        type: 'review',
        ...r,
        likes_count: likesMap.get(r.id) || 0,
        comments_count: commentsMap.get(r.id) || 0,
        is_liked_by_user: userLikes.has(r.id)
    }));

    // 4. Assemble Hot Takes
    const hotTakeItems: FeedItem[] = (hotTakes || []).map((t: any) => ({
        type: 'hot_take',
        ...t,
        score: t.score ?? 0,
        comments_count: t.comments_count ?? 0,
        user_vote: hotTakeVotesMap.get(t.id) || 0
    }));

    // 5. Merge and Sort
    const combined = [...reviewItems, ...hotTakeItems].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Slice manually since we fetched limit from EACH source
    return combined.slice(0, limit);
}
