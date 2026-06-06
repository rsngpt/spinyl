'use client';

import React, { useState } from 'react';
import { Play, Music, MessageSquare } from 'lucide-react';
import HeroVinylRating from './HeroVinylRating';

interface CinematicHeroProps {
    album: any;
    youtubeId: string | null;
    averageRating: number;
    reviewsCount: number;
    genreList: string;
    releaseYear: number;
    user: any;
}

export default function CinematicHero({
    album,
    youtubeId,
    averageRating,
    reviewsCount,
    genreList,
    releaseYear,
    user
}: CinematicHeroProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [thumbnailError, setThumbnailError] = useState(false);

    const albumCover = album.images?.[0]?.url;
    
    // YouTube backdrop thumbnail URL (maxresdefault has best quality, hqdefault is fallback)
    const ytThumbnail = youtubeId
        ? (thumbnailError
            ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
            : `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`)
        : albumCover;

    const handlePlayClick = () => {
        if (youtubeId) {
            setIsPlaying(true);
        }
    };

    const handleWriteVerdict = () => {
        // Trigger review section toggle using search parameters
        const url = new URL(window.location.href);
        url.searchParams.set('writeReview', 'true');
        window.history.pushState({}, '', url.toString());
        
        // Dispatch a custom event to notify ReviewSection (fallback if query params don't trigger state update)
        window.dispatchEvent(new Event('writeReviewTriggered'));

        // Scroll to review section
        const element = document.getElementById('review-section-target');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', background: '#000' }}>
            {/* Cinematic Backdrop Video Section */}
            <div 
                className="cinematic-backdrop-container"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '56.25vw', // 16:9 Aspect Ratio
                    maxHeight: '600px',
                    minHeight: '320px',
                    overflow: 'hidden',
                    background: '#000'
                }}
            >
                {isPlaying && youtubeId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            zIndex: 1
                        }}
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                    />
                ) : (
                    <div 
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${ytThumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'brightness(0.65) contrast(1.05)',
                            transition: 'filter 0.5s ease',
                            zIndex: 1
                        }}
                        onError={() => setThumbnailError(true)}
                    >
                        {/* Play Button Overlay */}
                        {youtubeId && (
                            <button
                                onClick={handlePlayClick}
                                className="play-button-overlay"
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'rgba(0, 0, 0, 0.55)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    zIndex: 3,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                                }}
                            >
                                <Play size={32} fill="#fff" color="#fff" style={{ marginLeft: '6px' }} />
                            </button>
                        )}
                    </div>
                )}

                {/* Cinematic Ambient Blur & Gradient Fades */}
                <div 
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 40%, rgba(0, 0, 0, 0.8) 75%, var(--md-sys-color-background) 100%)',
                        pointerEvents: 'none',
                        zIndex: 2
                    }}
                />
            </div>

            {/* Overlapping Hero Album Info Row */}
            <div 
                className="hero-details-wrapper"
                style={{
                    maxWidth: '1200px',
                    margin: '-120px auto 0',
                    padding: '0 40px 40px',
                    position: 'relative',
                    zIndex: 12,
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '40px',
                    flexWrap: 'wrap'
                }}
            >
                {/* Album Cover holding the animating vinyl rating */}
                <HeroVinylRating coverUrl={albumCover} rating={averageRating} size={260} />

                {/* Right Parallel info block */}
                <div style={{ flex: 1, minWidth: '320px', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                            textTransform: 'uppercase',
                            letterSpacing: '3px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: 'var(--md-sys-color-primary)',
                            textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                        }}>
                            Album Review
                        </span>
                    </div>

                    <h1 
                        className="font-display" 
                        style={{
                            fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                            fontWeight: 900,
                            margin: '0 0 12px',
                            lineHeight: 1.05,
                            letterSpacing: '-0.03em',
                            textShadow: '0 4px 24px rgba(0,0,0,0.85)',
                            color: '#fff'
                        }}
                    >
                        {album.name}
                    </h1>

                    <p 
                        className="font-display" 
                        style={{ 
                            fontSize: '1.4rem', 
                            fontWeight: 700, 
                            margin: '0 0 20px', 
                            color: 'rgba(255,255,255,0.9)',
                            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                        }}
                    >
                        by {album.artists.map((a: any) => a.name).join(', ')}
                    </p>

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                        <span className="m3-badge" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
                            📅 {releaseYear}
                        </span>
                        <span className="m3-badge" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
                            🎵 {genreList}
                        </span>
                        <span className="m3-badge" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
                            💿 {album.total_tracks} tracks
                        </span>
                        {reviewsCount > 0 ? (
                            <span 
                                className="m3-badge-accent" 
                                style={{ 
                                    background: 'var(--md-sys-color-tertiary-container)',
                                    color: 'var(--md-sys-color-on-tertiary-container)',
                                    boxShadow: '0 4px 12px rgba(243, 120, 211, 0.25)' 
                                }}
                            >
                                ⭐ {averageRating.toFixed(1)}/10 average
                            </span>
                        ) : (
                            <span className="m3-badge" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                                ⭐ Unrated
                            </span>
                        )}
                        <span className="m3-badge" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                            💬 {reviewsCount} Reviews
                        </span>
                    </div>

                    {/* CTA Actions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {user ? (
                            <button
                                onClick={handleWriteVerdict}
                                style={{
                                    padding: '12px 28px',
                                    background: 'var(--md-sys-color-primary)',
                                    color: 'var(--md-sys-color-on-primary)',
                                    border: 'none',
                                    borderRadius: '30px',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 16px rgba(255,255,255,0.15)',
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                className="action-btn-glow"
                            >
                                <MessageSquare size={18} />
                                Write Verdict
                            </button>
                        ) : (
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', alignSelf: 'center' }}>
                                Log in to write a review
                            </span>
                        )}

                        <a
                            href={`https://open.spotify.com/album/${album.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '12px 28px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#fff',
                                borderRadius: '30px',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                textDecoration: 'none',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            className="spotify-link-btn"
                        >
                            <Music size={18} />
                            Play on Spotify
                        </a>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .action-btn-glow:hover {
                    transform: scale(1.03);
                    box-shadow: 0 6px 20px rgba(255,255,255,0.3) !important;
                }
                .spotify-link-btn:hover {
                    background: rgba(255,255,255,0.15) !important;
                    transform: scale(1.03);
                }
                .play-button-overlay:hover {
                    transform: translate(-50%, -50%) scale(1.08) !important;
                    background: rgba(255, 159, 104, 0.8) !important;
                    border-color: #ff9f68 !important;
                }
                
                @media (max-width: 768px) {
                    .hero-details-wrapper {
                        margin-top: -40px !important;
                        padding: 0 20px 24px !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        text-align: center !important;
                        gap: 24px !important;
                    }
                    .cinematic-backdrop-container {
                        height: 250px !important;
                        min-height: 200px !important;
                    }
                }
            `}</style>
        </div>
    );
}
