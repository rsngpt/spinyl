'use client';

import { useState } from 'react';
import Link from 'next/link';
import LikeButton from './LikeButton';
import FollowButton from './FollowButton';
import VinylRecordDisplay from './VinylRecordDisplay';

interface ProfileContentProps {
    reviews: any[];
    followersList: any[] | null;
    followingList: any[] | null;
    isOwnProfile: boolean;
    currentUserId?: string;
}

export default function ProfileContent({
    reviews,
    followersList,
    followingList,
    isOwnProfile,
    currentUserId
}: ProfileContentProps) {
    const [activeTab, setActiveTab] = useState<'reviews' | 'followers' | 'following'>('reviews');

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                background: 'transparent',
                border: 'none',
                padding: '16px 24px',
                color: activeTab === id ? '#fff' : '#888',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.3s',
                display: 'flex', alignItems: 'center', gap: '8px'
            }}
        >
            <span style={{ fontSize: '1.2rem' }}>{icon}</span> {label}
            {activeTab === id && (
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
                    background: '#1ed760',
                    boxShadow: '0 -2px 10px rgba(30,215,96,0.5)',
                    borderRadius: '3px 3px 0 0'
                }} />
            )}
        </button>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            {/* Tabs Navigation */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginBottom: '40px',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <TabButton id="reviews" label="REVIEWS" icon="💿" />
                {isOwnProfile && <TabButton id="followers" label="FOLLOWERS" icon="👥" />}
                {isOwnProfile && <TabButton id="following" label="FOLLOWING" icon="👣" />}
            </div>

            {/* Content Area */}
            {activeTab === 'reviews' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {reviews && reviews.length > 0 ? (
                        reviews.map((review: any) => (
                            <div key={review.id} className="review-card">
                                <Link href={`/album/${review.albums.spotify_id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        {/* Vinyl + Info Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                            {/* Wrapper with enough width (Sleeve 80px + Record stick out ~40px + margin) */}
                                            {/* Fixed width 130px ensures the record doesn't overlap the text */}
                                            <div style={{ flexShrink: 0, width: '120px', position: 'relative' }}>
                                                <VinylRecordDisplay
                                                    coverUrl={review.albums.cover_image}
                                                    rating={review.rating}
                                                    size={85}
                                                />
                                            </div>

                                            <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.2' }}>
                                                    {review.albums.name}
                                                </h3>
                                                <p style={{ margin: '4px 0 8px', color: '#bbb', fontSize: '0.95rem' }}>
                                                    {review.albums.artists[0]}
                                                </p>

                                                {/* Rating Badge */}
                                                <div style={{
                                                    alignSelf: 'flex-start',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    background: review.rating >= 8 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                                                    border: review.rating >= 8 ? '1px solid rgba(255, 215, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                    color: review.rating >= 8 ? '#FFD700' : '#fff',
                                                    fontSize: '0.85rem', fontWeight: 800
                                                }}>
                                                    {review.rating}/10
                                                </div>
                                            </div>
                                        </div>

                                        <p style={{
                                            fontSize: '0.95rem', lineHeight: '1.6', color: '#ccc', margin: 0,
                                            flex: 1,
                                            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>
                                            "{review.review_text}"
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div style={{
                                        padding: '16px 24px',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        background: 'rgba(0,0,0,0.2)',
                                        fontSize: '0.85rem', color: '#666',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <LikeButton
                                            reviewId={review.id}
                                            initialIsLiked={review.is_liked_by_user}
                                            initialLikeCount={review.likes_count}
                                        />
                                        <span style={{ fontStyle: 'italic', color: '#555' }}>
                                            {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: '#666' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>💿</div>
                            <p>No reviews yet. Start listening!</p>
                        </div>
                    )}
                </div>
            )}

            {(activeTab === 'followers' || activeTab === 'following') && (
                <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(activeTab === 'followers' ? followersList : followingList)?.map((item: any) => {
                        const user = item.user_data;
                        if (!user) return null;

                        return (
                            <div key={user.id} className="user-card" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                padding: '16px 24px',
                                borderRadius: '16px',
                                transition: 'all 0.2s'
                            }}>
                                <Link href={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', background: '#333', border: '2px solid rgba(255,255,255,0.1)' }}>
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                {(user.username || user.full_name || 'U')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user.username || user.full_name}</span>
                                            {user.is_verified && (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3D91FF" strokeWidth="3">
                                                    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#888' }}>Music Lover</span>
                                    </div>
                                </Link>

                                {currentUserId && currentUserId !== user.id && (
                                    <FollowButton targetUserId={user.id} initialIsFollowing={item.is_followed_by_current_user} />
                                )}
                            </div>
                        );
                    })}
                    {((activeTab === 'followers' && (!followersList || followersList.length === 0)) ||
                        (activeTab === 'following' && (!followingList || followingList.length === 0))) && (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                                List is empty.
                            </div>
                        )}
                </div>
            )}

            <style jsx>{`
                .review-card {
                    background: rgba(26, 26, 26, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(12px);
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                }
                .review-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.5);
                    border-color: rgba(255, 255, 255, 0.1);
                    background: rgba(30, 30, 30, 0.8);
                }
                .user-card:hover {
                    background: rgba(255,255,255,0.06) !important;
                    transform: translateX(4px);
                }
            `}</style>
        </div>
    );
}
