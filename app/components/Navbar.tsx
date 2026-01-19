/**
 * CRITICAL ARCHITECTURE NOTE:
 * This component uses a "Direct Client" pattern for fetching notifications.
 * 
 * ISSUE:
 * In production, the standard `createBrowserClient` can hang indefinitely when 
 * trying to hydrate the session from localStorage/cookies, causing a "deadlock" 
 * where `fetchNotifications` waits forever for `isAuthReady`.
 * 
 * SOLUTION:
 * We use `initialSession` prop passed from Server Component (RootLayout).
 * We create a specialized, disposable Supabase client (`fetchClient`) that:
 * 1. Uses the Access Token directly from the server prop.
 * 2.Has `persistSession: false` (MEMORY ONLY).
 * 
 * DO NOT REVERT TO STANDARD `supabase.from(...)` FOR CRITICAL INITIAL FETCHES.
 * ALWAYS USE `fetchClient` OR ENSURE DIRECT TOKEN USAGE.
 */

'use client';

import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js'; // DIRECT CLIENT IMPORT
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// ... existing imports ...
import Link from 'next/link';
import SpookyTransition from './SpookyTransition';
import NotificationDropdown from './NotificationDropdown';
import MobileSearch from './MobileSearch';
import SearchBar from './SearchBar';
import { Home, Ghost, Bell, User, Search } from 'lucide-react';

interface NavbarProps {
    initialUser: any;
    initialProfile: any;
    initialSession?: any;
}

