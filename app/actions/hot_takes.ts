'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createHotTake(content: string) {
    const supabase = await getSupabaseServerClient();

    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error('Unauthorized');
    }

    // Validation
    if (!content || content.trim().length === 0) {
        throw new Error('Content cannot be empty');
    }
    if (content.length > 300) {
        throw new Error('Content too long');
    }

    // Insert
    const { error } = await supabase.from('hot_takes').insert({
        user_id: user.id,
        content: content.trim(),
    });

    if (error) {
        console.error('Error creating hot take:', error);
        throw new Error('Failed to post hot take');
    }

    // Revalidate
    revalidatePath('/feed');
    revalidatePath('/');

    return { success: true };
}
