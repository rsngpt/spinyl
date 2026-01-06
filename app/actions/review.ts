'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Helper to get admin client if key exists
const getAdminClient = () => {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (sbUrl && sbServiceKey) {
        return createClient(sbUrl, sbServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    return null;
};

export async function getRecentReviews() {
    try {
        console.log('getRecentReviews: Starting fetch...');
        // Try admin client first to bypass RLS
        const adminSupabase = getAdminClient();
        const supabase = adminSupabase || await getSupabaseServerClient();

        console.log('getRecentReviews: Client created. Is Admin:', !!adminSupabase);

        const { data, error } = await supabase
            .from('reviews')
            .select(`
                id,
                rating,
                review_text,
                album_id,
                profiles (
                    username,
                    avatar_url
                ),
                albums (
                  name,
                  cover_image,
                  spotify_id
                )
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }

        console.log(`getRecentReviews: Fetched ${data?.length} reviews.`);
        return data || [];
    } catch (e) {
        console.error('Exception fetching reviews:', e);
        return [];
    }
}

type SubmitReviewResult = {
    success: boolean;
    message?: string;
    review?: any;
};

export async function submitReview(formData: FormData): Promise<SubmitReviewResult> {
    const supabase = await getSupabaseServerClient();

    // 1. Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'You must be logged in to review.' };
    }

    const spotify_id = formData.get('spotify_id') as string;
    const name = formData.get('album_name') as string;
    const cover_image = formData.get('cover_image') as string;
    const artist_names = formData.get('artist_names') as string;
    const release_date = formData.get('release_date') as string;

    const rating = parseFloat(formData.get('rating') as string);
    const review_text = formData.get('review_text') as string;

    if (!spotify_id || !rating || !review_text) {
        return { success: false, message: 'Missing required fields.' };
    }

    try {
        // 2. Ensure Album Exists in DB
        let { data: album } = await supabase
            .from('albums')
            .select('id')
            .eq('spotify_id', spotify_id)
            .single();

        if (!album) {
            const { data: newAlbum, error: insertError } = await supabase
                .from('albums')
                .insert({
                    spotify_id,
                    name,
                    cover_image,
                    artists: artist_names.split(', '),
                    release_date
                })
                .select('id')
                .single();

            if (insertError) {
                console.error('Error inserting album:', insertError);
                return { success: false, message: 'Failed to create album record.' };
            }
            album = newAlbum;
        }

        if (!album) {
            return { success: false, message: 'Album creation failed.' };
        }

        // 3. Insert or Update Review
        // Check if review already exists
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('*') // Select all fields to return if no update needed? Actually we will update.
            .eq('user_id', user.id)
            .eq('album_id', album.id)
            .single();

        let reviewData;

        if (existingReview) {
            // Update
            const { data: updatedReview, error: updateError } = await supabase
                .from('reviews')
                .update({
                    rating,
                    review_text,
                    created_at: new Date().toISOString() // Bump timestamp to show as fresh? Or keep original? Usually update time.
                })
                .eq('id', existingReview.id)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating review:', updateError);
                return { success: false, message: 'Failed to update review.' };
            }
            reviewData = updatedReview;
        } else {
            // Insert
            const { data: newReview, error: insertError } = await supabase
                .from('reviews')
                .insert({
                    user_id: user.id,
                    album_id: album.id,
                    rating,
                    review_text,
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error inserting review:', insertError);
                return { success: false, message: 'Failed to post review.' };
            }
            reviewData = newReview;
        }

        // 4. Smart Cache Revalidation
        revalidatePath(`/album/${spotify_id}`);

        return { success: true, review: reviewData };

    } catch (error) {
        console.error('Server Action Error:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function deleteReview(reviewId: string, spotifyId: string) {
    const supabase = await getSupabaseServerClient();

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        // 2. Delete Review (Ensure user owns it)
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting review:', error);
            return { success: false, message: 'Failed to delete review.' };
        }

        // 3. Revalidate
        revalidatePath(`/album/${spotifyId}`);
        return { success: true };
    } catch (error) {
        console.error('Exception deleting review:', error);
        return { success: false, message: 'An error occurred.' };
    }
}
