'use client';

import React from 'react';
import FollowButton from './FollowButton';
import ProfileEditModal from './ProfileEditModal';

interface ProfileHeaderProps {
    profile: {
        username: string | null;
        full_name: string | null;
        bio: string | null;
        avatar_url: string | null;
        is_verified: boolean;
    };
    stats: {
        reviewsCount: number;
        followersCount: number;
        followingCount: number;
    };
    isOwnProfile: boolean;
    currentUser: any;
    targetUserId: string;
    isFollowing: boolean;
}

export default function ProfileHeader({
    profile,
    stats,
    isOwnProfile,
    currentUser,
    targetUserId,
    isFollowing
}: ProfileHeaderProps) {
    const displayName = profile.full_name || profile.username || 'Music Lover';
    const avatarUrl = profile.avatar_url;
    const isVerified = profile.is_verified;

    return (
        <div className="profile-header-container">
            {/* Avatar */}
            <div className="profile-avatar">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                        {displayName[0]?.toUpperCase()}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="profile-info">
                <div className="profile-name-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, wordBreak: 'break-word' }}>{displayName}</h1>
                        {isVerified && (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#3D91FF" />
                                <path d="M7 12L10 15L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    {!isOwnProfile && currentUser && (
                        <FollowButton targetUserId={targetUserId} initialIsFollowing={isFollowing} />
                    )}
                    {isOwnProfile && (
                        <ProfileEditModal currentUsername={profile.username || ''} />
                    )}
                </div>

                {/* Stats Row */}
                <div className="profile-stats-row">
                    <div><span style={{ fontWeight: 700 }}>{stats.reviewsCount || 0}</span> reviews</div>
                    <div style={{ cursor: 'pointer' }}><span style={{ fontWeight: 700 }}>{stats.followersCount || 0}</span> followers</div>
                    <div style={{ cursor: 'pointer' }}><span style={{ fontWeight: 700 }}>{stats.followingCount || 0}</span> following</div>
                </div>

                <div style={{ color: '#aaa', fontSize: '1rem', lineHeight: '1.5' }}>
                    <p>
                        <span style={{ color: '#1ed760', fontWeight: 500 }}>@{profile.username || 'User'}</span>
                        <span style={{ margin: '0 8px' }}>•</span>
                        <span>{profile.bio || 'No bio.'}</span>
                    </p>
                </div>
            </div>

            <style jsx>{`
                .profile-header-container {
                    display: flex;
                    gap: 40px;
                    align-items: flex-start;
                    margin-bottom: 60px;
                }
                .profile-avatar {
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: ${isVerified ? '4px solid #3D91FF' : '4px solid #1ed760'};
                    box-shadow: ${isVerified ? '0 8px 40px rgba(61, 145, 255, 0.3)' : '0 8px 40px rgba(30, 215, 96, 0.3)'};
                    flex-shrink: 0;
                }
                .profile-info {
                    flex: 1;
                    padding-top: 10px;
                }
                .profile-name-row {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .profile-stats-row {
                    display: flex;
                    gap: 40px;
                    font-size: 1.1rem;
                    margin-bottom: 24px;
                }

                /* Mobile Responsiveness */
                @media (max-width: 768px) {
                    .profile-header-container {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        gap: 24px;
                    }
                    .profile-avatar {
                        width: 140px;
                        height: 140px;
                    }
                    .profile-info {
                        padding-top: 0;
                        width: 100%;
                    }
                    .profile-name-row {
                        flex-direction: column;
                        gap: 16px;
                        justify-content: center;
                    }
                    .profile-stats-row {
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 20px;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
