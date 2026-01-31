'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { FeedItem } from '../../actions/feed';
import VinylRecordDisplay from '../VinylRecordDisplay';
import LikeButton from '../LikeButton';
import { MessageCircle, Share2, MoreHorizontal, Quote } from 'lucide-react';
import InstagramStoryCard from '../InstagramStoryCard';
import html2canvas from 'html2canvas';
import { getBase64Image } from '../../actions/image-proxy';

interface FeedPostProps {
    post: FeedItem;
    variant?: 'vertical' | 'horizontal';
}

export default function FeedPost({ post, variant = 'vertical' }: FeedPostProps) {
    const {
        id,
        created_at,
        rating,
        review_text,
        profiles,
        albums,
        likes_count,
        comments_count,
        is_liked_by_user
    } = post;

    const timeAgo = (dateIdx: string) => {
        const date = new Date(dateIdx);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";

        return "now";
    };

    const [storyData, setStoryData] = useState<any | null>(null);
    const storyCardRef = useRef<HTMLDivElement>(null);
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);

    const handleShareToStory = async () => {
        if (isGeneratingStory) return;
        setIsGeneratingStory(true);

        // 1. Fetch images as Base64 to bypass CORS
        let base64Cover = albums?.cover_image || '';
        let base64Avatar = profiles?.avatar_url || null;

        try {
            if (albums?.cover_image) {
                const coverRes = await getBase64Image(albums.cover_image);
                if (coverRes.success && coverRes.data) base64Cover = coverRes.data;
            }
            if (profiles?.avatar_url) {
                const avatarRes = await getBase64Image(profiles.avatar_url);
                if (avatarRes.success && avatarRes.data) base64Avatar = avatarRes.data;
            }
        } catch (e) {
            console.error("Failed to proxy images", e);
        }

        // 2. Set data to render the hidden card
        setStoryData({
            albumName: albums?.name || '',
            artistName: albums?.artists?.[0] || '',
            coverUrl: base64Cover,
            rating: rating,
            reviewText: review_text || '',
            username: profiles?.username || 'User',
            userAvatar: base64Avatar
        });

        // 2. Wait for state update and render
        setTimeout(async () => {
            if (storyCardRef.current) {
                try {
                    console.log("Starting Capture...");
                    const canvas = await html2canvas(storyCardRef.current, {
                        useCORS: true,
                        scale: 2, // High res for quality
                        backgroundColor: '#111',
                        logging: true,
                        allowTaint: false, // Changed to false to force CORS usage
                        foreignObjectRendering: false
                    });

                    console.log("Capture complete. Downloading...");
                    const link = document.createElement('a');
                    link.download = `spinyl-story-${(albums?.name || 'album').replace(/\s+/g, '-')}.png`;
                    link.href = canvas.toDataURL('image/png', 1.0);
                    link.click();
                } catch (err) {
                    console.error("Story generation failed:", err);
                    alert("Failed to generate story image. Check console for details.");
                } finally {
                    setStoryData(null); // Cleanup
                    setIsGeneratingStory(false);
                }
            } else {
                console.error("Story card ref missing");
                setIsGeneratingStory(false);
            }
        }, 1000);
    };

    return (
        <div className={`feed-post-wrapper ${variant}`}>
            {/* HIDDEN STORY CARD FOR GENERATION */}
            {storyData && (
                <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                    <InstagramStoryCard ref={storyCardRef} {...storyData} />
                </div>
            )}

            <div className={`feed-post glass-panel ${variant}`}>
                {/* Header (Always Top) */}
                <div className="post-header">
                    <Link href={`/profile/${post.user_id}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'white' }}>
                        <div style={{ width: '42px', height: '42px', flexShrink: 0, padding: '2px', background: 'linear-gradient(45deg, #1DB954, #1ed760)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#121212', border: '2px solid #121212' }}>
                                {profiles?.avatar_url ? (
                                    <img src={profiles.avatar_url} alt={profiles.username || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{(profiles?.username?.[0] || 'U').toUpperCase()}</div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.95rem', margin: 0, lineHeight: 1 }}>{profiles?.username || 'Unknown'}</span>
                            <span style={{ color: '#777', fontSize: '0.8rem', lineHeight: 1 }}>&bull;</span>
                            <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: '400' }}>{timeAgo(created_at)}</span>
                        </div>
                    </Link>
                    <button className="more-btn">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* Main Content Layout */}
                <div className="post-body">
                    {/* Left/Top: Vinyl Art */}
                    <div className="vinyl-section">
                        <Link href={`/album/${albums?.spotify_id}`}>
                            <VinylRecordDisplay
                                coverUrl={albums?.cover_image}
                                rating={rating}
                                size={variant === 'horizontal' ? 200 : 140}
                                className="feed-posts-vinyl"
                            />
                        </Link>
                        <div className="rating-pill">
                            <span className={rating >= 8 ? 'gold' : rating >= 5 ? 'silver' : 'bronze'}>
                                {rating}/10
                            </span>
                        </div>
                    </div>

                    {/* Right/Bottom: Review & Info */}
                    <div className="content-section">
                        <div className="album-meta">
                            <Link href={`/album/${albums?.spotify_id}`} className="album-title-link">
                                <h3 className="album-title">{albums?.name}</h3>
                            </Link>
                            <span className="artist-name">{albums?.artists?.[0]}</span>
                        </div>

                        {review_text && (
                            <div className="review-box">
                                <Quote size={16} className="quote-icon" />
                                <p className="review-text">{review_text}</p>
                            </div>
                        )}

                        {/* Footer Actions (In horizontal, pushed to bottom of content section) */}
                        {variant === 'horizontal' && (
                            <div className="post-footer horizontal-footer">
                                <div className="action-btn-wrapper">
                                    <LikeButton
                                        reviewId={id}
                                        initialIsLiked={is_liked_by_user}
                                        initialLikeCount={likes_count}
                                    />
                                </div>

                                <Link href={`/album/${albums?.spotify_id}`} className="action-btn">
                                    <MessageCircle size={20} />
                                    <span>{comments_count > 0 ? comments_count : ''}</span>
                                </Link>

                                <button
                                    className="action-btn share-btn"
                                    onClick={handleShareToStory}
                                    disabled={isGeneratingStory}
                                    style={{ opacity: isGeneratingStory ? 0.5 : 1, cursor: isGeneratingStory ? 'wait' : 'pointer' }}
                                >
                                    <Share2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions (Vertical Only) */}
                {variant === 'vertical' && (
                    <div className="post-footer">
                        <div className="action-btn-wrapper">
                            <LikeButton
                                reviewId={id}
                                initialIsLiked={is_liked_by_user}
                                initialLikeCount={likes_count}
                            />
                        </div>

                        <Link href={`/album/${albums?.spotify_id}`} className="action-btn">
                            <MessageCircle size={20} />
                            <span>{comments_count > 0 ? comments_count : ''}</span>
                        </Link>

                        <button
                            className="action-btn share-btn"
                            onClick={handleShareToStory}
                            disabled={isGeneratingStory}
                            style={{ opacity: isGeneratingStory ? 0.5 : 1, cursor: isGeneratingStory ? 'wait' : 'pointer' }}
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .feed-post-wrapper {
                    position: relative;
                    border-radius: 16px;
                    width: 100%;
                    break-inside: avoid;
                    overflow: hidden;
                    box-sizing: border-box;
                }

                .ambient-bg {
                    display: none;
                }

                .feed-post {
                    position: relative;
                    z-index: 1;
                    background: #181818;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    overflow: hidden;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                    display: flex;
                    flex-direction: column;
                }
                
                .feed-post:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                /* ========================
                   HEADER
                   ======================== */
                .post-header {
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }

                /* ========================
                   BODY LAYOUTS
                   ======================== */
                .post-body {
                    padding: 0 16px 16px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 100%;
                    box-sizing: border-box;
                }

                /* --- VERTICAL (Default) --- */
                .feed-post:not(.horizontal) .vinyl-section {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center; /* Strictly Center Vinyl */
                    justify-content: center;
                    margin: 0;
                    padding: 8px 70px 16px 0; /* padding-right 70px shifts center left by 35px */
                    position: relative;
                    box-sizing: border-box;
                }

                .feed-post:not(.horizontal) .vinyl-section a {
                    /* Reset hacks, let padding handle it */
                    display: block;
                    width: auto;
                    margin-right: 0;
                    transition: margin 0.2s ease;
                }

                .feed-post:not(.horizontal) .content-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: center; /* Center Content */
                    text-align: center; /* Center Text */
                }

                .feed-post:not(.horizontal) .album-meta {
                    align-items: center;
                }

                .feed-post:not(.horizontal) .review-text {
                    text-align: center;
                }

                /* --- HORIZONTAL (Wide) --- */
                .feed-post.horizontal .post-body {
                    flex-direction: row;
                    align-items: center; /* Vertically center content */
                    gap: 0; /* Gap handled by vinyl section margin */
                    padding: 0 24px 24px 32px;
                }

                .feed-post.horizontal .vinyl-section {
                    width: auto;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    margin: 0;
                    position: relative;
                    padding-top: 4px;
                    
                    /* CRITICAL FIX: Reserve space for the 90px vinyl overflow + 50px visible gap */
                    margin-right: 140px; 
                }

                /* Mobile Reset */
                @media (max-width: 768px) {
                    .feed-post.horizontal .vinyl-section {
                        margin-right: 0; /* Reset for mobile */
                    }
                }

                .feed-post.horizontal .vinyl-section a {
                    margin-right: 0; /* Removed child margin */
                }

                .feed-post.horizontal .content-section {
                    flex: 1;
                    min-width: 0; /* Prevent flex overflow */
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    align-items: flex-start; /* Left align content */
                    text-align: left;
                    padding-top: 0;
                }

                /* ========================
                   COMPONENTS
                   ======================== */

                /* Rating Pill */
                .rating-pill {
                    position: absolute;
                    top: 0px;
                    right: 10px;
                    z-index: 10;
                }
                
                /* In vertical, centering perfectly might mean the pill needs to not be absolute or be better placed. 
                   User said "album cover and vinyl combined... centered". 
                   Let's stick to absolute top-right of the vinyl section for now. */
                .feed-post:not(.horizontal) .rating-pill {
                    right: 50%;
                    transform: translateX(60px); /* Move it to the right of the center vinyl */
                    top: 10px;
                }
                
                .feed-post.horizontal .rating-pill {
                    right: -10px;
                    top: -5px;
                }

                .rating-pill span {
                    font-size: 0.75rem;
                    font-weight: 800;
                    padding: 4px 8px;
                    border-radius: 12px;
                    letter-spacing: 0.5px;
                    background: rgba(0,0,0,0.8) !important;
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(255,255,255,0.2) !important;
                    color: white;
                }
                .rating-pill span.gold { color: #FFD700; border-color: #FFD700 !important; }
                .rating-pill span.silver { color: #e2e8f0; }
                .rating-pill span.bronze { color: #cd7f32; }

                /* Typography */
                .album-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    width: 100%;
                }

                .album-title-link {
                    text-decoration: none;
                    color: white;
                    display: block;
                    width: 100%;
                }

                .album-title {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    line-height: 1.25;
                    word-wrap: break-word;
                }
                
                .feed-post.horizontal .album-title {
                    font-size: 1.5rem;
                }

                .artist-name {
                    font-size: 0.9rem;
                    color: #aaa;
                    font-weight: 500;
                }

                .review-box {
                    position: relative;
                    margin-top: 4px;
                    width: 100%;
                }

                .review-text {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: #ddd;
                    overflow: visible;
                    padding: 0;
                    border: none;
                    margin: 0;
                    white-space: pre-wrap; /* Preserve line breaks */
                }

                /* Footer */
                .post-footer {
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: space-between; 
                    gap: 8px;
                    flex-shrink: 0;
                }
                
                .horizontal-footer {
                    margin-top: auto;
                    padding-top: 16px; 
                    border-top: none !important;
                    padding-left: 0 !important;
                    width: 100%;
                    justify-content: flex-start;
                }

                .action-btn-wrapper {
                    display: flex;
                    align-items: center;
                }

                .action-btn {
                    background: none;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #888;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 6px;
                    transition: all 0.2s;
                    text-decoration: none;
                    font-size: 0.8rem;
                    font-weight: 600;
                    line-height: 1;
                }

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .more-btn {
                    background: none;
                    border: none;
                    color: #555;
                    cursor: pointer;
                    padding: 4px;
                }
                .more-btn:hover {
                    color: #fff;
                }

                /* Mobile Queries - Catching up to 900px for safety */
                @media (max-width: 900px) {
                    /* PREPARE VINYL WRAPPER FOR CSS OVERRIDE via CLASS */
                    :global(.feed-posts-vinyl) {
                        width: 90px !important;
                        height: 90px !important;
                    }

                    .post-header {
                        padding: 8px 12px;
                    }
                    .post-header span {
                        font-size: 0.75rem !important;
                    }

                    /* NO TRANSFORMS, JUST PURE SIZING */
                    .feed-post:not(.horizontal) .vinyl-section a,
                    .feed-post.horizontal .vinyl-section a {
                        transform: none !important;
                        margin: 0 !important;
                        display: block;
                    }

                    /* VERTICAL POSTS: Center everything */
                    .feed-post:not(.horizontal) .vinyl-section {
                        padding-right: 45px; 
                        padding-top: 12px;
                        padding-bottom: 4px;
                        min-height: auto;
                        margin-bottom: 0;
                    }

                    /* HORIZONTAL POSTS: Top Align for clean "row" look */
                    .feed-post.horizontal .post-body {
                        flex-direction: row; /* KEEP ROW */
                        align-items: flex-start; /* TOP ALIGN */
                        padding: 0 12px 12px 12px;
                        gap: 0;
                    }

                    .feed-post.horizontal .vinyl-section {
                        width: auto;
                        margin-right: 16px !important; /* Tighten gap */
                        padding-right: 45px;
                        padding-top: 0; /* Flush top */
                        padding-bottom: 8px;
                        box-sizing: border-box;
                        min-height: auto;
                        flex-shrink: 0;
                    }

                    .feed-post.horizontal .content-section {
                        align-items: flex-start; /* LEFT ALIGNED */
                        text-align: left;
                        width: auto;
                        flex: 1; /* Take remaining space */
                        gap: 6px;
                    }

                    .feed-post.horizontal .album-meta {
                         align-items: flex-start;
                    }
                    
                    .feed-post.horizontal .review-text {
                        text-align: left;
                    }

                    /* Typography Reductions */
                    .album-title, .feed-post.horizontal .album-title {
                        font-size: 0.9rem !important; 
                        line-height: 1.2;
                    }
                    .artist-name {
                        font-size: 0.75rem;
                    }
                    .review-text {
                        font-size: 0.8rem;
                        line-height: 1.4;
                    }

                    .horizontal-footer {
                        width: 100%;
                        justify-content: flex-start;
                        padding-top: 8px;
                    }
                }
            `}</style>
        </div>
    );
}
