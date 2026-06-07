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
