'use client';

import React, { useEffect, useState } from 'react';

interface SpookyTransitionProps {
    isActive: boolean;
    onComplete: () => void;
}

export default function SpookyTransition({ isActive, onComplete }: SpookyTransitionProps) {
    const [lightning, setLightning] = useState(false);

    useEffect(() => {
        if (isActive) {
            // Start the sequence
            const interval = setInterval(() => {
                // Random flashes
                if (Math.random() > 0.7) {
                    setLightning(true);
                    setTimeout(() => setLightning(false), 50 + Math.random() * 100);
                }
            }, 100);

            // Navigate after 2 seconds
            const timeout = setTimeout(() => {
                clearInterval(interval);
                onComplete();
            }, 2000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [isActive, onComplete]);

    if (!isActive) return null;

    return (
        <div className="spooky-overlay">
            <style jsx>{`
                .spooky-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 9999;
                    background-color: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    animation: flicker-bg 0.2s infinite;
                    overflow: hidden;
                }

                @keyframes flicker-bg {
                    0% { background-color: #1a0000; }
                    50% { background-color: #300000; }
                    100% { background-color: #000000; }
                }

                .lightning-flash {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(229, 9, 20, 0.4); /* Red tint */
                    mix-blend-mode: hard-light;
                    opacity: 0;
                    pointer-events: none;
                }
                
                .white-flash {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.05s;
                }

                .particle {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    animation: fall linear infinite;
                }

                @keyframes fall {
                    0% { transform: translateY(-10vh) translateX(0); opacity: 0; }
                    20% { opacity: 0.8; }
                    100% { transform: translateY(110vh) translateX(30px); opacity: 0; }
                }
            `}</style>

            <div
                className="lightning-flash"
                style={{ opacity: lightning ? 0.8 : 0 }}
            />
            <div
                className="white-flash"
                style={{ opacity: lightning && Math.random() > 0.8 ? 0.3 : 0 }}
            />

            {isActive && Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={i}
                    className="particle"
                    style={{
                        left: `${Math.random() * 100}vw`,
                        top: `${Math.random() * -20}vh`,
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        animationDuration: `${Math.random() * 1.5 + 0.5}s`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        backgroundColor: Math.random() > 0.6 ? '#E50914' : 'rgba(200, 200, 200, 0.6)',
                        boxShadow: Math.random() > 0.8 ? '0 0 5px #E50914' : 'none'
                    }}
                />
            ))}
        </div>
    );
}
