'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';

export default function SpotifyAuthButton() {
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const loginWithSpotify = async () => {
        setIsLoading(true);
        await supabase.auth.signInWithOAuth({
            provider: 'spotify',
            options: {
                // Dev Mode Strategy: Use full scopes. You can whitelist up to 25 users.
                scopes: 'user-read-email user-read-private user-read-recently-played user-top-read',
                redirectTo: `${window.location.origin}/auth/callback`,
            }
        });
        // Keep loading state true as page will redirect
    };

    return (
        <button
            onClick={loginWithSpotify}
            disabled={isLoading}
            style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: '500px',
                border: 'none',
                background: isLoading ? '#1db954cc' : 'var(--primary)', // dimmed if loading
                color: '#000',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: isLoading ? 'wait' : 'pointer',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                transition: 'transform 0.2s ease, background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '16px',
                opacity: isLoading ? 0.7 : 1
            }}
            onMouseOver={(e) => {
                if (!isLoading) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                }
            }}
            onMouseOut={(e) => {
                if (!isLoading) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                }
            }}
        >
            {isLoading ? (
                <span>Redirecting...</span>
            ) : (
                <>
                    <span style={{ fontSize: '1.2rem' }}>🟢</span>
                    Login with Spotify
                </>
            )}
        </button>
    );
}

