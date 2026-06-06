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
import { Ghost, User, Settings, Edit2, LogOut } from 'lucide-react';

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
            <path d="M480-300q75 0 127.5-52.5T660-480q0-75-52.5-127.5T480-660q-75 0-127.5 52.5T300-480q0 75 52.5 127.5T480-300Zm-28.5-151.5Q440-463 440-480t11.5-28.5Q463-520 480-520t28.5 11.5Q520-497 520-480t-11.5 28.5Q497-440 480-440t-28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
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
            <path d="M120-120v-240h320v240H120Zm400 0v-400h320v400H520ZM360-280Zm240-160Zm-480 0v-400h320v400H120Zm240-80Zm160-80v-240h320v240H520Zm80-80ZM200-200h160v-80H200v80Zm400 0h160v-240H600v240ZM200-520h160v-240H200v240Zm400-160h160v-80H600v80Z" />
        </svg>
    );
}

function ShelfIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="M120-120v-720h720v720H120Zm80-80h560v-120H200v120Zm460-200h100v-360H660v360Zm-460 0h100v-360H200v360Zm180 0h200v-360H380v360Z" />
        </svg>
    );
}

function BoilerRoomIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="M240-400q0 52 21 98.5t60 81.5q-1-5-1-9v-9q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60v9q0 4-1 9 39-35 60-81.5t21-98.5q0-50-18.5-94.5T648-574q-20 13-42 19.5t-45 6.5q-62 0-107.5-41T401-690q-39 33-69 68.5t-50.5 72Q261-513 250.5-475T240-400Zm240 52-57 56q-11 11-17 25t-6 29q0 32 23.5 55t56.5 23q33 0 56.5-23t23.5-55q0-16-6-29.5T537-292l-57-56Zm0-492v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-129 86.5-245T480-840Z" />
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
            <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-88h120v88q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
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
    const [showProfileMenu, setShowProfileMenu] = useState(false);
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
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    zIndex: 1000,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
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
                        <NavLink href="/boiler-room" icon={<BoilerRoomIcon size={24} />} label="Boiler Room" onClick={() => handleNavClick('/boiler-room')} />
                        <NavLink href="/shelf" icon={<ShelfIcon size={24} />} label="Shelf" onClick={() => handleNavClick('/shelf')} />
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
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className={`nav-profile-link-btn ${pathname.startsWith('/profile') ? 'active' : ''}`}
                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', outline: 'none' }}
                                        title="User Profile Menu"
                                    >
                                        <div className="nav-avatar-container">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Profile" className="nav-avatar-img" />
                                            ) : (
                                                <DefaultAvatar fill="currentColor" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Dropdown Popup Menu */}
                                    <AnimatePresence>
                                        {showProfileMenu && (
                                            <>
                                                {/* Backdrop to close on click outside */}
                                                <div
                                                    style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                                                    onClick={() => setShowProfileMenu(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        right: 0,
                                                        width: '220px',
                                                        background: 'rgba(0, 0, 0, 0.55)',
                                                        backdropFilter: 'blur(30px)',
                                                        WebkitBackdropFilter: 'blur(30px)',
                                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                                                        padding: '8px',
                                                        zIndex: 999,
                                                        marginTop: '20px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <Link 
                                                        href={`/profile/${user.id}`}
                                                        onClick={() => {
                                                            setShowProfileMenu(false);
                                                            handleNavClick(`/profile/${user.id}`);
                                                        }}
                                                        className="profile-menu-item"
                                                    >
                                                        <User size={18} />
                                                        <span>My Profile</span>
                                                    </Link>


                                                    <Link 
                                                        href="/settings"
                                                        onClick={() => {
                                                            setShowProfileMenu(false);
                                                            handleNavClick('/settings');
                                                        }}
                                                        className="profile-menu-item"
                                                    >
                                                        <Settings size={18} />
                                                        <span>Settings</span>
                                                    </Link>

                                                    <button 
                                                        onClick={async () => {
                                                            setShowProfileMenu(false);
                                                            setUser(null);
                                                            setProfile(null);
                                                            
                                                            try {
                                                                supabase.auth.signOut();
                                                            } catch (err) {
                                                                console.error('Error during client signOut:', err);
                                                            }

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
                                                        className="profile-menu-item logout-item"
                                                    >
                                                        <LogOut size={18} />
                                                        <span>Logout</span>
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
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
                        href="/boiler-room"
                        title="Boiler Room"
                        icon={<BoilerRoomIcon size={24} />}
                        isActive={pathname === '/boiler-room'}
                        onClick={() => handleNavClick('/boiler-room')}
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
                    border: 1px solid transparent;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .nav-action-btn:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.05);
                    transform: scale(1.05) translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
                :global(.nav-profile-link),
                :global(.nav-profile-link-btn) {
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

                :global(.nav-profile-link:hover),
                :global(.nav-profile-link-btn:hover) {
                    color: #fff;
                }

                :global(.nav-profile-link.active) .nav-avatar-container,
                :global(.nav-profile-link-btn.active) .nav-avatar-container {
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

                /* Profile Dropdown Menu styling */
                :global(.profile-menu-item) {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 6px;
                    color: rgba(255, 255, 255, 0.8) !important;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    border: none;
                    background: transparent;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    font-family: inherit;
                }

                :global(.profile-menu-item:hover) {
                    background: rgba(255, 255, 255, 0.08);
                    color: #ffffff !important;
                    transform: translateX(4px);
                }

                :global(.profile-menu-item.logout-item) {
                    background: transparent;
                    color: rgba(255, 255, 255, 0.8) !important;
                    margin-top: 6px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    padding-top: 12px;
                    border-radius: 0;
                }

                :global(.profile-menu-item.logout-item:hover) {
                    background: rgba(255, 68, 68, 0.08);
                    color: #ff4d4d !important;
                    transform: translateX(4px);
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

                :global(.navbar-simple-link) {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 38px;
                    width: 38px;
                    border-radius: 50%;
                    color: rgba(255, 255, 255, 0.6) !important;
                    text-decoration: none;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    background: transparent;
                    border: 1px solid transparent;
                }

                :global(.navbar-simple-link:hover) {
                    color: #fff !important;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.05);
                    transform: scale(1.05) translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                :global(.navbar-simple-link.active) {
                    color: var(--md-sys-color-primary) !important;
                    background: rgba(255, 159, 104, 0.08);
                    border-color: rgba(255, 159, 104, 0.15);
                    box-shadow: 0 4px 15px rgba(255, 159, 104, 0.08);
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
