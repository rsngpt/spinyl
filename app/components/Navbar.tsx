'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import SpookyTransition from './SpookyTransition';
import { Home, Ghost, Bell } from 'lucide-react';
import LoginButton from './LoginButton'; // Or rename to generic AuthButton
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropdown';

interface NavbarProps {
    initialUser: any; // Using any to match existing loose typing, or import User type
    initialProfile: any;
}

export default function Navbar({ initialUser, initialProfile }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [isSpooky, setIsSpooky] = useState(false);
    const [user, setUser] = useState(initialUser);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        setIsSpooky(false);
    }, [pathname]);

    const handleSpookyTransition = () => {
        router.push('/special-theme');
        if (pathname === '/special-theme') {
            setIsSpooky(false);
        }
    };
    const [profile, setProfile] = useState(initialProfile);

    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));

    // State for notifications
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const hasDataRef = useRef(false); // Track if we have data to avoid stale closure issues

    // Initial load and polling
    useEffect(() => {
        if (!user) return;

        // 0. Load from cache immediately
        const cached = localStorage.getItem(`notifications_${user.id}`);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setNotifications(parsed);
                hasDataRef.current = true; // Mark as having data
            } catch (e) {
                console.error('Error parsing cached notifications', e);
            }
        }

        fetchNotifications();

        // Check for updates every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user, supabase]);

    const fetchNotifications = async () => {
        // Only set loading if we have NO data at all (ref persists across renders)
        if (!hasDataRef.current) {
            setLoadingNotifications(true);
        }

        // Safety timeout: If fetch takes too long, stop loading anyway
        const safetyTimer = setTimeout(() => {
            setLoadingNotifications(false);
        }, 5000);

        // Always define static announcements
        const systemNotifications = [{
            type: 'system',
            id: 'system-launch-v1',
            created_at: '2024-12-31T12:00:00.000Z',
            message: "We've added a Notification Tab! 🔔 Never miss an update again."
        }];

        try {
            // 1. Get who I follow
            const { data: follows, error: followError } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', user.id);

            if (followError) throw followError;

            const followingIds = follows?.map(f => f.following_id) || [];

            // 2. Reviews from followed users
            const reviewsPromise = followingIds.length > 0 ? supabase
                .from('reviews')
                .select(`
                    id,
                    created_at,
                    profiles!user_id (username, avatar_url),
                    albums (id, name, cover_image)
                `)
                .in('user_id', followingIds)
                .order('created_at', { ascending: false })
                .limit(10)
                : Promise.resolve({ data: [], error: null });

            // 3. New Followers
            const followersPromise = supabase
                .from('follows')
                .select(`
                    follower_id,
                    created_at,
                    follower:profiles!follows_follower_id_fkey (username, avatar_url)
                `)
                .eq('following_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            const [reviewsRes, followersRes] = await Promise.all([reviewsPromise, followersPromise]);

            if (reviewsRes.error) console.error('Reviews fetch error:', reviewsRes.error);
            if (followersRes.error) console.error('Followers fetch error:', followersRes.error);

            const reviewItems = (reviewsRes.data || []).map((r: any) => ({
                type: 'review',
                id: r.id,
                created_at: r.created_at,
                profiles: r.profiles,
                albums: r.albums
            }));

            const followerItems = (followersRes.data || []).map((f: any) => ({
                type: 'follow',
                id: `follow-${f.follower_id}-${f.created_at}`,
                created_at: f.created_at,
                follower: f.follower
            }));

            // Combine fetched data with static system notifications
            const combined: any[] = [...reviewItems, ...followerItems, ...systemNotifications];

            combined.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Update state

            setNotifications(combined);
            hasDataRef.current = true; // Mark as having data

            // Update cache
            if (user?.id) {
                localStorage.setItem(`notifications_${user.id}`, JSON.stringify(combined));
            }

            // Check unread status
            if (combined.length > 0) {
                const latestActivityTime = new Date(combined[0].created_at).getTime();
                const lastCheckTime = parseInt(localStorage.getItem(`lastReadTime_${user.id}`) || '0');
                if (latestActivityTime > lastCheckTime) {
                    setHasUnread(true);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Even on error, show the system notification so it's not empty
            // Verify if we have displayed anything yet
            if (!hasDataRef.current) {
                setNotifications(prev => prev.length === 0 ? systemNotifications : prev);
                hasDataRef.current = true;
            }
        } finally {
            clearTimeout(safetyTimer);
            setLoadingNotifications(false);
        }
    };

    const handleOpenNotifications = () => {
        if (!showNotifications) {
            // Opening
            setHasUnread(false); // Clear dot immediately
            localStorage.setItem(`lastReadTime_${user?.id}`, Date.now().toString());
            setShowNotifications(true);

            // Force a refresh if it's empty or just to be sure, but don't show loading spinner if we have cache
            if (notifications.length === 0) {
                setLoadingNotifications(true);
            }
            fetchNotifications();
        } else {
            setShowNotifications(false);
        }
    };

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

                    <Link
                        href="/special-theme"
                        className="nav-icon-link st-nav-link"
                        title="Stranger Things Special"
                        style={{ textDecoration: 'none' }}
                        onClick={(e) => {
                            e.preventDefault();
                            setIsSpooky(true);
                        }}
                    >
                        <span style={{
                            fontSize: '24px',
                            fontWeight: '900',
                            color: '#E50914',
                            textShadow: '0 0 10px rgba(229, 9, 20, 0.8)',
                            lineHeight: '1',
                            paddingBottom: '2px'
                        }}>
                            5
                        </span>
                    </Link>
                </div>
            </div>

            {/* Right Side: Search + Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '280px' }}>
                    <SearchBar user={user} />
                </div>

                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                className="nav-icon-link"
                                style={{
                                    border: 'none',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                title="Notifications"
                                onClick={handleOpenNotifications}
                            >
                                <Bell size={20} />
                                {hasUnread && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#E50914',
                                        borderRadius: '50%',
                                        border: '1px solid black',
                                        boxShadow: '0 0 4px rgba(229, 9, 20, 0.8)'
                                    }} />
                                )}
                            </button>
                            <div style={{ position: 'absolute', top: '100%', right: '80px' }}>
                                <NotificationDropdown
                                    userId={user.id}
                                    isOpen={showNotifications}
                                    onClose={() => setShowNotifications(false)}
                                    supabase={supabase}
                                    notifications={notifications}
                                    loading={loadingNotifications}
                                    onRefresh={fetchNotifications}
                                />
                            </div>
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
            <SpookyTransition isActive={isSpooky} onComplete={handleSpookyTransition} />
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
