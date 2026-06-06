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
    const [thumbnailError, setThumbnailError] = useState(false);

    const albumCover = album.images?.[0]?.url;
    
    // YouTube backdrop thumbnail URL (maxresdefault has best quality, hqdefault is fallback)
    const ytThumbnail = youtubeId
        ? (thumbnailError
            ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
            : `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`)
        : albumCover;

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

    const backdropContent = (
        <>
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
            />
            
            {/* Play Button Overlay - just the play icon, no circular background */}
            {youtubeId && (
                <div
                    className="play-button-overlay"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.75))',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                >
                    <Play size={64} fill="#fff" color="#fff" />
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
        </>
    );

    return (
        <div style={{ position: 'relative', width: '100%', background: '#000' }}>
            {/* Cinematic Backdrop Section */}
            {youtubeId ? (
                <a 
                    href={`https://www.youtube.com/watch?v=${youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cinematic-backdrop-container"
                    style={{
                        display: 'block',
                        position: 'relative',
                        width: '100%',
                        height: '56.25vw', // 16:9 Aspect Ratio
                        maxHeight: '600px',
                        minHeight: '320px',
                        overflow: 'hidden',
                        background: '#000'
                    }}
                >
                    {backdropContent}
                </a>
            ) : (
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
                    {backdropContent}
                </div>
            )}

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
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '24px'
                }}
            >
                <div className="hero-main-content" style={{ display: 'flex', alignItems: 'center', gap: '40px', width: '100%' }}>
                    {/* Album Cover holding the animating vinyl rating */}
                    <HeroVinylRating coverUrl={albumCover} rating={averageRating} size={260} />

                    {/* Right Parallel info block */}
                    <div className="hero-info-block" style={{ flex: 1, minWidth: 0 }}>
                        {/* Desktop-only Title & Subtitles */}
                        <div className="desktop-only-info">
                            <h1 
                                className="font-display" 
                                style={{
                                    fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                                    fontWeight: 900,
                                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                    margin: '0 0 12px',
                                    lineHeight: 1.05,
                                    letterSpacing: '-0.03em',
                                    textShadow: '0 4px 24px rgba(0,0,0,0.85)',
                                    color: '#fff',
                                    fontStyle: 'italic'
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
                            </div>
                        </div>

                        {/* Mobile-only Title, Subtitles, and Metadata Section */}
                        <div className="mobile-only-info" style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px',
                            width: '100%', 
                            flex: 1, 
                            minWidth: 0, 
                            textAlign: 'left'
                        }}>
                            <h1 
                                className="font-display" 
                                style={{
                                    fontSize: '1.65rem',
                                    fontWeight: 900,
                                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                    margin: '0',
                                    lineHeight: 1.15,
                                    color: '#fff',
                                    fontStyle: 'italic',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                                }}
                            >
                                {album.name}
                            </h1>

                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '4px',
                                marginTop: '4px',
                                fontSize: '0.8rem', 
                                color: 'rgba(255,255,255,0.75)', 
                                lineHeight: 1.25 
                            }}>
                                <div>
                                    <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Artists:</span>{' '}
                                    <span style={{ fontWeight: 600, color: '#fff' }}>{album.artists.map((a: any) => a.name).join(', ')}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Genre:</span>{' '}
                                    <span style={{ fontWeight: 600, color: '#fff' }}>{genreList}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Year:</span>{' '}
                                    <span style={{ fontWeight: 600, color: '#fff' }}>{releaseYear}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Tracks:</span>{' '}
                                    <span style={{ fontWeight: 600, color: '#fff' }}>{album.total_tracks}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style jsx global>{`
                .play-button-overlay:hover {
                    transform: translate(-50%, -50%) scale(1.08) !important;
                    background: rgba(255, 159, 104, 0.8) !important;
                    border-color: #ff9f68 !important;
                }

                /* Mobile-specific and Desktop-specific display rules */
                .mobile-only-info {
                    display: none !important;
                }

                .hero-details-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-top: 12px;
                    text-align: left;
                }
                .grid-item {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .grid-label {
                    font-size: 0.65rem;
                    color: rgba(255, 255, 255, 0.45);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 700;
                }
                .grid-value {
                    font-size: 0.8rem;
                    color: #fff;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                @media (max-width: 768px) {
                    .hero-details-wrapper {
                        margin-top: -60px !important;
                        padding: 0 24px 32px !important;
                        gap: 16px !important;
                    }
                    .hero-main-content {
                        gap: 16px !important;
                        justify-content: center !important;
                        align-items: center !important;
                        --hero-vinyl-size: 145px !important;
                    }
                    .hero-info-block {
                        flex: 0 1 180px !important;
                        align-self: center !important;
                    }
                    .cinematic-backdrop-container {
                        height: 75vw !important;
                        min-height: auto !important;
                        max-height: 75vw !important;
                    }
                    .play-button-overlay {
                        width: 56px !important;
                        height: 56px !important;
                    }
                    .play-button-overlay svg {
                        width: 24px !important;
                        height: 24px !important;
                    }
                    
                    /* Hide desktop items, show mobile items */
                    .desktop-only-info {
                        display: none !important;
                    }
                    .mobile-only-info {
                        display: flex !important;
                    }
                }
                @media (max-width: 480px) {
                    .hero-details-wrapper {
                        padding: 0 16px 24px !important;
                    }
                    .hero-main-content {
                        gap: 12px !important;
                        --hero-vinyl-size: 130px !important;
                    }
                    .hero-info-block {
                        flex: 0 1 160px !important;
                        align-self: center !important;
                    }
                }
            `}</style>
        </div>
    );
}
