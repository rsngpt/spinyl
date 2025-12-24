import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
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
            // Check whitelist
            const allowedUsers = process.env.ALLOWED_USERS?.split(',').map(u => u.trim().toLowerCase()) ?? [];
            const { data: { user } } = await supabase.auth.getUser();

            // Only enforce whitelist if ALLOWED_USERS is set in env
            if (allowedUsers.length > 0 && user?.email) {
                if (!allowedUsers.includes(user.email.toLowerCase())) {
                    await supabase.auth.signOut();
                    return NextResponse.redirect(`${origin}/login?error=Access Denied: You are not on the access list.`);
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        } else {
            console.error('------- AUTH CALLBACK ERROR -------');
            console.error('Code Exchange Failed. Error Details:', JSON.stringify(error, null, 2));
            console.error('Request URL:', request.url);
            console.error('Auth Code (First 5 chars):', code ? code.substring(0, 5) + '...' : 'None');
            console.error('-----------------------------------');

            const errorMessage = encodeURIComponent(error.message);
            return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
        }
    }

    // Fallback for when 'code' is missing (e.g. Provider error redirected immediately)
    const errorDescription = searchParams.get('error_description') || 'auth_code_error';
    const encodedError = encodeURIComponent(errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${encodedError}`);
}
