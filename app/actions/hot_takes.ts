'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createHotTake(content: string) {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    if (!content || content.trim().length === 0) throw new Error('Content cannot be empty');
    if (content.length > 300) throw new Error('Content too long');

    const { error } = await supabase.from('hot_takes').insert({
        user_id: user.id,
        content: content.trim(),
        score: 0,
        comments_count: 0
    });

    if (error) {
        console.error('Error creating hot take:', error);
        throw new Error('Failed to post hot take');
    }

    revalidatePath('/feed');
    revalidatePath('/');
    return { success: true };
}

export async function toggleHotTakeVote(hotTakeId: string, voteType: 1 | -1) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check existing vote
    const { data: existingVote } = await supabase
        .from('hot_take_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('hot_take_id', hotTakeId)
        .single();

    let scoreChange = 0;

    if (existingVote) {
        if (existingVote.vote_type === voteType) {
            // Remove vote (toggle off)
            await supabase.from('hot_take_votes').delete().eq('id', existingVote.id);
            scoreChange = -voteType;
        } else {
            // Change vote
            await supabase.from('hot_take_votes').update({ vote_type: voteType }).eq('id', existingVote.id);
            scoreChange = voteType * 2; // e.g., -1 to 1 is +2, 1 to -1 is -2
        }
    } else {
        // New vote
        await supabase.from('hot_take_votes').insert({
            user_id: user.id,
            hot_take_id: hotTakeId,
            vote_type: voteType
        });
        scoreChange = voteType;
    }

    // Update score efficiently using rpc or direct increment if possible, 
    // but standard update is safer for now without custom increment function
    // We'll fetch current score -> update. 
    // Ideally use a database function `increment_score` but manual read-write is acceptable for MVP scale.
    // Actually, let's just use `score = score + change` query if supabase supports it directly?
    // Supabase JS client doesn't support `score + 1` syntax easily update.
    // We will do a fetch-update pattern or use a stored procedure if available.
    // Given no stored proc is known, we fetch-update.

    // Better: RPC. But I'll stick to Fetch-Update for simplicity unless race conditions are high concern.
    const { data: hotTake } = await supabase.from('hot_takes').select('score').eq('id', hotTakeId).single();
    if (hotTake) {
        await supabase.from('hot_takes').update({ score: (hotTake.score || 0) + scoreChange }).eq('id', hotTakeId);
    }

    revalidatePath('/feed');
    return { success: true };
}

export async function postHotTakeComment(hotTakeId: string, content: string) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    if (!content.trim()) return { success: false };

    const { error } = await supabase.from('hot_take_comments').insert({
        user_id: user.id,
        hot_take_id: hotTakeId,
        content: content.trim()
    });

    if (error) throw error;

    // Increment comment count
    const { data: hotTake } = await supabase.from('hot_takes').select('comments_count').eq('id', hotTakeId).single();
    if (hotTake) {
        await supabase.from('hot_takes').update({ comments_count: (hotTake.comments_count || 0) + 1 }).eq('id', hotTakeId);
    }

    revalidatePath('/feed');
    return { success: true };
}

export async function getHotTakeComments(hotTakeId: string) {
    const supabase = await getSupabaseServerClient();

    const { data: comments } = await supabase
        .from('hot_take_comments')
        .select(`
            id,
            content,
            created_at,
            user_id,
            profiles (username, avatar_url)
        `)
        .eq('hot_take_id', hotTakeId)
        .order('created_at', { ascending: true });

    return comments || [];
}

export async function getHotTakeById(id: string) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the hot take with profile
    const { data: hotTake, error } = await supabase
        .from('hot_takes')
        .select(`
            id,
            content,
            created_at,
            user_id,
            score,
            comments_count,
            profiles (username, avatar_url)
        `)
        .eq('id', id)
        .single();

    if (error || !hotTake) {
        console.error('Error fetching hot take:', JSON.stringify(error, null, 2));
        return null;
    }

    // Fetch user's vote if logged in
    let userVote = 0;
    if (user) {
        const { data: vote } = await supabase
            .from('hot_take_votes')
            .select('vote_type')
            .eq('hot_take_id', id)
            .eq('user_id', user.id)
            .single();
        if (vote) userVote = vote.vote_type as 0 | 1 | -1;
    }

    // Cast to HotTakeFeedItem-like structure
    const profiles = Array.isArray(hotTake.profiles) ? hotTake.profiles[0] : hotTake.profiles;

    const item = {
        ...hotTake,
        profiles: profiles as { username: string; avatar_url: string | null } | null,
        user_vote: userVote as 0 | 1 | -1,
        type: 'hot_take' as const
    };

    // Also fetch comments (server-side for initial render)
    const { data: comments } = await supabase
        .from('hot_take_comments')
        .select(`
            id,
            content,
            created_at,
            user_id,
            profiles (username, avatar_url)
        `)
        .eq('hot_take_id', id)
        .order('created_at', { ascending: true });

    return { item, comments: comments || [] };
}
