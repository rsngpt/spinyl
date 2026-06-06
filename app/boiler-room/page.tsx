'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Radio, Users, Heart, Disc, MapPin, Music } from 'lucide-react';

type DJSet = {
    id: string;
    title: string;
    dj: string;
    venue: string;
    listeners: number;
    genre: string;
    cover: string;
    tracks: { number: number; name: string; artist: string; time: string }[];
};

const DJ_SETS: DJSet[] = [
    {
        id: '1',
        title: 'Spinyl Underground Session',
        dj: 'DJ Spinyl',
        venue: 'The Sub-Basement, London',
        listeners: 1240,
        genre: 'Techno / Industrial',
        cover: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?q=80&w=600&auto=format&fit=crop',
        tracks: [
            { number: 1, name: 'Phonograph Rhythm', artist: 'Vinyl Junkie', time: '4:15' },
            { number: 2, name: 'Sub-Bass Tunnel', artist: 'London Core', time: '3:50' },
            { number: 3, name: 'Modular Darkness', artist: 'Analog Echo', time: '4:45' },
            { number: 4, name: 'Spinning Frequency', artist: 'Groove Splicer', time: '5:10' }
        ]
    },
    {
        id: '2',
        title: 'Neon Sky Livestream',
        dj: 'Aura',
        venue: 'District 9 Rooftop, Tokyo',
        listeners: 3105,
        genre: 'Deep House / Synthwave',
        cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
        tracks: [
            { number: 1, name: 'Midnight Cruising', artist: 'Tokyo Outrunner', time: '3:45' },
            { number: 2, name: 'Shibuya Neon Lights', artist: 'Aura', time: '4:12' },
            { number: 3, name: 'Analog Waveforms', artist: 'Retro Future', time: '3:50' }
        ]
    },
    {
        id: '3',
        title: 'Ambient Dust & Static',
        dj: 'Cortex',
        venue: 'Abandoned Observatory, Atacama',
        listeners: 842,
        genre: 'Ambient / Lo-Fi Beats',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
        tracks: [
            { number: 1, name: 'Stellar Wind', artist: 'Cosmic Noise', time: '5:30' },
            { number: 2, name: 'Observatory Dust', artist: 'Cortex', time: '6:45' },
            { number: 3, name: 'Deep Nebula', artist: 'Solar Flare', time: '7:12' }
        ]
    }
];

