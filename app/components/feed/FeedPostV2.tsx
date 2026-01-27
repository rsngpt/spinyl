'use client';

import React from 'react';
import Link from 'next/link';
import { FeedItem } from '../../actions/feed';
import VinylRecordDisplay from '../VinylRecordDisplay';
import LikeButton from '../LikeButton';
import { MessageCircle, Share2, MoreHorizontal, Quote } from 'lucide-react';

interface FeedPostProps {
    post: FeedItem;
}

export default function FeedPostV2({ post }: FeedPostProps) {
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

    const handleShare = () => {
        if (albums?.spotify_id) {
            const url = `${window.location.origin}/album/${albums.spotify_id}`;
            navigator.clipboard.writeText(url);
        }
    };

    return (
        <div className="feed-post-wrapper">
            {/* Blurry Ambient Background */}
            <div className="ambient-bg" style={{ backgroundImage: `url(${albums?.cover_image})` }} />

            <div className="feed-post glass-panel">
                {/* Header */}
                <div className="post-header" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
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
                    {/* Left: Vinyl Art */}
                    <div className="vinyl-section">
                        <Link href={`/album/${albums?.spotify_id}`}>
                            <VinylRecordDisplay
                                coverUrl={albums?.cover_image}
                                rating={rating}
                                size={140}
                            />
                        </Link>
                        <div className="rating-pill">
                            <span className={rating >= 8 ? 'gold' : rating >= 5 ? 'silver' : 'bronze'}>
                                {rating}/10
                            </span>
                        </div>
                    </div>

                    {/* Right: Review & Info */}
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
                    </div>
                </div>

                {/* Footer Actions */}
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

                    <button className="action-btn share-btn" onClick={handleShare}>
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            <style jsx>{`
                .feed-post-wrapper {
                    position: relative;
                    margin-bottom: 40px;
                    border-radius: 24px;
                }

                .ambient-bg {
                    position: absolute;
                    top: -20%;
                    left: -20%;
                    right: -20%;
                    bottom: -20%;
                    background-size: cover;
                    background-position: center;
                    filter: blur(60px) brightness(0.4) saturate(1.2);
                    opacity: 0.4;
                    z-index: 0;
                    border-radius: 40px;
                    pointer-events: none;
                }

                .feed-post {
                    position: relative;
                    z-index: 1;
                    background: rgba(20, 20, 20, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .feed-post:hover {
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .post-header {
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                }

                .user-info-v2 {
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: center !important;
                    gap: 12px !important;
                    text-decoration: none;
                    color: white;
                }

                .avatar-ring {
                    width: 42px;
                    height: 42px;
                    padding: 2px;
                    background: linear-gradient(45deg, var(--primary), #1ed760);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .avatar-container {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #121212;
                    border: 2px solid #121212;
                }

                .avatar-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    background: #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.9rem;
                }

                .username {
                    font-weight: 700;
                    font-size: 0.95rem;
                    line-height: normal;
                    margin: 0;
                    color: white;
                }

                .scrobble-time {
                    font-size: 0.85rem;
                    color: #888;
                    font-weight: 400;
                }

                .separator {
                    color: #777;
                    font-size: 0.8rem;
                    line-height: normal;
                    margin: 0 4px;
                }

                .more-btn {
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    transition: background 0.2s;
                }
                
                .more-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }

                .post-body {
                    padding: 20px;
                    display: flex;
                    gap: 24px;
                }
                
                .vinyl-section {
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    margin-right: 50px;
                }
                
                .rating-pill span {
                    font-size: 0.8rem;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 20px;
                    letter-spacing: 0.5px;
                }
                
                .rating-pill span.gold { background: rgba(255, 215, 0, 0.15); color: #FFD700; border: 1px solid rgba(255, 215, 0, 0.2); }
                .rating-pill span.silver { background: rgba(226, 232, 240, 0.15); color: #e2e8f0; border: 1px solid rgba(226, 232, 240, 0.2); }
                .rating-pill span.bronze { background: rgba(205, 127, 50, 0.15); color: #cd7f32; border: 1px solid rgba(205, 127, 50, 0.2); }

                .content-section {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding-top: 4px;
                }

                .album-meta {
                    display: flex;
                    flex-direction: column;
                }

                .album-title-link {
                    text-decoration: none;
                    color: white;
                }

                .album-title {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 800;
                    line-height: 1.2;
                    letter-spacing: -0.5px;
                }
                
                .album-title:hover {
                    text-decoration: underline;
                }

                .artist-name {
                    font-size: 0.95rem;
                    color: #aaa;
                    font-weight: 500;
                }

                .review-box {
                    position: relative;
                    margin-top: 4px;
                }

                .quote-icon {
                    position: absolute;
                    top: -6px;
                    left: -10px;
                    color: rgba(255, 255, 255, 0.1);
                    width: 24px;
                    height: 24px;
                }

                .review-text {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.85);
                    position: relative;
                    z-index: 1;
                    padding-left: 12px; 
                    border-left: 2px solid rgba(255, 255, 255, 0.1);
                }

                .post-footer {
                    padding: 12px 20px;
                    background: rgba(0, 0, 0, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: flex-start; /* Changed from space-between */
                    gap: 8px; /* Gap between Like and Comment */
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
                    gap: 6px;
                    color: #888;
                    cursor: pointer;
                    padding: 0 12px;
                    height: 40px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 600;
                    justify-content: center;
                    line-height: 1;
                }

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }

                .share-btn {
                    margin-left: auto;
                }
                @media (max-width: 500px) {
                    .post-body {
                        padding: 12px;
                        gap: 12px;
                    }
                    
                    .vinyl-section {
                        margin-right: 10px;
                        transform: scale(0.75);
                        transform-origin: top left;
                        margin-bottom: -30px;
                    }

                    .album-title {
                        font-size: 1.1rem;
                    }

                    .artist-name {
                        font-size: 0.85rem;
                    }

                    .review-text {
                        font-size: 0.85rem;
                    }
                }
            `}</style>
        </div>
    );
}
