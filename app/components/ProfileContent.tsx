'use client';

import { useState } from 'react';
import Link from 'next/link';
import LikeButton from './LikeButton';
import FollowButton from './FollowButton';

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

    return (
        <div style={{ borderTop: '1px solid #333', paddingTop: '0px' }}>
            {/* Tabs Navigation */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '60px',
                marginBottom: '40px',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '1px'
            }}>
                <div
                    onClick={() => setActiveTab('reviews')}
                    style={{
                        borderTop: activeTab === 'reviews' ? '1px solid #fff' : '1px solid transparent',
                        padding: '16px 0',
                        marginTop: '-1px',
                        color: activeTab === 'reviews' ? '#fff' : '#888',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>💿</span> REVIEWS
                </div>

                {isOwnProfile && (
                    <>
                        <div
                            onClick={() => setActiveTab('followers')}
                            style={{
                                borderTop: activeTab === 'followers' ? '1px solid #fff' : '1px solid transparent',
                                padding: '16px 0',
                                marginTop: '-1px',
                                color: activeTab === 'followers' ? '#fff' : '#888',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>👥</span> FOLLOWERS
                        </div>
                        <div
                            onClick={() => setActiveTab('following')}
                            style={{
                                borderTop: activeTab === 'following' ? '1px solid #fff' : '1px solid transparent',
                                padding: '16px 0',
                                marginTop: '-1px',
                                color: activeTab === 'following' ? '#fff' : '#888',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>👣</span> FOLLOWING
                        </div>
                    </>
                )}
            </div>

            {/* Content Area */}
            {activeTab === 'reviews' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {reviews && reviews.length > 0 ? (
                        reviews.map((review: any) => (
                            <div key={review.id} style={{
                                background: '#181818', borderRadius: '8px', overflow: 'hidden',
                                transition: 'background 0.2s', cursor: 'pointer'
                            }}>
                                <Link href={`/album/${review.albums.spotify_id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ padding: '20px', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                            <img src={review.albums.cover_image} alt={review.albums.name} style={{ width: '60px', height: '60px', borderRadius: '4px' }} />
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.albums.name}</div>
                                                <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{review.albums.artists[0]}</div>
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '12px', color: '#FFD700' }}>{'★'.repeat(review.rating)}</div>
                                        <p style={{
                                            fontSize: '0.95rem', lineHeight: '1.6', color: '#ddd', margin: 0,
                                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>
                                            {review.review_text}
                                        </p>
                                    </div>
                                    <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.03)', fontSize: '0.8rem', color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <LikeButton
                                            reviewId={review.id}
                                            initialIsLiked={review.is_liked_by_user}
                                            initialLikeCount={review.likes_count}
                                        />
                                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#666' }}>
                            No reviews yet.
                        </div>
                    )}
                </div>
            )}

            {(activeTab === 'followers' || activeTab === 'following') && (
                <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(activeTab === 'followers' ? followersList : followingList)?.map((item: any) => {
                        // The structure depends on the join. 
                        // If fetching followers: item.follower_id (profile)
                        // If fetching following: item.following_id (profile)
                        // We will normalize this in the parent component to pass a simple 'user' object in list.
                        const user = item.user_data;

                        if (!user) return null;

                        return (
                            <div key={user.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#181818',
                                padding: '12px 20px',
                                borderRadius: '50px' // Pill shape
                            }}>
                                <Link href={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#333' }}>
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {(user.username || user.full_name || 'U')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{user.username || user.full_name}</span>
                                </Link>

                                {/* Assuming we might want a follow button here too eventually, but for now just list */}
                                {currentUserId && currentUserId !== user.id && (
                                    <FollowButton targetUserId={user.id} initialIsFollowing={item.is_followed_by_current_user} />
                                )}
                            </div>
                        );
                    })}
                    {((activeTab === 'followers' && (!followersList || followersList.length === 0)) ||
                        (activeTab === 'following' && (!followingList || followingList.length === 0))) && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                List is empty.
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