export default function BoilerRoomPage() {
    const [activeSet, setActiveSet] = useState<DJSet>(DJ_SETS[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    const [barHeights, setBarHeights] = useState<number[]>(Array.from({ length: 24 }, () => 8));

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying) {
            timer = setInterval(() => {
                setBarHeights(Array.from({ length: 24 }, () => Math.floor(Math.random() * 40) + 4));
            }, 100);
        } else {
            setBarHeights(Array.from({ length: 24 }, () => 8));
        }
        return () => clearInterval(timer);
    }, [isPlaying]);

    return (
        <main className="boiler-room-page">
            <div className="club-ambient-bg" style={{ '--set-color': activeSet.id === '1' ? '#a855f7' : activeSet.id === '2' ? '#3b82f6' : '#10b981' } as React.CSSProperties} />

            <div className="boiler-container">
                {/* Header */}
                <div className="boiler-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                        <span className="live-dot" />
                        <span className="live-label">LIVE BROADCAST FEED</span>
                    </div>
                    <h1 className="boiler-title">Boiler Room</h1>
                    <p className="boiler-subtitle">Experience live DJ sessions and underground vinyl streams from across the globe.</p>
                </div>

                {/* Main Player Display */}
                <div className="player-showcase-panel">
                    <div className="deck-visualizer-container">
                        {/* Cover Image */}
                        <div className="cover-wrapper">
                            <img src={activeSet.cover} alt={activeSet.title} className="cover-art" />
                            {/* Spinning Disc (Peeking Out) */}
                            <div className={`vinyl-disc ${isPlaying ? 'spinning' : ''}`}>
                                <div className="vinyl-center" style={{ backgroundImage: `url(${activeSet.cover})` }} />
                            </div>
                        </div>

                        {/* Visualizer Wave */}
                        <div className="visualizer-bars">
                            {barHeights.map((h, i) => (
                                <div
                                    key={i}
                                    className="wave-bar"
                                    style={{
                                        height: `${h}px`,
                                        backgroundColor: activeSet.id === '1' ? '#c084fc' : activeSet.id === '2' ? '#60a5fa' : '#34d399'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Active Set Meta */}
                    <div className="active-set-meta">
                        <div className="meta-left">
                            <span className="set-dj">{activeSet.dj}</span>
                            <h2 className="set-title">{activeSet.title}</h2>
                            <div className="location-row">
                                <MapPin size={14} color="rgba(255,255,255,0.4)" />
                                <span>{activeSet.venue}</span>
                            </div>
                        </div>

                        <div className="meta-right">
                            <button className="play-control-btn" onClick={() => setIsPlaying(!isPlaying)}>
                                {isPlaying ? <Pause size={24} fill="#000" /> : <Play size={24} fill="#000" style={{ transform: 'translateX(1px)' }} />}
                            </button>
                        </div>
                    </div>

                    {/* Stats pills */}
                    <div className="stats-row">
                        <div className="stat-pill">
                            <Radio size={14} color="var(--primary)" />
                            <span>{activeSet.genre}</span>
                        </div>
                        <div className="stat-pill">
                            <Users size={14} color="#a855f7" />
                            <span>{activeSet.listeners.toLocaleString()} tuning in</span>
                        </div>
                        <button className={`stat-pill like-btn ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)}>
                            <Heart size={14} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#fff'} />
                            <span>{liked ? 'Liked' : 'Like'}</span>
                        </button>
                    </div>
                </div>

                {/* Grid Layout of Tracks & Other Sessions */}
                <div className="tracks-sessions-grid">
                    {/* Tracklist */}
                    <div className="glass-card">
                        <div className="card-header">
                            <Music size={16} />
                            <h3>Session Tracklist</h3>
                        </div>
                        <div className="track-list">
                            {activeSet.tracks.map((t) => (
                                <div key={t.number} className="track-item">
                                    <span className="track-num">{t.number}</span>
                                    <div className="track-info">
                                        <span className="name">{t.name}</span>
                                        <span className="artist">{t.artist}</span>
                                    </div>
                                    <span className="duration">{t.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Other Sessions */}
                    <div className="glass-card">
                        <div className="card-header">
                            <Disc size={16} />
                            <h3>Other Live Broadcasts</h3>
                        </div>
                        <div className="sessions-list">
                            {DJ_SETS.map((s) => (
                                <div
                                    key={s.id}
                                    className={`session-item ${activeSet.id === s.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveSet(s);
                                        setIsPlaying(false);
                                        setLiked(false);
                                    }}
                                >
                                    <div className="session-cover" style={{ backgroundImage: `url(${s.cover})` }} />
                                    <div className="session-info">
                                        <span className="dj">{s.dj}</span>
                                        <span className="title">{s.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .boiler-room-page {
                    min-height: 100vh;
                    padding-top: 110px;
                    padding-bottom: 80px;
                    background: #050505;
                    color: #fff;
                    position: relative;
                    overflow: hidden;
                    box-sizing: border-box;
                }

                .club-ambient-bg {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 50% 20%, var(--set-color, #a855f7) 0%, rgba(5,5,5,0) 70%);
                    opacity: 0.12;
                    filter: blur(100px);
                    z-index: 0;
                    pointer-events: none;
                    transition: background 1.2s ease;
                }

                .boiler-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 24px;
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                /* Header */
                .boiler-header {
                    text-align: center;
                }

                .live-dot {
                    width: 6px;
                    height: 6px;
                    background-color: #ef4444;
                    border-radius: 50%;
                    animation: pulse-dot 1.5s ease-in-out infinite;
                }

                .live-label {
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    color: #ef4444;
                }

                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.3); }
                }

                .boiler-title {
                    font-size: 2.8rem;
                    font-weight: 900;
                    letter-spacing: -1px;
                    margin: 4px 0 12px;
                    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .boiler-subtitle {
                    color: rgba(255,255,255,0.5);
                    font-size: 1rem;
                    max-width: 500px;
                    margin: 0 auto;
                    line-height: 1.5;
                }

                /* Showcase Panel */
                .player-showcase-panel {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    padding: 32px;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
                }

                .deck-visualizer-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    gap: 40px;
                }

                .cover-wrapper {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    flex-shrink: 0;
                }

                .cover-art {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 8px;
                    z-index: 10;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 8px 8px 24px rgba(0,0,0,0.5);
                }

                .vinyl-disc {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #333, #050505);
                    z-index: 5;
                    left: 5%;
                    transition: left 0.8s cubic-bezier(0.25, 1, 0.5, 1);
                    box-shadow: inset 0 0 0 2px rgba(255,255,255,0.05);
                }

                .vinyl-disc.spinning {
                    left: 45%;
                    animation: spin-vinyl 8s linear infinite;
                }

                .vinyl-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background-size: cover;
                    background-position: center;
                    border: 1.5px solid #000;
                }

                @keyframes spin-vinyl {
                    to { transform: rotate(360deg); }
                }

                .visualizer-bars {
                    display: flex;
                    align-items: flex-end;
                    gap: 3px;
                    height: 50px;
                    flex: 1;
                }

                .wave-bar {
                    width: 3px;
                    height: 8px;
                    border-radius: 4px;
                    transition: height 0.1s ease;
                }

                .active-set-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    padding-top: 24px;
                    margin-bottom: 20px;
                    gap: 20px;
                }

                .set-dj {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .set-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin: 4px 0 8px;
                    letter-spacing: -0.3px;
                }

                .location-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.5);
                }

                .play-control-btn {
                    width: 58px;
                    height: 58px;
                    border-radius: 50%;
                    background: #fff;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(255,255,255,0.2);
                    transition: all 0.2s;
                }

                .play-control-btn:hover {
                    transform: scale(1.06);
                    background: var(--primary);
                }

                .stats-row {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .stat-pill {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.7);
                    transition: all 0.2s;
                }

                .stat-pill.like-btn {
                    cursor: pointer;
                    background: rgba(255,255,255,0.06);
                }

                .stat-pill.like-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }

                .stat-pill.like-btn.liked {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }

                /* Grid Section */
                .tracks-sessions-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 24px;
                }

                .glass-card {
                    background: rgba(255,255,255,0.01);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 20px;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 12px;
                }

                .card-header h3 {
                    font-size: 0.95rem;
                    font-weight: 800;
                    margin: 0;
                    letter-spacing: -0.1px;
                }

                .track-list, .sessions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .track-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 14px;
                    background: rgba(255,255,255,0.01);
                    border-radius: 8px;
                    font-size: 0.85rem;
                }

                .track-num {
                    width: 24px;
                    font-weight: 800;
                    color: rgba(255,255,255,0.25);
                }

                .track-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    padding-right: 12px;
                }

                .track-info .name {
                    font-weight: 700;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .track-info .artist {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.45);
                    margin-top: 1px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .track-item .duration {
                    color: rgba(255,255,255,0.4);
                    font-weight: 500;
                }

                /* Sessions list item */
                .session-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }

                .session-item:hover {
                    background: rgba(255,255,255,0.03);
                }

                .session-item.active {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(255,255,255,0.06);
                }

                .session-cover {
                    width: 40px;
                    height: 40px;
                    border-radius: 6px;
                    background-size: cover;
                    background-position: center;
                    flex-shrink: 0;
                }

                .session-info {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .session-info .dj {
                    font-weight: 800;
                    font-size: 0.85rem;
                    color: #fff;
                }

                .session-info .title {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.45);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-top: 1px;
                }

                @media (max-width: 820px) {
                    .tracks-sessions-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }

                @media (max-width: 640px) {
                    .deck-visualizer-container {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }
                    .visualizer-bars {
                        width: 100%;
                    }
                    .boiler-title {
                        font-size: 2.2rem;
                    }
                }

                @media (max-width: 768px) {
                    .boiler-room-page {
                        padding-top: 80px;
                        padding-bottom: calc(80px + env(safe-area-inset-bottom) + 24px);
                    }
                }
            `}</style>
        </main>
    );
}
