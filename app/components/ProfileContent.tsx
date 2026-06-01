'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import LikeButton from './LikeButton';
import FollowButton from './FollowButton';
import VinylRecordDisplay from './VinylRecordDisplay';
import { formatLongDate } from '../../src/lib/date-utils';
import { Disc, Users, UserCheck } from 'lucide-react';
import DefaultAvatar from './DefaultAvatar';

interface ProfileContentProps {
    reviews: any[];
    followersList: any[] | null;
    followingList: any[] | null;
    isOwnProfile: boolean;
    currentUserId?: string;
}

// Framer motion variants for staggered grid/list entrances
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: { type: "spring", stiffness: 260, damping: 22 }
    }
} as const;

export default function ProfileContent({
    reviews,
    followersList,
    followingList,
    isOwnProfile,
    currentUserId
}: ProfileContentProps) {
    const [activeTab, setActiveTab] = useState<'reviews' | 'followers' | 'following'>('reviews');

    return (
        <div className="profile-content-container">
            {/* Tabs Navigation */}
            <div className="tabs-nav-bar">
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`tab-btn-item ${activeTab === 'reviews' ? 'active' : ''}`}
                >
                    <Disc size={18} />
                    <span className="tab-label">Reviews</span>
                </button>
                {isOwnProfile && (
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`tab-btn-item ${activeTab === 'followers' ? 'active' : ''}`}
                    >
                        <Users size={18} />
                        <span className="tab-label">Followers</span>
                    </button>
                )}
                {isOwnProfile && (
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`tab-btn-item ${activeTab === 'following' ? 'active' : ''}`}
                    >
                        <UserCheck size={18} />
                        <span className="tab-label">Following</span>
                    </button>
                )}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'reviews' && (
                    <motion.div 
                        key="reviews-tab"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        className="reviews-grid-layout"
                    >
                        {reviews && reviews.length > 0 ? (
                            reviews.map((review: any) => (
                                <motion.div 
                                    key={review.id} 
                                    variants={itemVariants}
                                    whileHover={{
                                        scale: 1.025,
                                        y: -6,
                                        borderColor: 'rgba(255, 159, 104, 0.25)',
                                        boxShadow: '0 24px 48px rgba(0,0,0,0.55), 0 0 20px rgba(255, 159, 104, 0.15)'
                                    }}
                                    className="review-card"
                                >
                                    <Link href={`/album/${review.albums.spotify_id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            {/* Vinyl + Info Header */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                                <div style={{ flexShrink: 0, width: '115px', position: 'relative' }}>
                                                    <VinylRecordDisplay
                                                        coverUrl={review.albums.cover_image}
                                                        rating={review.rating}
                                                        size={80}
                                                    />
                                                </div>

                                                <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.3', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                                                        {review.albums.name}
                                                    </h3>
                                                    <p style={{ margin: '4px 0 10px', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                        {review.albums.artists[0]}
                                                    </p>

                                                    {/* Rating Badge */}
                                                    <div style={{
                                                        alignSelf: 'flex-start',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        background: review.rating >= 8 ? 'var(--md-sys-color-tertiary-container)' : 'rgba(255, 255, 255, 0.05)',
                                                        border: review.rating >= 8 ? '1px solid var(--md-sys-color-tertiary)' : '1px solid rgba(255, 255, 255, 0.08)',
                                                        color: review.rating >= 8 ? 'var(--md-sys-color-on-tertiary-container)' : '#fff',
                                                        fontSize: '0.8rem', fontWeight: 800
                                                    }}>
                                                        {review.rating}/10
                                                    </div>
                                                </div>
                                            </div>

                                            <p style={{
                                                fontSize: '0.9rem', lineHeight: '1.6', color: '#d8c2bb', margin: 0,
                                                flex: 1,
                                                display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                            }}>
                                                "{review.review_text}"
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div style={{
                                            padding: '16px 20px',
                                            borderTop: '1px solid rgba(255,255,255,0.04)',
                                            background: 'rgba(17, 11, 9, 0.3)',
                                            fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <LikeButton
                                                reviewId={review.id}
                                                initialIsLiked={review.is_liked_by_user}
                                                initialLikeCount={review.likes_count}
                                            />
                                            <span style={{ fontStyle: 'italic', opacity: 0.8 }}>
                                                {formatLongDate(review.created_at)}
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: '#666' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>💿</div>
                                <p>No reviews yet. Start listening!</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {(activeTab === 'followers' || activeTab === 'following') && (
                    <motion.div 
                        key="connections-tab"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        className="connections-list-layout"
                    >
                        {(activeTab === 'followers' ? followersList : followingList)?.map((item: any) => {
                            const user = item.user_data;
                            if (!user) return null;

                            return (
                                <motion.div 
                                    key={user.id} 
                                    variants={itemVariants}
                                    whileHover={{
                                        scale: 1.015,
                                        x: 4,
                                        borderColor: 'rgba(255, 255, 255, 0.12)',
                                        background: 'rgba(255,255,255,0.05)'
                                    }}
                                    className="user-card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: 'rgba(28, 22, 20, 0.3)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '16px 24px',
                                        borderRadius: '24px',
                                        transition: 'border-color 0.25s ease, background 0.25s ease'
                                    }}
                                >
                                    <Link href={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '0px', overflow: 'hidden', background: '#27201d', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-outline)' }}>
                                                    <DefaultAvatar fill="currentColor" />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>{user.username || user.full_name}</span>
                                                {user.is_verified && (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="3">
                                                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 600 }}>Music Lover</span>
                                        </div>
                                    </Link>

                                    {currentUserId && currentUserId !== user.id && (
                                        <FollowButton targetUserId={user.id} initialIsFollowing={item.is_followed_by_current_user} />
                                    )}
                                </motion.div>
                            );
                        })}
                        {((activeTab === 'followers' && (!followersList || followersList.length === 0)) ||
                            (activeTab === 'following' && (!followingList || followingList.length === 0))) && (
                                <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                                    List is empty.
                                </div>
                            )}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .profile-content-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px 80px;
                }
                .tabs-nav-bar {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                    margin-bottom: 40px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    padding-bottom: 16px;
                }
                .tab-btn-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255, 255, 255, 0.65);
                    background: transparent;
                    border: 1px solid transparent;
                    font-size: 0.92rem;
                    font-weight: 600;
                    transition: var(--transition-spring);
                    padding: 8px 18px;
                    border-radius: 20px;
                    cursor: pointer;
                    outline: none;
                }
                .tab-btn-item:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.05);
                    transform: scale(1.05);
                }
                .tab-btn-item.active {
                    color: var(--md-sys-color-primary);
                    background: rgba(255, 159, 104, 0.1);
                    border-color: rgba(255, 159, 104, 0.15);
                    box-shadow: 0 4px 15px rgba(255, 159, 104, 0.1);
                }
                .tab-btn-item:active {
                    transform: scale(0.95);
                }
                .tab-label {
                    font-size: 0.92rem;
                    font-weight: 600;
                }
                .reviews-grid-layout {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }
                .connections-list-layout {
                    max-width: 600px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .review-card {
                    background: rgba(28, 22, 20, 0.45);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border-radius: 28px; /* M3 Expressive container corners */
                    overflow: hidden;
                    position: relative;
                    transition: border-color 0.3s ease;
                }

                @media (max-width: 768px) {
                    .profile-content-container {
                        padding: 0 16px 120px; /* Space for M3 mobile-bottom-nav */
                    }
                    .tabs-nav-bar {
                        gap: 4px;
                        margin-bottom: 24px;
                        padding-bottom: 12px;
                    }
                    .tab-btn-item {
                        padding: 8px 14px;
                        font-size: 0.75rem;
                        gap: 4px;
                    }
                    .tab-icon {
                        font-size: 0.95rem;
                    }
                    .reviews-grid-layout {
                        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                        gap: 16px;
                    }
                }
            `}</style>
        </div>
    );
}
