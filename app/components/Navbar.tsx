'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoginButton from './LoginButton'; // Or rename to generic AuthButton
import SearchBar from './SearchBar';

interface NavbarProps {
    initialUser: any; // Using any to match existing loose typing, or import User type
    initialProfile: any;
}

export default function Navbar({ initialUser, initialProfile }: NavbarProps) {
    const [user, setUser] = useState(initialUser);
    const [profile, setProfile] = useState(initialProfile);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        // We already have initial data, so just listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    return;
                }

                if (session?.user) {
                    setUser(session.user);

                    // Only fetch profile if it changed or we don't have it (and it's not the initial load where we might have it)
                    // Actually, safer to just re-fetch profile on auth state change to be sure
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    setProfile(data);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase]);

    return (
        <nav
            className="navbar-container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(12px)',
                zIndex: 1000,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <div style={{ flex: 1 }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    <h1 className="logo-hover" style={{
                        fontSize: '1.8rem', // Slightly larger since icon is gone
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}>
                        Spinyl
                    </h1>
                </Link>
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <SearchBar user={user} />
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px' }}>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href={`/profile/${user.id}`} className="profile-hover" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.3s ease' }}>
                                {profile?.username || profile?.full_name || user.email?.split('@')[0]}
                            </span>
                            <div className="profile-avatar-container" style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'var(--primary)', overflow: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid rgba(255,255,255,0.1)',
                                transition: 'all 0.3s ease'
                            }}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: '#000', fontWeight: 700 }}>
                                        {(profile?.username || user.email || 'U')[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </Link>
                        <button
                            onClick={async () => {
                                // Optimistic UI update: Clear user immediately
                                setUser(null);
                                setProfile(null);
                                // Perform actual sign out
                                await supabase.auth.signOut();
                                window.location.href = '/';
                            }}
                            className="nav-btn"
                            style={{
                                fontSize: '0.8rem',
                                padding: '8px 20px', // Slightly smaller for logout? Or keep same? User said "Similar". 
                                // Let's keep specific fontSize override if needed, but remove other conflicting styles.
                                // Actually, .nav-btn has standard padding. Let's stick to standard to make them "look similar".
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="nav-btn">
                        Log In
                    </Link>
                )}
            </div>
        </nav>
    );
}
