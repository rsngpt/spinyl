'use client';

import React, { useState, useEffect } from 'react';
import { VinylDisc, getVinylState } from './VinylRatingInput';

interface HeroVinylRatingProps {
    coverUrl: string | null;
    rating: number;
    size?: number; // Base size of the sleeve in pixels (e.g., 280)
}

export default function HeroVinylRating({ coverUrl, rating, size = 280 }: HeroVinylRatingProps) {
    const [slideOut, setSlideOut] = useState(false);
    const [currentRating, setCurrentRating] = useState(0.0);

    useEffect(() => {
        // Start slide-out animation slightly after component mounts
        const slideTimeout = setTimeout(() => {
            setSlideOut(true);
        }, 500);

        if (rating <= 0) {
            setCurrentRating(0.0);
            return () => clearTimeout(slideTimeout);
        }

        const duration = 1500; // 1.5 seconds
        const startTime = performance.now();
        let animationFrameId: number;

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing: easeOutCubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            setCurrentRating(parseFloat((easedProgress * rating).toFixed(1)));

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            clearTimeout(slideTimeout);
            cancelAnimationFrame(animationFrameId);
        };
    }, [rating]);

    const discState = getVinylState(currentRating);

    return (
        <div
            className="hero-vinyl-group"
            style={{
                position: 'relative',
                width: size,
                height: size,
                flexShrink: 0,
                marginRight: slideOut ? `${size * 0.55}px` : '0px',
                transition: 'margin-right 1.2s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
        >
            {/* The Vinyl Record (Peeking/Sliding Out) */}
            <div
                className="hero-vinyl-record-disc"
                style={{
                    position: 'absolute',
                    top: '0',
                    left: slideOut ? '55%' : '5%',
                    width: '100%',
                    height: '100%',
                    zIndex: 5,
                    animation: 'spin 12s linear infinite',
                    filter: 'drop-shadow(4px 6px 12px rgba(0,0,0,0.55))',
                    transition: 'left 1.2s cubic-bezier(0.25, 1, 0.5, 1), filter 0.5s ease'
                }}
            >
                <div style={{ width: '100%', height: '100%' }}>
                    <VinylDisc state={discState} value={currentRating} />
                </div>
            </div>

            {/* The Sleeve (Album Cover) */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '0',
                    overflow: 'hidden',
                    zIndex: 10,
                    boxShadow: '10px 0 30px rgba(0,0,0,0.6)',
                    background: '#121212',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transform: 'translateZ(0)' // Fix Safari clipping
                }}
            >
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt="Album Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #1c1a1a, #0a0909)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '40%',
                                height: '40%',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)'
                            }}
                        />
                    </div>
                )}

                {/* Glare Sheen Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(125deg, rgba(255,255,255,0.12) 0%, transparent 45%, rgba(0,0,0,0.2) 100%)',
                        pointerEvents: 'none'
                    }}
                />
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                /* Extra hover effect: expand disk further */
                .hero-vinyl-group:hover .hero-vinyl-record-disc {
                    left: 65% !important;
                    filter: drop-shadow(6px 12px 24px rgba(0,0,0,0.7)) !important;
                }
            `}</style>
        </div>
    );
}