export default function Navbar({ initialUser, initialProfile, initialSession }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [isSpooky, setIsSpooky] = useState(false);
    const [user, setUser] = useState(initialUser);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // [NEW] Mobile Search State
    const [hasUnread, setHasUnread] = useState(false);
    const [profile, setProfile] = useState(initialProfile);

    useEffect(() => {
        setIsSpooky(false);
    }, [pathname]);

    const handleSpookyTransition = () => {
        router.push('/special-theme');
        if (pathname === '/special-theme') {
            setIsSpooky(false);
        }
    };

    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false, // Fix hanging by disabling local storage
                autoRefreshToken: true,
                detectSessionInUrl: false
            }
        }
    ));

    // State for notifications
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const hasDataRef = useRef(false); // Track if we have data to avoid stale closure issues
    const [isAuthReady, setIsAuthReady] = useState(false); // New flag to block fetching

    // HYDRATE CLIENT SESSION IF NEEDED
    useEffect(() => {
        const hydrate = async () => {
            if (initialSession && initialSession.access_token) {
                try {
                    // Race against a timeout so we don't hang forever
                    const setSessionPromise = supabase.auth.setSession({
                        access_token: initialSession.access_token,
                        refresh_token: initialSession.refresh_token
                    });
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Hydration Timeout')), 1000)
                    );

                    await Promise.race([setSessionPromise, timeoutPromise]);
                } catch (e) {
                    // Silent catch or minimal warn
                    // console.warn('Navbar: setSession warning:', e);
                }
            }
            setIsAuthReady(true);
        };
        hydrate();
    }, [initialSession, supabase]);

    // Memoize the Direct Client to avoid "Multiple GoTrueClient instances" warning
    const fetchClient = useMemo(() => {
        if (initialSession && initialSession.access_token) {
            return createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    global: {
                        headers: {
                            Authorization: `Bearer ${initialSession.access_token}`
                        }
                    },
                    auth: {
                        persistSession: false // Purely in-memory
                    }
                }
            );
        }
        return supabase;
    }, [initialSession?.access_token, supabase]);

    const fetchNotifications = async () => {
        if (!isAuthReady) return;

        // Only set loading if we have NO data at all
        if (!hasDataRef.current) {
            setLoadingNotifications(true);
        }

        const safetyTimer = setTimeout(() => {
            setLoadingNotifications(false);
        }, 5000);

        // Uses the memoized client


        const systemNotifications = [{
            type: 'system',
            id: 'system-launch-v1',
            created_at: '2024-12-31T12:00:00.000Z',
            message: "We've added a Notification Tab! 🔔 Never miss an update again."
        }];

        try {
            // 1. Get who I follow
            const { data: follows, error: followError } = await fetchClient
                .from('follows')
                .select('following_id')
                .eq('follower_id', user.id);

            if (followError) throw followError;

            const followingIds = follows?.map((f: any) => f.following_id) || [];

            // 2. Reviews from followed users
            const reviewsPromise = followingIds.length > 0 ? fetchClient
                .from('reviews')
                .select(`
                    id,
                    created_at,
                    profiles!user_id (username, avatar_url),
                    albums (id, spotify_id, name, cover_image)
                `)
                .in('user_id', followingIds)
                .order('created_at', { ascending: false })
                .limit(10)
                : Promise.resolve({ data: [], error: null });

            // 3. New Followers
            const followersPromise = fetchClient
                .from('follows')
                .select(`
                    follower_id,
                    created_at,
                    follower:profiles!follows_follower_id_fkey (username, avatar_url)
                `)
                .eq('following_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            // 4. Real Notifications (Comments, Mentions)
            const realNotificationsPromise = fetchClient
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            const [reviewsRes, followersRes, realNotifsRes] = await Promise.all([reviewsPromise, followersPromise, realNotificationsPromise]);

            if (realNotifsRes.error) {
                console.error('Real Notifs fetch error:', realNotifsRes.error);
            }
            // Removed debug log: console.log('DEBUG: Real Notifs Raw:', realNotifsRes.data);

            // Fetch profiles & Comment details manually
            let realNotifsWithDetails: any[] = [];
            if (realNotifsRes.data && realNotifsRes.data.length > 0) {
                // 1. Get Actor Profiles
                const actorIds = [...new Set(realNotifsRes.data.map((n: any) => n.actor_id).filter(Boolean))];
                let actorMap = new Map();

                if (actorIds.length > 0) {
                    const { data: actors } = await fetchClient
                        .from('profiles')
                        .select('id, username, avatar_url')
                        .in('id', actorIds);
                    actorMap = new Map(actors?.map((a: any) => [a.id, a]) || []);
                }

                // 2. Get Comment Details (for review_id)
                const commentIds = [...new Set(realNotifsRes.data.map((n: any) => n.comment_id).filter(Boolean))];
                let commentMap = new Map();

                if (commentIds.length > 0) {
                    const { data: comments } = await fetchClient
                        .from('comments')
                        .select('id, review_id')
                        .in('id', commentIds);
                    commentMap = new Map(comments?.map((c: any) => [c.id, c]) || []);
                }

                realNotifsWithDetails = realNotifsRes.data.map((n: any) => ({
                    ...n,
                    actor: n.actor_id ? actorMap.get(n.actor_id) : null,
                    comments: n.comment_id ? commentMap.get(n.comment_id) : null
                }));
            }

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
                follower: f.follower,
                follower_user_id: f.follower_id
            }));

            const realNotifItems = realNotifsWithDetails.map((n: any) => ({
                type: n.type || 'system',
                id: n.id,
                created_at: n.created_at,
                message: n.message,
                resource_id: n.resource_id,
                actor: n.actor,
                comment_id: n.comment_id,
                review_id: n.comments?.review_id
            }));

            const combined: any[] = [...reviewItems, ...followerItems, ...realNotifItems, ...systemNotifications];

            combined.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setNotifications(combined);
            hasDataRef.current = true;

            if (user?.id) {
                localStorage.setItem(`notifications_v4_${user.id}`, JSON.stringify(combined));
            }

            if (combined.length > 0) {
                const latestActivityTime = new Date(combined[0].created_at).getTime();
                const lastCheckTime = parseInt(localStorage.getItem(`lastReadTime_${user.id}`) || '0');
                if (latestActivityTime > lastCheckTime) {
                    setHasUnread(true);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            if (!hasDataRef.current) {
                setNotifications(prev => prev.length === 0 ? systemNotifications : prev);
                hasDataRef.current = true;
            }
        } finally {
            clearTimeout(safetyTimer);
            setLoadingNotifications(false);
        }
    };

    // Initial load and polling
    useEffect(() => {
        if (!user || !isAuthReady) return;

        const cached = localStorage.getItem(`notifications_v4_${user.id}`);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setNotifications(parsed);
                hasDataRef.current = true;
            } catch (e) {
                console.error('Error parsing cached notifications', e);
            }
        }

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user, supabase, isAuthReady]);

    // Realtime Subscription
    useEffect(() => {
        if (!user || !isAuthReady) return;

        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    console.log('Realtime: New notification received');
                    fetchNotifications();
                    setHasUnread(true);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase, isAuthReady]);

    const handleOpenNotifications = () => {
        if (!showNotifications) {
            setHasUnread(false);
            localStorage.setItem(`lastReadTime_${user?.id}`, Date.now().toString());
            setShowNotifications(true);

            if (notifications.length === 0) {
                setLoadingNotifications(true);
            }
            fetchNotifications();
        } else {
            setShowNotifications(false);
        }
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    return;
                }

                if (session?.user) {
                    setUser(session.user);
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
        <>
            <nav
                className="navbar-container"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 1000,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '0 16px',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    // justifyContent handled by flex logic + globals override on mobile
                    justifyContent: 'space-between'
                }}
            >
                {/* Desktop Left Group: Logo + Links */}
                <div className="nav-left-group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <img
                            src="/spinyl-logo-white.png"
                            alt="Spinyl"
                            className="logo-hover"
                            style={{
                                height: '30px',
                                objectFit: 'contain',
                                cursor: 'pointer'
                            }}
                        />
                    </Link>

                    <div className="desktop-only-links" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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

                {/* Desktop Right Group: Search + Profile */}
                <div className="desktop-search-profile" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div className="nav-search-container">
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
            </nav>

            {/* Mobile Bottom Control Panel - MOVED OUTSIDE NAV to ensure fixed bottom positioning */}
            <div className="mobile-bottom-nav">
                <Link href="/" className="nav-icon-link" title="Home">
                    <Home size={24} />
                </Link>

                {/* Mobile Search Trigger */}
                <div
                    className="nav-icon-link"
                    title="Search"
                    onClick={() => setIsMobileSearchOpen(true)}
                    style={{ cursor: 'pointer' }}
                >
                    <Search size={24} />
                </div>

                <div
                    className="nav-icon-link st-nav-link"
                    title="Special Theme"
                    onClick={() => setIsSpooky(true)}
                    style={{ cursor: 'pointer' }}
                >
                    <span style={{ fontSize: '24px', fontWeight: '900', color: '#E50914' }}>5</span>
                </div>

                {/* Mobile Notification Trigger - Reuses same logic as desktop */}
                {user && (
                    <div
                        className="nav-icon-link"
                        title="Notifications"
                        onClick={() => {
                            setHasUnread(false);
                            if (user?.id) {
                                localStorage.setItem(`lastReadTime_${user.id}`, Date.now().toString());
                            }
                            router.push('/notifications');
                        }}
                        style={{ cursor: 'pointer', position: 'relative' }}
                    >
                        <Bell size={24} />
                        {hasUnread && (
                            <span style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#E50914',
                                borderRadius: '50%',
                                border: '1px solid black'
                            }} />
                        )}
                    </div>
                )}

                {user ? (
                    <Link href={`/profile/${user.id}`} className="nav-icon-link" title="Profile">
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'var(--primary)', overflow: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ color: '#000', fontWeight: 700, fontSize: '0.8rem' }}>
                                    {(profile?.username || user.email || 'U')[0].toUpperCase()}
                                </span>
                            )}
                        </div>
                    </Link>
                ) : (
                    <Link href="/login" className="nav-icon-link" title="Login">
                        <User size={24} />
                    </Link>
                )}
            </div>

            {/* Mobile Search Component */}
            <MobileSearch
                isOpen={isMobileSearchOpen}
                onClose={() => setIsMobileSearchOpen(false)}
                user={user}
            />

            {/* Reuse Notification Dropdown for Mobile (may need style tweak or just use same absolute position adjusted by CSS) */}
            {/* Logic: The desktop dropdown is absolutely positioned relative to the bell. 
                For mobile, we might want it fixed/centered or fullscreen. 
                Current NotificationDropdown is likely designed for desktop dropdown.
                Let's inspect NotificationDropdown later if it looks broken on mobile. 
                For now, let's keep the single instance logic but maybe we need a separate mobile instance or style override?
                Actually, the Desktop Bell renders independent of Mobile Bell. 
                The Desktop one has the Dropdown as a sibling in the DOM. 
                We need to render the Dropdown for mobile too.
            */}
            {/* Mobile Notification Dropdown Overlay? or Reuse? 
               Let's render a global NotificationDropdown if showNotifications is true AND isMobile.
               Or just render it here in the mobile block?
               The current NotificationDropdown is absolutely positioned.
               We probably want a Fixed Position Modal for mobile notifications.
               Let's add a condition or wrapper.
            */}
            {user && showNotifications && (
                <div className="mobile-notification-wrapper">
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
            )}

            <SpookyTransition isActive={isSpooky} onComplete={handleSpookyTransition} />
            <style jsx>{`
                /* Desktop Default */
                .navbar-container {
                    /* justifyContent handled by flex logic + globals override on mobile */
                    justify-content: space-between;
                }
                .mobile-bottom-nav {
                    display: none;
                }
            `}</style>
        </>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link href={href} className="nav-icon-link" title={label}>
            {icon}
        </Link>
    );
}
