'use client';

import { createBrowserClient } from '@supabase/ssr';

export default function SpotifyAuthButton() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const loginWithSpotify = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'spotify',
            options: {
                scopes: 'user-read-recently-played user-top-read',
                redirectTo: `${window.location.origin}`,
            }
        });
    };

    return (
        <button
            onClick={loginWithSpotify}
            style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: '500px',
                border: 'none',
                background: 'var(--primary)',
                color: '#000',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                transition: 'transform 0.2s ease, background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '16px'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
        >
            <span style={{ fontSize: '1.2rem' }}>🟢</span> {/* Placeholder for Spotify Icon if no SVG */}
            Login with Spotify
        </button>
    );
}
