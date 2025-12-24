'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await getSupabaseServerClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}

export async function signup(formData: FormData) {
    const origin = (await headers()).get('origin');
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const supabase = await getSupabaseServerClient();

    const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username,
                full_name: username, // compatibility
                avatar_url: '',
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Success! Profile is handled by DB trigger.
    return { success: true };
}
