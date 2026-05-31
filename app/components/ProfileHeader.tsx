'use client';

import React from 'react';
import { motion } from 'framer-motion';
import FollowButton from './FollowButton';
import ProfileEditModal from './ProfileEditModal';
import RoastModal from './RoastModal';
import { Flame, Lock } from 'lucide-react';

// Helper to extract dynamic colors from avatar image client-side
function extractColorsFromImage(imgElement: HTMLImageElement): { primary: string; secondary: string; glow: string } {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 30;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');
        if (!ctx) return { primary: '#ff9f68', secondary: '#ffe1d1', glow: 'rgba(255, 159, 104, 0.4)' };
        
        // Use crossOrigin anonymous to prevent canvas taint if CORS allowed
        imgElement.crossOrigin = "anonymous";
        ctx.drawImage(imgElement, 0, 0, 30, 30);
        const imgData = ctx.getImageData(0, 0, 30, 30).data;
        
        let bestColor = { r: 255, g: 159, b: 104, score: 0 };
        let secondBestColor = { r: 255, g: 225, b: 209, score: 0 };
        
        for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i+1];
            const b = imgData[i+2];
            const a = imgData[i+3];
            if (a < 200) continue; // Skip semi-transparent pixels
            
            // Saturation: difference between color channels
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max - min;
            
            const brightness = (r + g + b) / 3;
            if (brightness < 40 || brightness > 230) continue; // Skip extremes
            
            const score = saturation * (1 + brightness / 255);
            if (score > bestColor.score) {
                secondBestColor = bestColor;
                bestColor = { r, g, b, score };
            } else if (score > secondBestColor.score) {
                secondBestColor = { r, g, b, score };
            }
        }
        
        const primary = `rgb(${bestColor.r}, ${bestColor.g}, ${bestColor.b})`;
        const secondary = `rgb(${secondBestColor.r}, ${secondBestColor.g}, ${secondBestColor.b})`;
        const glow = `rgba(${bestColor.r}, ${bestColor.g}, ${bestColor.b}, 0.55)`;
        
        return { primary, secondary, glow };
    } catch (e) {
        // Fallback for CORS-protected images
        return getFallbackColors(imgElement.src || 'default');
    }
}

