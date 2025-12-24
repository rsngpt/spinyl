'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, Zap, MessageCircle, Phone } from 'lucide-react';
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
                backgroundColor: 'rgba(0, 0, 0, 0.9)', // Slightly darker for mobile readability
                backdropFilter: 'blur(12px)',
                zIndex: 1000,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0 16px', // Standardize padding
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
        >
            {/* Left Side: Logo + Nav Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    <h1 className="logo-hover" style={{
                        fontSize: '1.5rem',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}>
                        Spinyl
                    </h1>
                </Link>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <NavLink href="/#hero" icon={<Home size={20} />} label="Home" />
                    <NavLink href="/#features" icon={<Zap size={20} />} label="Features" />
                    <NavLink href="/#reviews" icon={<MessageCircle size={20} />} label="Reviews" />
                    <NavLink href="/#footer" icon={<Phone size={20} />} label="Contact" />
                </div>
            </div>

            {/* Right Side: Search + Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '280px' }}>
                    <SearchBar user={user} />
                </div>

                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Link href={`/profile/${user.id}`} className="profile-hover" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                                <span className="hide-on-mobile" style={{ fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.3s ease' }}>
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
                                    setUser(null);
                                    setProfile(null);
                                    await supabase.auth.signOut();
                                    window.location.href = '/';
                                }}
                                className="nav-btn"
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '8px 16px',
                                    whiteSpace: 'nowrap'
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
            </div>
        </nav>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link href={href} className="nav-icon-link" title={label}>
            {icon}
        </Link>
    );
}
