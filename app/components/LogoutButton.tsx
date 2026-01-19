'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOutAction } from '@/app/auth/actions';

export default function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        try {
            console.log('Logging out via Server Action...');
            setIsLoading(true);

            // Call Server Action
            // This will handle the cookies cleanup and redirect
            await signOutAction();

        } catch (error) {
            console.error('Logout error:', error);
            // If it's a redirect error, it's expected behavior in server actions
            // but we can try to force navigation just in case
        } finally {
            // Usually we don't need to do anything here because of redirect
            // But if it fails, we assume we might still be on the page
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
