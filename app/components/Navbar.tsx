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

import { getBrowserClient } from '@/src/lib/supabase-client';
import { createClient } from '@supabase/supabase-js'; // DIRECT CLIENT IMPORT
import { signOutAction } from '@/app/auth/actions';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SpookyTransition from './SpookyTransition';
import NotificationDropdown from './NotificationDropdown';
import MobileSearch from './MobileSearch';
import DefaultAvatar from './DefaultAvatar';
import { Ghost, User } from 'lucide-react';

function HomeIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="M117-76v-545l363-273 363 272.67V-76H572v-332H388v332H117Z" />
        </svg>
    );
}

function FeedIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="m294.67-47.33 40-280H117.33L523-914h117.67l-40 320h262.66L410-47.33H294.67Z" />
        </svg>
    );
}

function ExploreIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="m192-59-72-72 360-810 360 810-72 72-288-123L192-59Z" />
        </svg>
    );
}

function SearchIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="M791-88 525.79-353.33q-29.46 21.66-68.46 34.33-39 12.67-85 12.67-117.04 0-197.85-80.87-80.81-80.87-80.81-196.67 0-115.8 80.87-196.46Q255.41-861 371.87-861q115.13 0 195.8 80.81 80.66 80.81 80.66 196.52 0 46.34-12.5 84-12.5 37.67-35.83 70l267 266L791-88ZM371.25-412.33q72.59 0 121.84-49.17 49.24-49.17 49.24-121.76 0-72.58-49.24-122.16Q443.84-755 371.25-755q-73.25 0-122.42 49.58-49.16 49.58-49.16 122.16 0 72.59 49.16 121.76 49.17 49.17 122.42 49.17Z" />
        </svg>
    );
}

function CreateIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="M425-310h110v-115h114v-110H535v-114H425v114H310v110h115v115ZM479 5-5-479l484-487 487 487L479 5Z" />
        </svg>
    );
}

function BellIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="M46-46v-868h868v708H206L46-46Zm194-354h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80Z"/>
        </svg>
    );
}

function LogOutIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="M86-86v-788h402v126H212v536h276v126H86Zm541-146-88-89 96-96H352v-126h283l-96-96 88-89 247 248-247 248Z"/>
        </svg>
    );
}

function LoginIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="M579-481q41-41 41-99t-41-99q-41-41-99-41t-99 41q-41 41-41 99t41 99q41 41 99 41t99-41ZM120-120v-720h720v720H120Zm80-80h560v-46q-54-53-125.5-83.5T480-360q-83 0-154.5 30.5T200-246v46Z" />
        </svg>
    );
}

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
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '19px',
                    color: '#ffffff',
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
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} style={{ textDecoration: 'none', display: 'flex' }} onClick={onClick}>
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
        setUser(initialUser);
    }, [initialUser]);

    useEffect(() => {
        setProfile(initialProfile);
    }, [initialProfile]);

    // Client-side page navigation indicator states
    const [isNavigating, setIsNavigating] = useState(false);
    const [transitionState, setTransitionState] = useState<'idle' | 'navigating' | 'fading'>('idle');
    const [targetPath, setTargetPath] = useState('');
    const navStartTimeRef = useRef<number>(0);

    // Gracefully end navigation with minimum display time
    const endNavigation = () => {
        const elapsed = Date.now() - navStartTimeRef.current;
        const minDisplayMs = 400; // Increased from 300 to 400ms (0.4s)

        const startFadeOut = () => {
            setTransitionState('fading');
            setTimeout(() => {
                setIsNavigating(false);
                setTransitionState('idle');
                setTargetPath('');
            }, 250); // 250ms fade out duration
        };

        if (elapsed >= minDisplayMs) {
            startFadeOut();
        } else {
            setTimeout(startFadeOut, minDisplayMs - elapsed);
        }
    };

    useEffect(() => {
        // When pathname matches targetPath (or is a subpath, except for root /), end the loading animation
        const cleanPath = pathname.split('#')[0];
        const isMatch = targetPath === '/'
            ? cleanPath === '/'
            : (cleanPath === targetPath || (targetPath && cleanPath.startsWith(targetPath + '/')));

        if (isNavigating && transitionState === 'navigating' && isMatch) {
            endNavigation();
        }
    }, [pathname, targetPath, isNavigating, transitionState]);

    // Safety timeout for loading bar (6 seconds)
    useEffect(() => {
        if (!isNavigating) return;
        const timer = setTimeout(() => {
            setIsNavigating(false);
            setTransitionState('idle');
            setTargetPath('');
        }, 6000);
        return () => clearTimeout(timer);
    }, [isNavigating]);

    const handleNavClick = (href: string) => {
        const cleanHref = href.split('#')[0];
        // If clicking same path or is onboarding/login, don't show loading bar
        if (cleanHref === pathname || cleanHref.startsWith('/#')) return;

        navStartTimeRef.current = Date.now();
        setIsNavigating(true);
        setTransitionState('navigating');
        setTargetPath(cleanHref);
    };

    // Global click listener to trigger loading bar for any internal links
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');
            
            if (anchor) {
                const href = anchor.getAttribute('href');
                const isExternal = anchor.getAttribute('target') === '_blank';
                // Check if it's an internal link and not same page/special links
                if (href && href.startsWith('/') && !href.startsWith('/#') && !isExternal) {
                    handleNavClick(href);
                }
            }
        };

        document.addEventListener('click', handleGlobalClick);
        return () => {
            document.removeEventListener('click', handleGlobalClick);
        };
    }, [pathname]);

    // Listener for programmatic routing transitions
    useEffect(() => {
        const handleNavStart = (e: Event) => {
            const customEvent = e as CustomEvent;
            const href = customEvent.detail?.href;
            if (href) {
                handleNavClick(href);
            }
        };

        window.addEventListener('spinyl:nav-start', handleNavStart);
        return () => {
            window.removeEventListener('spinyl:nav-start', handleNavStart);
        };
    }, [pathname]);

    useEffect(() => {
        setIsSpooky(false);
        // Clean up navigation on path change (only if not already managing via endNavigation)
        if (!isNavigating) {
            setTargetPath('');
            setTransitionState('idle');
        }
    }, [pathname, isNavigating]);

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

    const [supabase] = useState(() => getBrowserClient()!);

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

    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    try {
                        const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
                        if (urlEnv) {
                            const projectId = urlEnv.split('//')[1]?.split('.')[0];
                            if (projectId) {
                                const prefix = `sb-${projectId}`;
                                localStorage.removeItem(`${prefix}-auth-token`);
                                const cookies = document.cookie.split(';');
                                cookies.forEach(c => {
                                    const name = c.trim().split('=')[0];
                                    if (name && name.startsWith(prefix)) {
                                        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
                                        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
                                    }
                                });
                            }
                        }
                    } catch (e) {}
                    if (typeof window !== 'undefined' && window.location.pathname !== '/' && !window.location.pathname.startsWith('/login')) {
                        window.location.href = '/';
                    }
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
                    backgroundColor: '#000000',
                    zIndex: 1000,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '65px'
                }}
            >
                {transitionState !== 'idle' && (
                    <div
                        className="thin-loading-bar desktop-aura-light"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, rgb(255,1,35) 0%, rgb(254,179,31) 33%, rgb(2,145,255) 66%, rgb(255,1,35) 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'thin-wave 1.5s linear infinite',
                            zIndex: 1001,
                            boxShadow: '0 1px 6px rgba(255, 159, 104, 0.2)',
                            opacity: transitionState === 'fading' ? 0 : 1,
                            transition: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                            pointerEvents: 'none'
                        }}
                    />
                )}
                <div
                    className="nav-content-inner"
                    style={{
                        width: '100%',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: '100%',
                        position: 'relative'
                    }}
                >


                {/* Mobile Centered Logo (hidden on desktop) */}
                <div className="mobile-nav-logo">
                    <Link
                        href="/"
                        onClick={(e) => {
                            if (pathname === '/') {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                                handleNavClick('/');
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

                {/* Desktop Left Group: Logo */}
                <div className="nav-left-section">
                    <Link
                        href="/"
                        onClick={() => handleNavClick('/')}
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    >
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
                </div>

                {/* Desktop Right Group: Navigation links + Divider + Actions + Profile */}
                <div className="nav-right-section">
                    <div className="desktop-only-links">
                        <NavLink href="/#hero" icon={<HomeIcon size={24} />} label="Home" onClick={() => handleNavClick('/#hero')} />
                        <NavLink href="/feed" icon={<FeedIcon size={24} />} label="Feed" onClick={() => handleNavClick('/feed')} />
                        <NavLink href="/explore" icon={<ExploreIcon size={24} />} label="Explore" onClick={() => handleNavClick('/explore')} />
                        <NavLink href="/search" icon={<SearchIcon size={24} />} label="Search" onClick={() => handleNavClick('/search')} />
                    </div>



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
                                        <BellIcon size={24} />
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
                                    onClick={() => handleNavClick(`/profile/${user.id}`)}
                                    className={`nav-profile-link ${pathname.startsWith('/profile') ? 'active' : ''}`}
                                >
                                    <div className="nav-avatar-container">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="nav-avatar-img" />
                                        ) : (
                                            <DefaultAvatar fill="currentColor" />
                                        )}
                                    </div>
                                </Link>

                                {/* Log Out Icon Button */}
                                <button
                                    onClick={async () => {
                                        // Update state instantly so UI responds immediately
                                        setUser(null);
                                        setProfile(null);
                                        
                                        // Perform client-side signOut immediately
                                        try {
                                            supabase.auth.signOut();
                                        } catch (err) {
                                            console.error('Error during client signOut:', err);
                                        }

                                        // Call Server Action to clear cookies on the server
                                        try {
                                            await signOutAction();
                                        } catch (err) {
                                            console.error('Error during server signOut:', err);
                                        }
                                        
                                        try {
                                            const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
                                            if (urlEnv) {
                                                const projectId = urlEnv.split('//')[1]?.split('.')[0];
                                                if (projectId) {
                                                    const prefix = `sb-${projectId}`;
                                                    localStorage.removeItem(`${prefix}-auth-token`);
                                                    
                                                    // Clear notifications cache
                                                    for (let i = 0; i < localStorage.length; i++) {
                                                        const key = localStorage.key(i);
                                                        if (key && (key.startsWith('notifications_') || key.startsWith('lastReadTime_'))) {
                                                            localStorage.removeItem(key);
                                                        }
                                                    }

                                                    const cookiesList = document.cookie.split(';');
                                                    cookiesList.forEach(c => {
                                                        const name = c.trim().split('=')[0];
                                                        if (name && name.startsWith(prefix)) {
                                                            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
                                                            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
                                                        }
                                                    });
                                                }
                                            }
                                        } catch (e) {}
                                        window.location.href = '/';
                                    }}
                                    className="nav-action-btn logout-btn"
                                    title="Log Out"
                                >
                                    <LogOutIcon size={24} />
                                </button>
                            </>
                        ) : (
                            <NavLink href="/login" icon={<LoginIcon size={24} />} label="Log In" onClick={() => handleNavClick('/login')} />
                        )}
                    </div>
                </div>

                {/* Mobile Top Left: Notification Bell */}
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
                        <BellIcon size={24} />
                        {hasUnread && (
                            <span className="notification-dot" />
                        )}
                    </div>
                )}

                {/* Mobile Top Right: Logout / Login */}
                {user && (
                    <div
                        className="mobile-nav-logout"
                        onClick={async () => {
                            setUser(null);
                            setProfile(null);
                            try { supabase.auth.signOut(); } catch (err) {}
                            try { await signOutAction(); } catch (err) {}
                            try {
                                const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
                                if (urlEnv) {
                                    const projectId = urlEnv.split('//')[1]?.split('.')[0];
                                    if (projectId) {
                                        const prefix = `sb-${projectId}`;
                                        localStorage.removeItem(`${prefix}-auth-token`);
                                        for (let i = 0; i < localStorage.length; i++) {
                                            const key = localStorage.key(i);
                                            if (key && (key.startsWith('notifications_') || key.startsWith('lastReadTime_'))) {
                                                localStorage.removeItem(key);
                                            }
                                        }
                                        const cookiesList = document.cookie.split(';');
                                        cookiesList.forEach(c => {
                                            const name = c.trim().split('=')[0];
                                            if (name && name.startsWith(prefix)) {
                                                document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
                                                document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
                                            }
                                        });
                                    }
                                }
                            } catch (e) {}
                            window.location.href = '/';
                        }}
                    >
                        <LogOutIcon size={24} />
                    </div>
                )}
                </div>
            </nav>

            {/* Mobile Bottom Control Panel */}
            <div className="mobile-bottom-nav">
                {transitionState !== 'idle' && (
                    <div
                        className="thin-loading-bar"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, rgb(255,1,35) 0%, rgb(254,179,31) 33%, rgb(2,145,255) 66%, rgb(255,1,35) 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'thin-wave 1.5s linear infinite',
                            zIndex: 10000,
                            boxShadow: '0 -1px 6px rgba(255, 159, 104, 0.2)',
                            opacity: transitionState === 'fading' ? 0 : 1,
                            transition: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                            pointerEvents: 'none'
                        }}
                    />
                )}
                <div className="mobile-bottom-nav-inner">
                    <MobileNavItem
                        href="/"
                        title="Home"
                        icon={<HomeIcon size={24} />}
                        isActive={pathname === '/'}
                        onClick={() => {
                            if (pathname === '/') {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                                handleNavClick('/');
                            }
                        }}
                    />

                    <MobileNavItem
                        href="/feed"
                        title="Feed"
                        icon={<FeedIcon size={24} />}
                        isActive={pathname === '/feed'}
                        onClick={() => handleNavClick('/feed')}
                    />

                    <MobileNavItem
                        onClick={() => setIsMobileSearchOpen(true)}
                        title="Search"
                        icon={<SearchIcon size={24} />}
                        isActive={isMobileSearchOpen || pathname === '/search'}
                    />

                    {user ? (
                        <MobileNavItem
                            href={`/profile/${user.id}`}
                            title="Profile"
                            icon={
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: pathname.startsWith('/profile') ? '#ffffff' : 'rgba(255, 255, 255, 0.2)', 
                                    overflow: 'hidden',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: pathname.startsWith('/profile') ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.25)',
                                    transition: 'all 0.25s ease'
                                }}>
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <DefaultAvatar fill={pathname.startsWith('/profile') ? '#000' : '#fff'} />
                                    )}
                                </div>
                            }
                            isActive={pathname.startsWith('/profile')}
                            onClick={() => handleNavClick(`/profile/${user.id}`)}
                        />
                    ) : (
                        <MobileNavItem
                            href="/login"
                            title="Login"
                            icon={<LoginIcon size={24} />}
                            isActive={pathname === '/login'}
                            onClick={() => handleNavClick('/login')}
                        />
                    )}
                </div>
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

            {/* Content mask: hides page while spectrum bar is active */}
            {/* Content mask: hides page while spectrum bar is active */}
            {transitionState !== 'idle' && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#000000',
                        zIndex: 999,
                        pointerEvents: 'none',
                        opacity: transitionState === 'fading' ? 0 : 1,
                        transition: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                />
            )}

            <style jsx>{`
                @keyframes thin-wave {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }

                .desktop-aura-light {
                    display: block;
                }

                @media (max-width: 768px) {
                    .desktop-aura-light {
                        display: none;
                    }
                }

                .nav-left-section {
                    display: flex;
                    align-items: center;
                }

                .desktop-only-links {
                    display: flex;
                    align-items: center;
                    gap: 20px;
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
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .nav-action-btn:hover {
                    color: #fff;
                }

                .nav-action-btn:active {
                    transform: scale(0.95);
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
                }

                /* User Profile Circular Button */
                :global(.nav-profile-link) {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: transparent;
                    border: none;
                    text-decoration: none;
                    color: rgba(255, 255, 255, 0.8);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                :global(.nav-profile-link:hover) {
                    color: #fff;
                }

                :global(.nav-profile-link.active) {
                    background: transparent;
                }

                :global(.nav-profile-link.active) .nav-avatar-container {
                    border-color: #fff;
                }

                .nav-avatar-container {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--md-sys-color-primary-container);
                    color: var(--md-sys-color-on-primary-container);
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255,255,255,0.1);
                    font-weight: 700;
                    font-size: 0.7rem;
                }

                .nav-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
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

                /* Navigation link icons */
                :global(.navbar-simple-link) {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 38px;
                    width: 38px;
                    color: #ffffff;
                    text-decoration: none;
                    transition: color 0.2s ease;
                    cursor: pointer;
                }

                :global(.navbar-simple-link:hover) {
                    color: #fff !important;
                }

                :global(.navbar-simple-link.active) {
                    color: #fff !important;
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

                .mobile-nav-bell, .mobile-nav-logout {
                    display: none;
                    cursor: pointer;
                    position: relative;
                    padding: 8px;
                    color: #ffffff;
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
                        background-color: #000000 !important;
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
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
                        left: 16px;
                    }

                    .mobile-nav-logout {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: absolute !important;
                        right: 16px;
                    }



                    .mobile-bottom-nav {
                        display: flex;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        height: 65px;
                        background: #000000;
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                        border-top: 1px solid var(--md-sys-color-outline-variant);
                        align-items: center;
                        justify-content: center;
                        padding: 0px !important;
                        margin: 0px !important;
                        z-index: 9999;
                        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.25);
                    }

                    .mobile-bottom-nav-inner {
                        width: 100%;
                        max-width: 1200px;
                        padding: 0 24px;
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                        justify-content: space-evenly;
                        height: 100%;
                    }

                    .mobile-notification-wrapper {
                        position: fixed;
                        top: 64px;
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

function NavLink({ href, icon, label, onClick }: { href: string, icon: React.ReactNode, label: string, onClick?: () => void }) {
    const pathname = usePathname();
    const isActive = href.startsWith('/#')
        ? pathname === '/'
        : pathname === href || (href !== '/' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            onClick={onClick}
            title={label}
            className={`navbar-simple-link ${isActive ? 'active' : ''}`}
            style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {icon}
        </Link>
    );
}
