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
    // Responsive Sizing: Use percentages so external CSS width overrides work

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                width: size,
                height: size,
                flexShrink: 0
            }}>
            {/* The Vinyl Record (Peeking Out) */}
            <div style={{
                position: 'absolute',
                top: '2.5%', // (100% - 95%) / 2
                left: '50%', // Peeking out half-way
                width: '95%',
                height: '95%',
                zIndex: 5,
                animation: 'spin 10s linear infinite',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
            }}>
                <VinylRatingInput value={rating} onChange={() => { }} readonly />
            </div>

            {/* The Sleeve (Album Cover) */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '2px',
                overflow: 'hidden',
                zIndex: 10,
                boxShadow: '4px 0 10px rgba(0,0,0,0.6)',
                background: '#222'
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
                        background: 'linear-gradient(135deg, #444, #222)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                )}

                {/* Glare/Sheen Overlay for realism */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.1) 0%, transparent 40%)',
                    pointerEvents: 'none'
                }} />
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
