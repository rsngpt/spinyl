'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import VinylRatingInput from './VinylRatingInput';

interface InstagramStoryCardProps {
    albumName: string;
    artistName: string;
    coverUrl: string;
    rating: number;
    reviewText: string;
    username: string;
    userAvatar?: string | null;
}



// Fixed resolution for IG Stories: 1080 x 1920
const InstagramStoryCard = forwardRef<HTMLDivElement, InstagramStoryCardProps>(({
    albumName,
    artistName,
    coverUrl,
    rating,
    reviewText,
    username,
    userAvatar
}, ref) => {

    // Helper for initials if avatar is missing
    const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

    // State for the pre-blurred background image
    const [blurredBackground, setBlurredBackground] = useState<string>(coverUrl);

    // Effect to "bake" the blur into a static image
    useEffect(() => {
        if (!coverUrl) return;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = coverUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Low res canvas for performance and smoother blur
                canvas.width = 100;
                canvas.height = 100;

                // Draw simply scaled down (linear interpolation does some blur)
                // Then apply a strong canvas filter
                ctx.filter = 'blur(4px)'; // 4px at 100px size is huge relative blur
                ctx.drawImage(img, 0, 0, 100, 100);

                // Overlay a dark tint directly on the canvas to ensure brightness control
                ctx.fillStyle = 'rgba(0,0,0,0.4)'; // 40% dark overlay
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                setBlurredBackground(canvas.toDataURL());
            }
        };
    }, [coverUrl]);

    return (
        <div
            ref={ref}
            style={{
                width: '1080px',
                height: '1920px',
                background: '#111',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'var(--font-geist-sans), sans-serif'
            }}
        >
            {/* Background Layer: Pre-baked Blurred Image */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                overflow: 'hidden',
                background: '#000'
            }}>
                <img
                    src={blurredBackground}
                    alt=""
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        // No logic filters here, just simple rendering
                        transform: 'scale(1.1)'
                    }}
                    crossOrigin="anonymous"
                />
            </div>

            {/* Texture Overlay (Optional for premium feel) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                zIndex: 1,
                pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />

            {/* Main Content Container */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '120px 80px', // Safe area padding
                color: '#fff'
            }}>

                {/* 1. TOP SECTION: Album Art + Sliding Vinyl */}
                {/* This mimics the profile style but scaled up massively */}
                <div style={{
                    position: 'relative',
                    width: '600px',
                    height: '600px', // Base size for the album cover
                    marginBottom: '80px',
                    marginTop: '100px',
                    transform: 'translateX(-115px)' // Shift left to center the visual group (Album + Vinyl)
                }}>
                    {/* The Vinyl Record (Sliding out to the right) */}
                    {/* Positioned relative to the container. 
                        In profile: cover is 60px, vinyl is left:28px (approx 50% overlap).
                        Here: width 600px. Vinyl should be ~560px.
                        Left offset should be around 280px to peek out.
                    */}
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '250px', // Slide out amount
                        width: '580px',
                        height: '580px',
                        zIndex: 1,
                        animation: 'spin 10s linear infinite',
                        filter: 'drop-shadow(10px 0 20px rgba(0,0,0,0.6))'
                    }}>
                        <VinylRatingInput value={rating} onChange={() => { }} readonly />
                    </div>

                    {/* The Album Cover */}
                    <div style={{
                        position: 'relative',
                        width: '600px',
                        height: '600px',
                        zIndex: 10,
                        borderRadius: '12px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                        background: '#222',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={coverUrl}
                            alt={albumName}
                            crossOrigin="anonymous" // Crucial for html2canvas
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {/* Gloss Effect */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                            pointerEvents: 'none'
                        }} />
                    </div>
                </div>

                {/* 2. MIDDLE SECTION: User Info */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    marginBottom: '60px'
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        background: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt={username}
                                crossOrigin="anonymous"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{
                                width: '100%', height: '100%',
                                background: 'linear-gradient(135deg, #FF0080, #7928CA)',
                                color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '3rem', fontWeight: 800
                            }}>
                                {getInitials(username)}
                            </div>
                        )}
                    </div>

                    {/* Username & Album Info */}
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>@{username}</h2>
                        <div style={{ marginTop: '16px', opacity: 0.9 }}>
                            <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{albumName}</p>
                            <p style={{ fontSize: '1.2rem', opacity: 0.8, margin: 0 }}>{artistName}</p>
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM SECTION: Review Text */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <p style={{
                        fontSize: '3rem', // Increased from 2rem
                        lineHeight: '1.4',
                        textAlign: 'center',
                        fontFamily: 'serif',
                        fontStyle: 'italic',
                        maxWidth: '90%',
                        margin: 0,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 7, // Slightly reduced clamp to fit larger text
                        WebkitBoxOrient: 'vertical',
                    }}>
                        "{reviewText}"
                    </p>
                </div>

                {/* 4. FOOTER: Branding */}
                <div style={{
                    marginTop: 'auto',
                    paddingTop: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    opacity: 0.8
                }}>
                    <span style={{ fontSize: '1.2rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Review it on</span>
                    {/* Spinyl Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img
                            src="/spinyl-logo-white.png"
                            alt="Spinyl"
                            style={{ height: '60px', width: 'auto' }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
});

InstagramStoryCard.displayName = 'InstagramStoryCard';

export default InstagramStoryCard;