function getFallbackColors(seedString: string): { primary: string; secondary: string; glow: string } {
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return {
        primary: `hsl(${hue}, 85%, 65%)`,
        secondary: `hsl(${(hue + 45) % 360}, 75%, 75%)`,
        glow: `hsla(${hue}, 85%, 65%, 0.45)`
    };
}

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
    const [isRoastModalOpen, setIsRoastModalOpen] = React.useState(false);
    const [isRoastHovered, setIsRoastHovered] = React.useState(false);
    const isRoastEligible = stats.reviewsCount >= 5;
    const [profileState, setProfileState] = React.useState(profile);
    const [colors, setColors] = React.useState({
        primary: 'var(--md-sys-color-primary)',
        secondary: 'var(--md-sys-color-secondary)',
        glow: 'rgba(255, 159, 104, 0.25)'
    });

    const displayName = profileState.full_name || profileState.username || 'Music Lover';
    const avatarUrl = profileState.avatar_url;
    const isVerified = profileState.is_verified;

    // Run fallback generation if no avatar is available
    React.useEffect(() => {
        if (!avatarUrl || imgError) {
            const fallback = getFallbackColors(profileState.username || 'Music Lover');
            setColors(fallback);
        }
    }, [avatarUrl, imgError, profileState.username]);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const extracted = extractColorsFromImage(e.currentTarget);
        setColors(extracted);
    };

    return (
        <div style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '32px',
            background: 'rgba(28, 22, 20, 0.4)', // Warm M3 container feel
            backdropFilter: 'blur(40px) saturate(180%)', // Frosted glass
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)',
            // Scope dynamic colors locally
            ['--profile-primary' as any]: colors.primary,
            ['--profile-secondary' as any]: colors.secondary,
            ['--profile-glow' as any]: colors.glow,
        }}>
            {/* Dynamic Ambient Glow Spheres (Framer Motion Loop) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'hidden'
            }}>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 0.9, 1.1, 1],
                        rotate: [0, 90, 180, 270, 360],
                        x: [0, 40, -30, 20, 0],
                        y: [0, -30, 40, -10, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        top: '-30%',
                        left: '-20%',
                        width: '90%',
                        height: '90%',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${colors.primary} 0%, rgba(0,0,0,0) 70%)`,
                        filter: 'blur(70px)',
                        opacity: 0.28,
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1.1, 0.85, 1.15, 1, 1.1],
                        rotate: [360, 270, 180, 90, 0],
                        x: [0, -40, 20, -30, 0],
                        y: [0, 40, -20, 30, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '-20%',
                        right: '-20%',
                        width: '80%',
                        height: '80%',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${colors.secondary} 0%, rgba(0,0,0,0) 70%)`,
                        filter: 'blur(60px)',
                        opacity: 0.22,
                    }}
                />
            </div>

            {/* Noise Texture */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
                opacity: 0.15,
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            {/* Content Container */}
            <div className="profile-header-content">
                {/* Vinyl Sleeve Avatar with custom Squircle radii */}
                <div className="avatar-section">
                    <motion.div 
                        className="vinyl-sleeve-wrapper"
                        whileHover={{ 
                            scale: 1.05, 
                            rotate: -3,
                            boxShadow: `0 24px 50px rgba(0,0,0,0.6), 0 0 20px ${colors.glow}`
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                        {avatarUrl && !imgError ? (
                            <div className="sleeve-container">
                                <img
                                    src={avatarUrl}
                                    alt="Profile Avatar"
                                    className="sleeve-image"
                                    referrerPolicy="no-referrer"
                                    onLoad={handleImageLoad}
                                    onError={() => setImgError(true)}
                                />
                                <div className="sleeve-glare" />
                            </div>
                        ) : (
                            <div className="sleeve-container default-avatar">
                                <span style={{ fontSize: '3rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)' }}>
                                    {displayName[0]?.toUpperCase()}
                                </span>
                            </div>
                        )}

                        {/* Status Badge */}
                        {isVerified && (
                            <div style={{
                                position: 'absolute', bottom: '-8px', right: '-8px',
                                background: colors.primary, color: 'rgba(0,0,0,0.85)', borderRadius: '50%',
                                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 20, border: '2px solid #000000'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Profile Info */}
                <div className="info-section">
                    <div className="user-title">
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            textTransform: 'uppercase',
                            fontWeight: 800,
                            letterSpacing: '-0.04em',
                            display: 'inline-block',
                            transform: 'scaleX(1.08)',
                            transformOrigin: 'center'
                        }}>
                            @{profileState.username || 'Music Lover'}
                        </h1>
                        {profileState.full_name && (
                            <p style={{ 
                                margin: '8px 0 0', 
                                color: colors.primary, 
                                fontWeight: 700, 
                                fontSize: '1rem',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}>
                                {profileState.full_name}
                            </p>
                        )}
                    </div>

                    <div className="bio-text">
                        {profileState.bio || "No bio yet. Just vibes."}
                    </div>

                    <div className="stats-row">
                        <motion.div 
                            className="stat-item"
                            whileHover={{ 
                                scale: 1.05, 
                                y: -4, 
                                borderColor: colors.primary,
                                boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 10px ${colors.glow}`
                            }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 350, damping: 15 }}
                        >
                            <span className="stat-val" style={{ color: colors.primary }}>{stats.reviewsCount}</span>
                            <span className="stat-label">REVIEWS</span>
                        </motion.div>
                        <motion.div 
                            className="stat-item"
                            whileHover={{ 
                                scale: 1.05, 
                                y: -4, 
                                borderColor: colors.primary,
                                boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 10px ${colors.glow}`
                            }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 350, damping: 15 }}
                        >
                            <span className="stat-val">{stats.followersCount}</span>
                            <span className="stat-label">FOLLOWERS</span>
                        </motion.div>
                        <motion.div 
                            className="stat-item"
                            whileHover={{ 
                                scale: 1.05, 
                                y: -4, 
                                borderColor: colors.primary,
                                boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 10px ${colors.glow}`
                            }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 350, damping: 15 }}
                        >
                            <span className="stat-val">{stats.followingCount}</span>
                            <span className="stat-label">FOLLOWING</span>
                        </motion.div>
                    </div>

                    <div className="action-row">
                        {!isOwnProfile && currentUser && (
                            <FollowButton targetUserId={targetUserId} initialIsFollowing={isFollowing} />
                        )}
                        {isOwnProfile && (
                            <>
                                <ProfileEditModal
                                    profile={profileState}
                                    onUpdate={(updated) => setProfileState(prev => ({ ...prev, ...updated }))}
                                />
                                <button
                                    onClick={() => isRoastEligible && setIsRoastModalOpen(true)}
                                    className={`roast-inline-btn ${!isRoastEligible ? 'locked' : ''}`}
                                    onMouseEnter={() => setIsRoastHovered(true)}
                                    onMouseLeave={() => setIsRoastHovered(false)}
                                    title={isRoastEligible ? "Roast My Taste" : "Need 5 reviews to roast"}
                                >
                                    {!isRoastEligible && isRoastHovered ? (
                                        <Lock size={16} fill="rgba(255,255,255,0.4)" strokeWidth={2} />
                                    ) : (
                                        <Flame size={16} fill={isRoastEligible ? "#ff8c00" : "rgba(255,255,255,0.4)"} strokeWidth={1.5} />
                                    )}
                                    <span className="roast-btn-text">
                                        {!isRoastEligible && isRoastHovered ? "Locked" : "Roast Me"}
                                    </span>
                                </button>
                                {isRoastEligible && (
                                    <RoastModal
                                        isOpen={isRoastModalOpen}
                                        onClose={() => setIsRoastModalOpen(false)}
                                        userId={profileState.username || 'User'}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-header-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 12px;
                    padding: 24px 20px;
                }

                .avatar-section {
                    flex-shrink: 0;
                    margin-bottom: 4px;
                }
                
                .vinyl-sleeve-wrapper {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                    cursor: pointer;
                }

                .sleeve-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    border-radius: 0;
                    box-shadow: 
                        0 12px 28px rgba(0,0,0,0.5),
                        inset 0 0 0 1px rgba(255,255,255,0.08);
                    overflow: hidden;
                    background: #1c1614;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .sleeve-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .default-avatar {
                    background: linear-gradient(135deg, #27201d, #110b09);
                }
                
                .sleeve-glare {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 100%);
                    pointer-events: none;
                    z-index: 10;
                    mix-blend-mode: screen;
                }

                .info-section {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .user-title h1 {
                    background: linear-gradient(to bottom, #ffffff 30%, #d8c2bb 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                    font-size: 1.6rem;
                }
                
                .bio-text {
                    margin: 8px 0 12px;
                    font-size: 0.85rem;
                    line-height: 1.45;
                    color: var(--md-sys-color-on-surface-variant);
                    max-width: 280px;
                }
                
                .stats-row {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 16px;
                    width: 100%;
                    padding: 0;
                }
                
                :global(.stat-item) {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(17, 11, 9, 0.45);
                    padding: 10px 8px;
                    border-radius: 16px; /* Expressive shape corner */
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    flex: 1;
                    backdrop-filter: blur(10px);
                    cursor: pointer;
                    transition: border-color 0.2s, background-color 0.2s;
                }
                
                .stat-val {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #fff;
                }
                
                .stat-label {
                    font-size: 0.58rem;
                    font-weight: 700;
                    color: var(--md-sys-color-on-surface-variant);
                    letter-spacing: 1px;
                    margin-top: 2px;
                }
                
                .action-row {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                }

                .roast-inline-btn {
                    padding: 8px 16px;
                    flex: 1;
                    min-width: 120px;
                    background: rgba(255, 69, 0, 0.08);
                    border: 1px solid rgba(255, 69, 0, 0.2);
                    border-radius: 12px;
                    color: #ff8c00;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    backdrop-filter: blur(10px);
                    transition: var(--transition-spring);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .roast-inline-btn:hover:not(.locked) {
                    background: linear-gradient(135deg, #ff4500 0%, #ff8c00 100%);
                    color: #fff;
                    border-color: transparent;
                    transform: scale(1.04) translateY(-1px);
                    box-shadow: 0 4px 15px rgba(255, 69, 0, 0.3);
                }

                .roast-inline-btn:active:not(.locked) {
                    transform: scale(0.97);
                }

                .roast-inline-btn.locked {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.3);
                    cursor: not-allowed;
                }

                @media (max-width: 480px) {
                    .user-title h1 {
                        font-size: 1.8rem !important;
                    }
                    .bio-text {
                        font-size: 0.85rem !important;
                        max-width: 280px;
                        margin: 12px 0 20px !important;
                    }
                    .stats-row {
                        gap: 8px !important;
                        margin-bottom: 20px !important;
                    }
                    :global(.stat-item) {
                        padding: 10px 8px !important;
                        border-radius: 16px !important;
                    }
                    .stat-val {
                        font-size: 1.2rem !important;
                    }
                    .stat-label {
                        font-size: 0.6rem !important;
                        letter-spacing: 1px !important;
                    }
                    .vinyl-sleeve-wrapper {
                        width: 140px !important;
                        height: 140px !important;
                    }
                }
            `}</style>
        </div>
    );
}
