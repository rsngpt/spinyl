'use client';

import React from 'react';
import FollowButton from './FollowButton';
import ProfileEditModal from './ProfileEditModal';
import VinylRecordDisplay from './VinylRecordDisplay';

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
    const [imgError, setImgError] = React.useState(false);

    // Local state for instant UI updates
    const [profileState, setProfileState] = React.useState(profile);

    const displayName = profileState.full_name || profileState.username || 'Music Lover';
    const avatarUrl = profileState.avatar_url;
    const isVerified = profileState.is_verified;

    const backgroundStyle = avatarUrl && !imgError
        ? { backgroundImage: `url(${avatarUrl})` }
        : { background: 'linear-gradient(45deg, #111, #222)' };

    return (
        <div style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '32px',
            background: 'rgba(255, 255, 255, 0.02)', // Ultra transparent
            backdropFilter: 'blur(40px) saturate(180%)', // Frosted glass
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)'
        }}>
            {/* Dynamic Avatar Glow Environment */}
            <div style={{
                position: 'absolute',
                top: '-50%', left: '-50%', right: '-50%', bottom: '-50%', // Oversized
                backgroundImage: avatarUrl && !imgError
                    ? `radial-gradient(circle at center, transparent 0%, #000 70%), url(${avatarUrl})`
                    : 'conic-gradient(from 0deg, #ff0080, #7928ca, #ff0080)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(80px) saturate(200%) brightness(0.8)', // Crazy saturation for "neon" look
                opacity: 0.5,
                transform: 'translateZ(0)', // GPU acc
                pointerEvents: 'none',
                zIndex: 0,
                mixBlendMode: 'screen'
            }} />

            {/* Noise Texture for that "physical" glass feel */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
                opacity: 0.4,
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            {/* Content Container */}
            <div className="profile-header-content">

                {/* Vinyl Avatar */}
                <div className="avatar-section">
                    <div className="vinyl-sleeve-wrapper">
                        {avatarUrl && !imgError ? (
                            <div className="sleeve-container">
                                <img
                                    src={avatarUrl}
                                    alt="Profile Avatar"
                                    className="sleeve-image"
                                    referrerPolicy="no-referrer"
                                    onError={() => setImgError(true)}
                                />
                                <div className="sleeve-glare" />
                                <div className="sleeve-texture" />
                            </div>
                        ) : (
                            <div className="sleeve-container default-avatar">
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)' }}>
                                    {displayName[0]?.toUpperCase()}
                                </div>
                            </div>
                        )}

                        {/* Status Badge */}
                        {isVerified && (
                            <div style={{
                                position: 'absolute', bottom: '-10px', right: '-10px',
                                background: '#3D91FF', color: '#fff', borderRadius: '50%',
                                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.5)', zIndex: 20, border: '2px solid #121212'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Info */}
                <div className="info-section">
                    <div className="user-title">
                        <h1>@{profileState.username || 'Music Lover'}</h1>
                        {profileState.full_name && (
                            <p style={{ margin: '8px 0 0', color: '#1ed760', fontWeight: 600, fontSize: '1rem' }}>
                                {profileState.full_name}
                            </p>
                        )}
                    </div>

                    <div className="bio-text">
                        {profileState.bio || "No bio yet. Just vibes."}
                    </div>

                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-val">{stats.reviewsCount}</span>
                            <span className="stat-label">REVIEWS</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-val">{stats.followersCount}</span>
                            <span className="stat-label">FOLLOWERS</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-val">{stats.followingCount}</span>
                            <span className="stat-label">FOLLOWING</span>
                        </div>
                    </div>

                    <div className="action-row">
                        {!isOwnProfile && currentUser && (
                            <FollowButton targetUserId={targetUserId} initialIsFollowing={isFollowing} />
                        )}
                        {isOwnProfile && (
                            <ProfileEditModal
                                profile={profileState}
                                onUpdate={(updated) => setProfileState(prev => ({ ...prev, ...updated }))}
                            />
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes rotate-border {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes float-avatar {
                    0%, 100% { transform: translateY(0) rotate(-2deg); }
                    50% { transform: translateY(-10px) rotate(2deg); }
                }

                .profile-header-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 20px;
                    padding: 32px 24px;
                }
                
                /* Spicy Animated Border */
                .profile-card-border {
                    position: absolute;
                    inset: -2px; /* Border width */
                    background: conic-gradient(from 0deg, transparent 0deg, #ff0080 90deg, transparent 180deg, #7928ca 270deg, transparent 360deg);
                    animation: rotate-border 4s linear infinite;
                    border-radius: 34px; /* Slightly larger than card */
                    z-index: -1;
                    opacity: 0.5;
                    filter: blur(10px);
                }

                .avatar-section {
                    flex-shrink: 0;
                    margin-bottom: 10px;
                }
                .vinyl-sleeve-wrapper {
                    position: relative;
                    width: 180px;
                    height: 180px;
                    transition: all 0.3s ease;
                    margin: 0 auto;
                }

                
                .sleeve-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    border-radius: 4px;
                    box-shadow: 
                        1px 1px 0px #111,
                        2px 2px 0px #111,
                        3px 3px 0px #111,
                        0 20px 40px rgba(0,0,0,0.6);
                    overflow: hidden;
                    background: #222;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .sleeve-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    filter: contrast(1.1) saturate(1.1);
                }
                .default-avatar {
                    background: linear-gradient(135deg, #333, #111);
                }
                .sleeve-glare {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%);
                    pointer-events: none;
                    z-index: 20;
                    mix-blend-mode: screen;
                }
                .sleeve-texture {
                    position: absolute;
                    inset: 0;
                    z-index: 10;
                    pointer-events: none;
                    background: none;
                    opacity: 0; 
                }
                .info-section {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                /* Neon Title */
                .user-title h1 {
                   background: linear-gradient(to right, #fff, #bbb);
                   -webkit-background-clip: text;
                   -webkit-text-fill-color: transparent;
                   text-shadow: 0 0 30px rgba(255,255,255,0.1);
                   margin: 0;
                   font-size: 2.2rem;
                   fontWeight: 800;
                   letterSpacing: -1px;
                   lineHeight: 1.1;
                }
                
                .bio-text {
                    margin: 16px 0 24px;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: #ccc;
                }
                .stats-row {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 32px;
                    width: 100%;
                    padding: 0;
                    border: none;
                }
                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.4);
                    padding: 12px 16px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    flex: 1; /* Equal width pills */
                    backdrop-filter: blur(10px);
                    transition: all 0.2s ease;
                }
                .stat-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 5px 20px rgba(0,0,0,0.5); /* Glowy shadow */
                }
                .stat-val {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #fff;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                }
                .stat-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.6);
                    letter-spacing: 1px;
                    margin-top: 4px;
                }
                .action-row {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
}
