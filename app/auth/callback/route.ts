import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/?login_success=true';

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
            // Upsert Profile Logic (Ensuring registration)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { user_metadata } = user;
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        username: user_metadata.name || user_metadata.full_name || user.email?.split('@')[0],
                        full_name: user_metadata.full_name || user_metadata.name,
                        avatar_url: user_metadata.avatar_url || user_metadata.picture,
                        updated_at: new Date().toISOString(),
                    });

                if (profileError) {
                    console.error('SERVER ACTION: Profile Upsert Error:', profileError);
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        } else {
            console.error('------- AUTH CALLBACK ERROR (Exchange Failed) -------');
            console.error('Code Exchange Failed. Error Details:', JSON.stringify(error, null, 2));
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
        }
    }

    // Fallback for when 'code' is missing
    const errorDescription = searchParams.get('error_description') || 'auth_code_error';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription)}`);
}
