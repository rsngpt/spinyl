'use client';

import React from 'react';
import VinylRatingInput from './VinylRatingInput';

interface VinylRecordDisplayProps {
    coverUrl: string | null;
    rating: number;
    size?: number; // Base size of the sleeve (e.g., 80px)
    className?: string; // Allow external styling overrides
}

export default function VinylRecordDisplay({ coverUrl, rating, size = 80, className = '' }: VinylRecordDisplayProps) {
    return (
        <div
            className={`vinyl-group ${className}`}
            style={{
                position: 'relative',
                width: size,
                height: size,
                flexShrink: 0
            }}>
            {/* The Vinyl Record (Peeking Out) */}
            <div 
                className="vinyl-record-disc"
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '55%',
                    width: '100%',
                    height: '100%',
                    zIndex: 5,
                    animation: 'spin 12s linear infinite',
                    filter: 'drop-shadow(2px 3px 6px rgba(0,0,0,0.45))',
                    transition: 'left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.5s ease'
                }}>
                <VinylRatingInput value={rating} onChange={() => { }} readonly />
            </div>

            {/* The Sleeve (Album Cover) */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '0',
                overflow: 'hidden',
                zIndex: 10,
                boxShadow: '8px 0 20px rgba(0,0,0,0.5)',
                background: '#221b19',
                border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt="Album Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(135deg, #332a26, #1c1614)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                )}

                {/* Glare/Sheen Overlay for realism */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.15) 0%, transparent 45%)',
                    pointerEvents: 'none'
                }} />
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                /* Hover expansion rules for the disc */
                .vinyl-group:hover .vinyl-record-disc {
                    left: 65% !important;
                    filter: drop-shadow(4px 8px 16px rgba(0,0,0,0.6)) !important;
                }
            `}</style>
        </div>
    );
}

