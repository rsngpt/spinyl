'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';

export async function login(formData: FormData) {
    const supabase = await getSupabaseServerClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

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
    const supabase = await getSupabaseServerClient();
    const headersList = await headers();
    const origin = headersList.get('origin');

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: username,
                avatar_url: '',
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function signOutAction() {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();

    // Manual Nuke: Find and delete all Supabase cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Filter for cookies that look like Supabase tokens
    const supabaseCookies = allCookies.filter(c =>
        c.name.includes('sb-') && c.name.includes('-auth-token') ||
        c.name.startsWith('sb-')
    );

    // Delete them explicitly
    supabaseCookies.forEach(c => {
        cookieStore.delete(c.name);
    });

    revalidatePath('/', 'layout');
    redirect('/login');
}
