import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    console.log('--- AUTH CALLBACK STARTED ---');
    console.log('Request URL:', request.url);

    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    console.log('Params Details:', {
        hasCode: !!code,
        codePartial: code ? code.substring(0, 5) + '...' : 'null',
        error: errorParam,
        errorDesc
    });

    const next = searchParams.get('next') ?? '/?login_success=true';

    if (code) {
        console.log('Attempting Supabase Code Exchange...');
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
            console.log('Code Exchange Successful. Session created.');

            // Upsert Profile Logic (Ensuring registration)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log('Upserting user profile for:', user.id);
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
                } else {
                    console.log('Profile upserted successfully.');
                }
            } else {
                console.warn('Authentication successful but getUser() returned null?');
            }

            return NextResponse.redirect(`${origin}${next}`);
        } else {
            console.error('------- AUTH CALLBACK ERROR (Exchange Failed) -------');
            console.error('Code Exchange Failed. Error Details:', JSON.stringify(error, null, 2));
            console.error('Request URL:', request.url);
            console.error('Auth Code (First 5 chars):', code ? code.substring(0, 5) + '...' : 'None');
            console.error('-----------------------------------');

            const errorMessage = encodeURIComponent(error.message);
            return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
        }
    }

    // Fallback for when 'code' is missing
    console.warn('------- AUTH CALLBACK WARNING (No Code) -------');
    console.warn('Missing "code" param. Falling back to error description.');
    const errorDescription = searchParams.get('error_description') || 'auth_code_error';
    const encodedError = encodeURIComponent(errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${encodedError}`);
}
