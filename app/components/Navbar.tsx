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
import Link from 'next/link';
import { motion } from 'framer-motion';
import SpookyTransition from './SpookyTransition';
import NotificationDropdown from './NotificationDropdown';
import MobileSearch from './MobileSearch';
import SearchBar from './SearchBar';
import { Home, Ghost, Bell, User, Search, Disc, Plus, Compass, LogOut } from 'lucide-react';

interface MobileNavItemProps {
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    title: string;
    isActive: boolean;
}

const MobileNavItem = ({ href, onClick, icon, title, isActive }: MobileNavItemProps) => {
    const itemContent = (
        <motion.div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: '4px',
                width: '64px'
            }}
            whileTap={{ scale: 0.92 }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '56px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px',
                    color: isActive 
                        ? 'var(--md-sys-color-on-secondary-container)' 
                        : 'var(--md-sys-color-on-surface-variant)',
                    transition: 'color 0.2s ease'
                }}
            >
                {isActive && (
                    <motion.div
                        layoutId="mobileNavActiveIndicator"
                        transition={{ type: "spring", stiffness: 380, damping: 25 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'var(--md-sys-color-secondary-container)',
                            borderRadius: '16px',
                            zIndex: -1
                        }}
                    />
                )}
                {icon}
            </div>
            <span
                style={{
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.2px',
                    color: isActive 
                        ? 'var(--md-sys-color-on-surface)' 
                        : 'var(--md-sys-color-on-surface-variant)',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap'
                }}
            >
                {title}
            </span>
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} style={{ textDecoration: 'none', display: 'flex' }}>
                {itemContent}
            </Link>
        );
    }

    return (
        <div onClick={onClick} style={{ display: 'flex' }}>
            {itemContent}
        </div>
    );
};

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

    useEffect(() => {
        const handleOpenSearch = () => {
            if (window.matchMedia('(max-width: 768px)').matches) {
                setIsMobileSearchOpen(true);
            }
        };

        window.addEventListener('spinyl:open-search', handleOpenSearch);
        return () => window.removeEventListener('spinyl:open-search', handleOpenSearch);
    }, []);

    // SAFETY: Sanitize LocalStorage to prevent "Cannot create property 'user' on string" error
    useEffect(() => {
        try {
            const key = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]}-auth-token`;
            const raw = localStorage.getItem(key);
            if (raw) {
                // If the first char is NOT '{' or '[' it might be double encoded or just wrong 
                // But specifically for this error, the value IS a stringified JSON but treated as a string by the client? 
                // Actually the error is "Cannot create property 'user' on string X" where X is the stringified JSON.
                // This usually implies the client expected an object but got a string string.

                // Let's try to parse it.
                try {
                    const parsed = JSON.parse(raw);
                    if (typeof parsed === 'string') {
                        console.warn('Found double-encoded Supabase session. Cleaning up...');
                        localStorage.removeItem(key);
                        window.location.reload();
                    }
                } catch (e) {
                    // if it's not valid JSON, it's also bad
                    // localStorage.removeItem(key); 
                }
            }
        } catch (e) {
            // ignore
        }
    }, []);

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
                    // Silent catch
                }
            }
            setIsAuthReady(true);
        };
        hydrate();
    }, [initialSession, supabase]);

    const fetchNotifications = async () => {
        if (!user) return;

        // Only set loading if we have NO data at all
        if (!hasDataRef.current) {
            setLoadingNotifications(true);
        }

        const safetyTimer = setTimeout(() => {
            setLoadingNotifications(false);
        }, 5000);

        const systemNotifications = [{
            type: 'system',
            id: 'system-launch-v1',
            created_at: '2024-12-31T12:00:00.000Z',
            message: "We've added a Notification Tab! 🔔 Never miss an update again."
        }];

        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) {
                throw new Error(`API returned status ${res.status}`);
            }
            const data = await res.json();
            
            const combined: any[] = [...(data.notifications || []), ...systemNotifications];

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
        } catch (error: any) {
            console.error('Error fetching notifications (Detailed):', error);
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
                    backgroundColor: 'rgba(19, 15, 13, 0.92)', // Match the body warm background
                    backdropFilter: 'blur(16px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                    zIndex: 1000,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0 32px',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                {/* Mobile Left Home Navigation (hidden on desktop) */}
                <div className="mobile-nav-home">
                    <Link
                        href="/"
                        onClick={(e) => {
                            if (pathname === '/') {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                        style={{ color: 'inherit', display: 'flex' }}
                    >
                        <Home size={24} />
                    </Link>
                </div>

                {/* Mobile Centered Logo (hidden on desktop) */}
                <div className="mobile-nav-logo">
                    <Link
                        href="/"
                        onClick={(e) => {
                            if (pathname === '/') {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                        style={{ display: 'flex' }}
                    >
                        <img
                            src="/spinyl-logo-white.png"
                            alt="Spinyl"
                            style={{
                                height: '26px',
                                objectFit: 'contain'
                            }}
                        />
                    </Link>
                </div>

                {/* Desktop Left Group: Logo + Styled Text Navigation Links */}
                <div className="nav-left-section">
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <img
                            src="/spinyl-logo-white.png"
                            alt="Spinyl"
                            className="logo-img logo-hover"
                            style={{
                                height: '28px',
                                objectFit: 'contain',
                                cursor: 'pointer'
                            }}
                        />
                    </Link>

                    <div className="desktop-only-links">
                        <NavLink href="/#hero" icon={<Home size={18} />} label="Home" />
                        <NavLink href="/feed" icon={<Disc size={18} />} label="Feed" />
                        <NavLink href="/explore" icon={<Compass size={18} />} label="Explore" />
                        {user && <NavLink href="/compose" icon={<Plus size={18} />} label="Create" />}
                    </div>
                </div>

                {/* Desktop Right Group: Search + Actions + Profile */}
                <div className="nav-right-section">
                    <SearchBar user={user} />

                    <div className="desktop-action-links">
                        {user ? (
                            <>
                                {/* Notifications Bell */}
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <button
                                        className="nav-action-btn"
                                        title="Notifications"
                                        onClick={handleOpenNotifications}
                                    >
                                        <Bell size={18} />
                                        {hasUnread && <span className="bell-badge" />}
                                    </button>

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

                                {/* User Profile Badge */}
                                <Link 
                                    href={`/profile/${user.id}`} 
                                    className={`nav-profile-link ${pathname.startsWith('/profile') ? 'active' : ''}`}
                                >
                                    <div className="nav-avatar-container">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="nav-avatar-img" />
                                        ) : (
                                            <span>
                                                {(profile?.username || user.email || 'U')[0].toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="nav-username hide-on-mobile">
                                        {profile?.username || profile?.full_name || user.email?.split('@')[0]}
                                    </span>
                                </Link>

                                {/* Log Out Icon Button */}
                                <button
                                    onClick={async () => {
                                        setUser(null);
                                        setProfile(null);
                                        await supabase.auth.signOut();
                                        window.location.href = '/';
                                    }}
                                    className="nav-action-btn logout-btn"
                                    title="Log Out"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <NavLink href="/login" icon={<User size={18} />} label="Log In" />
                        )}
                    </div>
                </div>

                {/* Mobile Top Notification Bell */}
                {user && (
                    <div
                        className="mobile-nav-bell"
                        onClick={() => {
                            setHasUnread(false);
                            if (user?.id) {
                                  localStorage.setItem(`lastReadTime_${user.id}`, Date.now().toString());
                            }
                            router.push('/notifications');
                        }}
                    >
                        <Bell size={24} />
                        {hasUnread && (
                            <span className="notification-dot" />
                        )}
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Control Panel */}
            <div className="mobile-bottom-nav">
                <MobileNavItem
                    href="/feed"
                    title="Feed"
                    icon={<Home size={22} strokeWidth={pathname === '/feed' ? 2 : 1.5} />}
                    isActive={pathname === '/feed'}
                />

                <MobileNavItem
                    onClick={() => setIsMobileSearchOpen(true)}
                    title="Search"
                    icon={<Search size={22} strokeWidth={isMobileSearchOpen || pathname === '/search' ? 2 : 1.5} />}
                    isActive={isMobileSearchOpen || pathname === '/search'}
                />

                <MobileNavItem
                    href="/compose"
                    title="Compose"
                    icon={<Plus size={22} strokeWidth={pathname === '/compose' ? 2 : 1.5} />}
                    isActive={pathname === '/compose'}
                />

                <MobileNavItem
                    onClick={() => setIsSpooky(true)}
                    title="Spooky"
                    icon={<Ghost size={22} strokeWidth={isSpooky || pathname === '/special-theme' ? 2 : 1.5} color={isSpooky || pathname === '/special-theme' ? "#E50914" : undefined} />}
                    isActive={isSpooky || pathname === '/special-theme'}
                />

                {user ? (
                    <MobileNavItem
                        href={`/profile/${user.id}`}
                        title="Profile"
                        icon={
                            <div style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                background: pathname.startsWith('/profile') ? 'var(--md-sys-color-primary)' : 'rgba(255, 255, 255, 0.2)', 
                                overflow: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: pathname.startsWith('/profile') ? '2px solid var(--md-sys-color-primary)' : '1px solid rgba(255,255,255,0.25)',
                                transition: 'all 0.25s ease'
                            }}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: pathname.startsWith('/profile') ? '#000' : '#fff', fontWeight: 700, fontSize: '0.7rem' }}>
                                        {(profile?.username || user.email || 'U')[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                        }
                        isActive={pathname.startsWith('/profile')}
                    />
                ) : (
                    <MobileNavItem
                        href="/login"
                        title="Login"
                        icon={<User size={22} strokeWidth={pathname === '/login' ? 2 : 1.5} />}
                        isActive={pathname === '/login'}
                    />
                )}
            </div>

            {/* Mobile Search Component */}
            <MobileSearch
                isOpen={isMobileSearchOpen}
                onClose={() => setIsMobileSearchOpen(false)}
                user={user}
            />

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
                .nav-left-section {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .desktop-only-links {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .nav-right-section {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 1;
                    justify-content: flex-end;
                }

                .desktop-action-links {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                /* Action Icon Buttons Styling */
                .nav-action-btn {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .nav-action-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    border-color: rgba(255, 255, 255, 0.15);
                    transform: translateY(-1px);
                }

                .nav-action-btn:active {
                    transform: translateY(0);
                }

                .bell-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 8px;
                    height: 8px;
                    background-color: #E50914;
                    border-radius: 50%;
                    border: 1.5px solid #130f0d;
                    box-shadow: 0 0 6px rgba(229, 9, 20, 0.8);
                }

                /* User Profile Pill */
                :global(.nav-profile-link) {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 4px 14px 4px 5px;
                    border-radius: 100px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    text-decoration: none;
                    color: rgba(255, 255, 255, 0.8);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                :global(.nav-profile-link:hover) {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                    color: #fff;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                :global(.nav-profile-link.active) {
                    color: var(--md-sys-color-primary);
                    background: rgba(255, 159, 104, 0.1);
                    border-color: rgba(255, 159, 104, 0.2);
                    box-shadow: 0 4px 12px rgba(255, 159, 104, 0.05);
                }

                :global(.nav-profile-link.active) .nav-avatar-container {
                    border-color: var(--md-sys-color-primary);
                    box-shadow: 0 0 10px rgba(255, 159, 104, 0.35);
                }

                .nav-avatar-container {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--md-sys-color-primary-container);
                    color: var(--md-sys-color-on-primary-container);
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255,255,255,0.1);
                    font-weight: 700;
                    font-size: 0.8rem;
                }

                .nav-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .nav-username {
                    font-weight: 600;
                    font-size: 0.88rem;
                }

                /* Premium Spooky ghost */
                .spooky-ghost-icon {
                    color: rgba(255, 255, 255, 0.7);
                    transition: all 0.25s ease;
                }

                .spooky-theme-btn:hover .spooky-ghost-icon {
                    color: #E50914 !important;
                    filter: drop-shadow(0 0 8px rgba(229, 9, 20, 0.85));
                    animation: jitter-ghost 0.3s infinite;
                }

                @keyframes jitter-ghost {
                    0% { transform: translate(0, 0) scale(1.05); }
                    20% { transform: translate(-1px, 1px) scale(1.05); }
                    40% { transform: translate(1px, -1px) scale(1.05); }
                    60% { transform: translate(-1px, -1px) scale(1.05); }
                    80% { transform: translate(1.5px, 1px) scale(1.05); }
                    100% { transform: translate(0, 0) scale(1.05); }
                }

                /* Navigation links styling */
                :global(.nav-link) {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255, 255, 255, 0.65) !important;
                    text-decoration: none;
                    font-size: 0.92rem;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: 1px solid transparent;
                }

                :global(.nav-link:hover) {
                    color: #fff !important;
                    background: rgba(255, 255, 255, 0.05);
                }

                :global(.nav-link.active) {
                    color: var(--md-sys-color-primary) !important;
                    background: rgba(255, 159, 104, 0.1) !important;
                    border-color: rgba(255, 159, 104, 0.15) !important;
                }

                /* Premium Login Button */
                .login-btn-premium {
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 10px 22px;
                    border-radius: 30px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-decoration: none;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                }

                .login-btn-premium:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                }

                .logo-hover {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .logo-hover:hover {
                    transform: scale(1.03);
                }

                /* Mobile/Bottom Navigation Styles */
                .mobile-bottom-nav {
                    display: none;
                }

                .mobile-nav-bell, .mobile-nav-home {
                    display: none;
                    cursor: pointer;
                    position: relative;
                    padding: 8px;
                    color: rgba(255, 255, 255, 0.8);
                }

                .notification-dot {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 8px;
                    height: 8px;
                    background-color: #E50914;
                    border-radius: 50%;
                    border: 1px solid black;
                    box-shadow: 0 0 4px rgba(229, 9, 20, 0.8)
                }

                .mobile-nav-logo {
                    display: none;
                }

                @media (max-width: 768px) {
                    /* Hide Desktop Sections on Mobile */
                    .nav-left-section,
                    .nav-right-section {
                        display: none !important;
                    }

                    :global(.navbar-container) {
                        justify-content: center !important; 
                        position: relative; 
                        padding: 0 16px !important;
                    }

                    .mobile-nav-logo {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: absolute !important;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 10;
                    }

                    .mobile-nav-bell {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: absolute !important;
                        right: 16px;
                    }

                    .mobile-nav-home {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: absolute !important;
                        left: 16px;
                    }

                    .mobile-bottom-nav {
                        display: flex;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        height: 80px;
                        background: var(--md-sys-color-surface-container);
                        border-top: 1px solid var(--md-sys-color-outline-variant);
                        align-items: center;
                        justify-content: space-evenly;
                        padding: 0 16px;
                        padding-bottom: env(safe-area-inset-bottom);
                        z-index: 1000;
                        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.25);
                    }

                    .mobile-notification-wrapper {
                        position: fixed;
                        top: 70px;
                        right: 0;
                        left: 0;
                        bottom: 80px;
                        z-index: 999;
                        background: rgba(0,0,0,0.5);
                    }

                    :global(.notification-dropdown) {
                        width: 90vw !important;
                        right: 5vw !important;
                        left: 5vw !important;
                        max-height: 70vh !important;
                    }
                }
            `}</style>
        </>
    );
}

function NavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    const pathname = usePathname();
    const isActive = href.startsWith('/#') 
        ? pathname === '/' 
        : pathname === href || (href !== '/' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={`nav-link ${isActive ? 'active' : ''}`}
        >
            {icon}
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{label}</span>
        </Link>
    );
}
