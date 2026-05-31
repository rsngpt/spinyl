'use client';

import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';

interface ClientLoadingWrapperProps {
    children: React.ReactNode;
}

export default function ClientLoadingWrapper({ children }: { children: React.ReactNode }) {
    const [showLoading, setShowLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    useEffect(() => {
        // Start loader fadeout and content fadein after the wave completes (2.2s)
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
            setContentVisible(true);
            if (typeof window !== 'undefined') {
                (window as any).__spinyl_hydrated = true;
            }
        }, 2200);

        // Remove loading overlay from DOM after transitions finish
        const removeTimer = setTimeout(() => {
            setShowLoading(false);
        }, 2600); 

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    return (
        <>
            {showLoading && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    transition: 'opacity 0.4s ease',
                    opacity: fadeOut ? 0 : 1,
                    pointerEvents: 'none'
                }}>
                    <LoadingScreen />
                </div>
            )}
            <div style={{
                transition: 'opacity 0.5s ease-out',
                opacity: contentVisible ? 1 : 0,
                visibility: contentVisible ? 'visible' : 'hidden',
                height: contentVisible ? 'auto' : '100vh',
                overflow: contentVisible ? 'visible' : 'hidden'
            }}>
                {children}
            </div>
        </>
    );
}
