'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: 'Not authenticated', success: false };
    }

    const username = formData.get('username') as string;

    if (!username || username.trim().length < 3) {
        return { message: 'Username must be at least 3 characters long.', success: false };
    }

    // Update Profile
    const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);

    if (error) {
        console.error('Update Profile Error:', error);
        return { message: 'Failed to update profile. It might be taken.', success: false };
    }

    revalidatePath(`/profile/${user.id}`);

    return { message: 'Profile updated!', success: true };
}
