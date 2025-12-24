import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';
    // Default to root, but logic below might override to /onboarding

    if (code) {
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

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check if user has a profile with a 'username' set.
            // If NOT, redirect to /onboarding.
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .single();

                // If profile missing OR username is default/empty -> Onboarding
                // (Assuming we want them to pick a unique one, even if we auto-gen one, 
                // but for this pivot, let's force them to choose if it's not set cleanly).
                if (!profile || !profile.username) {
                    return NextResponse.redirect(`${origin}/onboarding`);
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // specific handling for error (e.g. google access_denied)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
