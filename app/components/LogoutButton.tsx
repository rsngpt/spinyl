'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOutAction } from '@/app/auth/actions';
import { getBrowserClient } from '@/src/lib/supabase-client';

export default function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        try {
            console.log('Logging out via Server Action...');
            setIsLoading(true);

            // Trigger client-side signout instantly to update the Navbar state via onAuthStateChange
            try {
                const supabase = getBrowserClient()!;
                supabase.auth.signOut();
            } catch (err) {
                console.error('Client-side signOut error:', err);
            }

            // Call Server Action to delete cookies on the server
            await signOutAction();

            // Clean up client-side localStorage/cookies for safety
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
            } catch (e) {
                console.error('Client storage cleanup error:', e);
            }

            // Force a hard redirect to the homepage to trigger the loader mount
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    };

    return (
        <div style={{ padding: '0 24px 40px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 9999 }}>
            <button
                onClick={handleLogout}
                disabled={isLoading}
                style={{
                    padding: '12px 32px',
                    borderRadius: '30px',
                    border: '1px solid #333',
                    background: isLoading ? '#222' : 'transparent',
                    color: isLoading ? '#666' : '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    maxWidth: '400px',
                    opacity: isLoading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                    if (!isLoading) {
                        e.currentTarget.style.borderColor = 'red';
                        e.currentTarget.style.color = 'red';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isLoading) {
                        e.currentTarget.style.borderColor = '#333';
                        e.currentTarget.style.color = '#fff';
                    }
                }}
            >
                {isLoading ? 'Logging Out...' : 'Log Out'}
            </button>
        </div>
    );
}
