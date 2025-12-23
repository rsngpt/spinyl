'use client';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginButton() {
  const loginWithSpotify = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: 'user-read-recently-played user-top-read',
        redirectTo: `${window.location.origin}/welcome`,
      }
    });
  };

  return (
    <button
      onClick={loginWithSpotify}
      className="login-btn"
      style={{
        padding: '12px 24px',
        borderRadius: '500px',
        border: 'none',
        background: 'var(--primary)',
        color: '#000', // Black text on green is Spotify's style
        fontWeight: '700',
        fontSize: '0.9rem',
        cursor: 'pointer',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        transition: 'transform 0.2s ease, background-color 0.2s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = 'var(--primary)';
      }}
    >
      Login with Spotify
    </button>
  );
}
