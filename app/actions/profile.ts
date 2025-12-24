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

    const cleanUsername = username.trim().toLowerCase(); // Force lowercase for handles? Or keep mixed? Usually handles are lower.
    // Let's stick to input case but maybe check case-insensitive uniqueness? 
    // For now, simpler: just rely on the unique constraint.

    // Update Profile
    const { error } = await supabase
        .from('profiles')
        .update({ username: cleanUsername })
        .eq('id', user.id);

    if (error) {
        // Postgres Unique Constraint Violation Code: 23505
        if (error.code === '23505') {
            return { message: 'This username is already taken.', success: false };
        }
        console.error('Update Profile Error:', error);
        return { message: 'Failed to update profile.', success: false };
    }

    revalidatePath(`/profile/${user.id}`);
    revalidatePath('/'); // Refresh places where username might be shown (like Navbar)

    return { message: 'Profile updated!', success: true };
}
