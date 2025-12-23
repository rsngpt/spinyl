'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check active session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loginWithSpotify = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: 'user-read-recently-played user-top-read',
        redirectTo: `${window.location.origin}`,
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || 'User';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', textDecoration: 'none' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '2px solid var(--primary)',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              👤
            </div>
          )}
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{displayName}</span>
        </Link>

        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer',
            fontSize: '0.8rem',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
          onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}
        >
          log out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="login-btn"
      style={{
        padding: '10px 24px',
        borderRadius: '500px',
        border: 'none',
        background: 'var(--primary)',
        color: '#000',
        fontWeight: '700',
        fontSize: '0.9rem',
        cursor: 'pointer',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        transition: 'transform 0.2s ease, background-color 0.2s ease',
        textDecoration: 'none',
        display: 'inline-block'
      }}
    // removed mouse handlers for simplicity on Link, or can add them back via css class 
    >
      Login
    </Link>
  );
}
