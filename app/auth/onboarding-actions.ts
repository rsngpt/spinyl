'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function submitOnboarding(formData: FormData) {
    const username = formData.get('username') as string;
    const bio = formData.get('bio') as string;
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                },
            },
        }
    );

    // 1. Get Current User
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: 'Unauthorized' };
    }

    // 2. Check Username Uniqueness
    // We check if ANY profile has this username, EXCLUDING the current user (in case they are updating)
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id) // allow claiming your own username if it was partially set
        .single();

    if (existingUser) {
        return { error: 'Username is already taken.' };
    }

    // 3. Upsert Profile
    // We strictly use the user.id as the profile primary key
    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            username: username,
            bio: bio,
            full_name: user.user_metadata.full_name || user.user_metadata.name,
            avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture,
            updated_at: new Date().toISOString(),
        });

    if (upsertError) {
        return { error: upsertError.message };
    }

    return { success: true };
}
