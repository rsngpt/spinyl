'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';

type SubmitReviewResult = {
    success: boolean;
    message?: string;
};

export async function submitReview(formData: FormData): Promise<SubmitReviewResult> {
    const supabase = await getSupabaseServerClient();

    // 1. Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Action Auth Check:', {
        hasUser: !!user,
        userId: user?.id,
        error: authError?.message
    });
    if (!user) {
        return { success: false, message: 'You must be logged in to review.' };
    }

    const spotify_id = formData.get('spotify_id') as string;
    const name = formData.get('album_name') as string;
    const cover_image = formData.get('cover_image') as string;
    const artist_names = formData.get('artist_names') as string;
    const release_date = formData.get('release_date') as string;

    const rating = parseInt(formData.get('rating') as string);
    const review_text = formData.get('review_text') as string;

    if (!spotify_id || !rating || !review_text) {
        return { success: false, message: 'Missing required fields.' };
    }

    try {
        // 2. Ensure Album Exists in DB
        // First try to find it
        let { data: album } = await supabase
            .from('albums')
            .select('id')
            .eq('spotify_id', spotify_id)
            .single();

        if (!album) {
            // Insert if not found
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
                return { success: false, message: `Failed to create album: ${insertError.message || JSON.stringify(insertError)}` };
            }
            album = newAlbum;
        }

        if (!album) {
            return { success: false, message: 'Album ID lookup failed.' };
        }

        // 3. Insert or Update Review
        // Check if review already exists
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('user_id', user.id)
            .eq('album_id', album.id)
            .single();

        let reviewError;
        if (existingReview) {
            // Update
            const { error: updateError } = await supabase
                .from('reviews')
                .update({
                    rating,
                    review_text,
                    // updated_at could be set here if column exists
                })
                .eq('id', existingReview.id);
            reviewError = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('reviews')
                .insert({
                    user_id: user.id,
                    album_id: album.id,
                    rating,
                    review_text,
                });
            reviewError = insertError;
        }

        if (reviewError) {
            console.error('Error posting review:', reviewError);
            return { success: false, message: 'Failed to post review.' };
        }

        // 4. Smart Cache Revalidation
        revalidatePath(`/album/${spotify_id}`);

        return { success: true };

    } catch (error) {
        console.error('Server Action Error:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
