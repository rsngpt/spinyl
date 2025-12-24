'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginSuccessToast() {
    const [show, setShow] = useState(false);
    // useSearchParams is safe to use in Client Components wrapped in Suspense, 
    // or we can use window.location if we want to avoid the de-opt boundary issues in simple apps

    useEffect(() => {
        // Simple window check to avoid Next.js Suspense wrapper requirement for now
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('login_success') === 'true') {
                setShow(true);
                // Clean URL without refresh
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);

                const timer = setTimeout(() => setShow(false), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '100px',
            right: '24px',
            background: '#1ed760',
            color: '#000',
            padding: '12px 24px',
            borderRadius: '50px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontWeight: 700,
            zIndex: 2000,
            animation: 'slideIn 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem'
        }}>
            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
            <span>🎉</span> Successfully Logged In
        </div>
    );
}
