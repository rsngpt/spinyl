'use client';

import React, { useState } from 'react';
import { Disc, Users, MessageSquare, Clock, ArrowRight, Star, Heart } from 'lucide-react';

export interface AlbumClubData {
    album: string;
    artist: string;
    year: number;
    genres: string[];
    listeners: number;
    reviews: number;
    discussions: number;
    daysRemaining: number;
    completionRate: number;
    featuredTopic: string;
}

interface AlbumClubCardProps {
    data: AlbumClubData;
    onJoin?: () => void;
    onViewAlbum?: () => void;
}

export default function AlbumClubCard({ data, onJoin, onViewAlbum }: AlbumClubCardProps) {
    const [isJoined, setIsJoined] = useState(false);

    const handleJoinClick = () => {
        setIsJoined(!isJoined);
        if (onJoin) onJoin();
    };

    return (
        <div className="album-club-card">
            {/* Header Title */}
            <div className="card-header">
                <Disc className="disc-icon-rotating" size={18} color="#ba68c8" />
                <h4>Album Club</h4>
            </div>

            {/* Featured Album Cover (Large CSS Gradient Artwork) */}
            <div className="cover-art-wrapper" onClick={onViewAlbum}>
                <div className="cover-gradient-bg">
                    {/* Semi-transparent vinyl peeking out */}
                    <div className="vinyl-peeking">
                        <div className="vinyl-groove" />
                        <div className="vinyl-groove second" />
                        <div className="vinyl-center" />
                    </div>
                    
                    <div className="cover-overlay">
                        <span className="album-title-text">{data.album}</span>
                        <span className="artist-subtext">by {data.artist}</span>
                        <div className="cover-music-bar-container">
                            <span className="music-bar" style={{ animationDelay: '0.1s' }} />
                            <span className="music-bar" style={{ animationDelay: '0.4s' }} />
                            <span className="music-bar" style={{ animationDelay: '0.2s' }} />
                            <span className="music-bar" style={{ animationDelay: '0.6s' }} />
                            <span className="music-bar" style={{ animationDelay: '0.3s' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Album Information */}
            <div className="album-info-section">
                <div className="title-row">
                    <h3>{data.album}</h3>
                    <span className="release-year">{data.year}</span>
                </div>
                <p className="artist-name">{data.artist}</p>
                
                {/* Genre Tags */}
                <div className="genre-tags-row">
                    {data.genres.map((genre) => (
                        <span key={genre} className="genre-tag">
                            #{genre.replace(/\s+/g, '')}
                        </span>
                    ))}
                </div>
            </div>

            {/* Community Stats Badge Grid */}
            <div className="stats-badge-grid">
                <div className="stat-badge">
                    <Users size={12} color="#64b5f6" />
                    <span>{data.listeners + (isJoined ? 1 : 0)} listeners joined</span>
                </div>
                <div className="stat-badge">
                    <MessageSquare size={12} color="#4db6ac" />
                    <span>{data.reviews} reviews</span>
                </div>
                <div className="stat-badge">
                    <MessageSquare size={12} color="#ffb74d" />
                    <span>{data.discussions} discussions</span>
                </div>
                <div className="stat-badge">
                    <Clock size={12} color="#f06292" />
                    <span>{data.daysRemaining} days remaining</span>
                </div>
            </div>

            {/* Progress Section */}
            <div className="progress-section">
                <div className="progress-header">
                    <span>Album Club Progress</span>
                    <span className="progress-percent-label">{data.completionRate}%</span>
                </div>
                <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${data.completionRate}%` }} />
                </div>
                <span className="progress-subtext">
                    {data.listeners + (isJoined ? 1 : 0)} / 575 participants completed listening
                </span>
            </div>

            {/* Featured Discussion Box */}
            <div className="featured-discussion-box">
                <div className="discussion-header">
                    <span className="mic-icon">🎙</span>
                    <h5>Featured Discussion</h5>
                </div>
                <p className="discussion-prompt">
                    "{data.featuredTopic}"
                </p>
                <div className="discussion-footer">
                    <span className="participants-count">{data.discussions} participants</span>
                    <button className="view-discussion-link" onClick={onViewAlbum}>
                        <span>View Discussion</span>
                        <ArrowRight size={12} />
                    </button>
                </div>
            </div>

            {/* Member Preview Avatars */}
            <div className="member-preview-row">
                <div className="avatar-overlap-group">
                    <div className="avatar-preview bg-p1">K</div>
                    <div className="avatar-preview bg-p2">S</div>
                    <div className="avatar-preview bg-p3">A</div>
                    <div className="avatar-preview bg-p4">R</div>
                </div>
                <span className="members-indicator">
                    +{data.listeners + (isJoined ? 1 : 0)} participants
                </span>
            </div>

            {/* CTA Buttons */}
            <div className="cta-actions-row">
                <button 
                    onClick={handleJoinClick} 
                    className={`join-club-btn ${isJoined ? 'joined' : ''}`}
                >
                    {isJoined ? 'Joined Club' : 'Join Album Club'}
                </button>
                <button onClick={onViewAlbum} className="view-album-page-btn">
                    View Album Page
                </button>
            </div>

            <style jsx>{`
                .album-club-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4),
                                0 0 20px rgba(186, 104, 200, 0.02),
                                0 0 40px rgba(100, 181, 246, 0.01);
                    position: relative;
                    overflow: hidden;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }

                .album-club-card:hover {
                    border-color: rgba(186, 104, 200, 0.15);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5),
                                0 0 30px rgba(186, 104, 200, 0.06),
                                0 0 50px rgba(100, 181, 246, 0.03);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    padding-bottom: 12px;
                }

                .card-header h4 {
                    font-size: 0.95rem;
                    font-weight: 850;
                    color: #fff;
                    letter-spacing: -0.01em;
                    text-transform: uppercase;
                    opacity: 0.9;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .disc-icon-rotating {
                    animation: spin 6s linear infinite;
                }

                /* Featured Album Cover (CSS Gradient) */
                .cover-art-wrapper {
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: var(--md-shape-corner-large);
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: #000;
                }

                .cover-gradient-bg {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #09090b 0%, #1e1b4b 25%, #3b0764 65%, #831843 100%);
                    position: relative;
                    display: flex;
                    align-items: flex-end;
                    padding: 20px;
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .cover-art-wrapper:hover .cover-gradient-bg {
                    transform: scale(1.03);
                }

                /* Mini vinyl disc peeking animation */
                .vinyl-peeking {
                    position: absolute;
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    background: #09090b;
                    border: 4px solid #18181b;
                    top: 15px;
                    right: -45px;
                    opacity: 0.25;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
                    transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
                }

                .cover-art-wrapper:hover .vinyl-peeking {
                    right: -25px;
                    opacity: 0.45;
                }

                .vinyl-groove {
                    position: absolute;
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    border: 1px dashed rgba(255, 255, 255, 0.05);
                }

                .vinyl-groove.second {
                    width: 100px;
                    height: 100px;
                }

                .vinyl-center {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #3f3f46;
                    border: 8px solid #27272a;
                }

                .cover-overlay {
                    display: flex;
                    flex-direction: column;
                    z-index: 2;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
                }

                .album-title-text {
                    font-size: 1.6rem;
                    font-weight: 900;
                    color: #fff;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                }

                .artist-subtext {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.7);
                    font-weight: 500;
                    margin-top: 4px;
                }

                .cover-music-bar-container {
                    display: flex;
                    gap: 3px;
                    height: 16px;
                    align-items: flex-end;
                    margin-top: 12px;
                }

                .music-bar {
                    width: 3px;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 2px;
                    animation: dance 1.2s ease-in-out infinite alternate;
                }

                @keyframes dance {
                    0% { height: 20%; }
                    100% { height: 100%; }
                }

                /* Album Info */
                .album-info-section {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .title-row h3 {
                    font-size: 1.25rem;
                    font-weight: 850;
                    color: #fff;
                    margin: 0;
                    letter-spacing: -0.01em;
                }

                .release-year {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 600;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 2px 8px;
                    border-radius: var(--md-shape-corner-small);
                }

                .artist-name {
                    font-size: 0.92rem;
                    color: rgba(255, 255, 255, 0.65);
                    margin: 0;
                    font-weight: 600;
                }

                .genre-tags-row {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 4px;
                }

                .genre-tag {
                    font-size: 0.76rem;
                    color: rgba(186, 104, 200, 0.85);
                    font-weight: 700;
                }

                /* Stats Badge Grid */
                .stats-badge-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .stat-badge {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    border-radius: var(--md-shape-corner-medium);
                    padding: 8px 10px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.78rem;
                    color: rgba(255, 255, 255, 0.7);
                    font-weight: 600;
                }

                /* Progress Section */
                .progress-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.02);
                    border-radius: var(--md-shape-corner-large);
                    padding: 12px;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    font-weight: 750;
                    color: rgba(255, 255, 255, 0.85);
                }

                .progress-percent-label {
                    color: #ba68c8;
                }

                .progress-bar-track {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                    overflow: hidden;
                    position: relative;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #ba68c8, #64b5f6);
                    border-radius: 3px;
                    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .progress-subtext {
                    font-size: 0.72rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 500;
                }

                /* Featured Discussion Box */
                .featured-discussion-box {
                    background: rgba(186, 104, 200, 0.03);
                    border: 1px solid rgba(186, 104, 200, 0.08);
                    border-radius: var(--md-shape-corner-large);
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .discussion-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .mic-icon {
                    font-size: 0.9rem;
                }

                .discussion-header h5 {
                    font-size: 0.82rem;
                    font-weight: 800;
                    color: #ba68c8;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .discussion-prompt {
                    font-size: 0.88rem;
                    color: #fff;
                    line-height: 1.4;
                    font-weight: 700;
                    margin: 0;
                    font-style: italic;
                }

                .discussion-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 4px;
                }

                .participants-count {
                    font-size: 0.74rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 600;
                }

                .view-discussion-link {
                    background: transparent;
                    border: none;
                    color: #ba68c8;
                    font-size: 0.76rem;
                    font-weight: 750;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 0;
                    transition: color 0.2s ease, transform 0.2s ease;
                }

                .view-discussion-link:hover {
                    color: #e040fb;
                    transform: translateX(2px);
                }

                /* Member Preview */
                .member-preview-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .avatar-overlap-group {
                    display: flex;
                    align-items: center;
                }

                .avatar-preview {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 1.5px solid #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.6rem;
                    font-weight: 850;
                    color: #fff;
                    margin-right: -6px;
                    flex-shrink: 0;
                }

                .bg-p1 { background: #e57373; }
                .bg-p2 { background: #81c784; }
                .bg-p3 { background: #64b5f6; }
                .bg-p4 { background: #ffd54f; }

                .members-indicator {
                    font-size: 0.74rem;
                    color: rgba(255, 255, 255, 0.45);
                    font-weight: 600;
                }

                /* CTA Actions */
                .cta-actions-row {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 8px;
                }

                .join-club-btn {
                    background: #fff;
                    border: none;
                    color: #000;
                    font-weight: 800;
                    font-size: 0.88rem;
                    padding: 12px;
                    border-radius: var(--md-shape-corner-full);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.05);
                }

                .join-club-btn:hover {
                    background: #e3e3e3;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
                }

                .join-club-btn.joined {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #fff;
                }

                .join-club-btn.joined:hover {
                    background: rgba(255, 255, 255, 0.12);
                    box-shadow: none;
                    transform: none;
                }

                .view-album-page-btn {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: rgba(255, 255, 255, 0.85);
                    font-weight: 750;
                    font-size: 0.88rem;
                    padding: 11px;
                    border-radius: var(--md-shape-corner-full);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                }

                .view-album-page-btn:hover {
                    border-color: rgba(255, 255, 255, 0.3);
                    background: rgba(255, 255, 255, 0.03);
                    color: #fff;
                }
            `}</style>
        </div>
    );
}
