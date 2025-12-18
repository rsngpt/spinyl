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
    redirectTo: `${window.location.origin}/welcome`,}
    });
  };

  return (
    <button
      onClick={loginWithSpotify}
      style={{
        padding: '8px 14px',
        borderRadius: '6px',
        border: '1px solid #000',
        background: '#000',
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      Login with Spotify
    </button>
  );
}
