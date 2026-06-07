'use client';

import React, { useState } from 'react';
import { Trophy, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlbumRankItem {
    rank: number;
    title: string;
    artist: string;
    rating: string;
    coverGradient: string;
}

const BOLLYWOOD_RANKS: AlbumRankItem[] = [
    { rank: 1, title: 'Rockstar', artist: 'A. R. Rahman', rating: '9.8', coverGradient: 'linear-gradient(135deg, #f44336, #e91e63)' },
    { rank: 2, title: 'Guru', artist: 'A. R. Rahman', rating: '9.4', coverGradient: 'linear-gradient(135deg, #009688, #4caf50)' },
    { rank: 3, title: 'Dil Se', artist: 'A. R. Rahman', rating: '9.1', coverGradient: 'linear-gradient(135deg, #3f51b5, #2196f3)' },
    { rank: 4, title: 'Yeh Jawaani Hai Deewani', artist: 'Pritam', rating: '8.9', coverGradient: 'linear-gradient(135deg, #ff9800, #ff5722)' }
];

const INDIE_RANKS: AlbumRankItem[] = [
    { rank: 1, title: 'Melodrama', artist: 'Lorde', rating: '9.6', coverGradient: 'linear-gradient(135deg, #1a237e, #311b92)' },
    { rank: 2, title: 'Punisher', artist: 'Phoebe Bridgers', rating: '9.3', coverGradient: 'linear-gradient(135deg, #263238, #4f5b66)' },
    { rank: 3, title: 'Blonde', artist: 'Frank Ocean', rating: '9.1', coverGradient: 'linear-gradient(135deg, #00c853, #b2ff59)' },
    { rank: 4, title: 'Currents', artist: 'Tame Impala', rating: '9.0', coverGradient: 'linear-gradient(135deg, #aa00ff, #ea80fc)' }
];

const DEBUT_RANKS: AlbumRankItem[] = [
    { rank: 1, title: 'Illmatic', artist: 'Nas', rating: '9.9', coverGradient: 'linear-gradient(135deg, #bf360c, #ff5722)' },
    { rank: 2, title: 'Channel Orange', artist: 'Frank Ocean', rating: '9.5', coverGradient: 'linear-gradient(135deg, #ff6f00, #ffb300)' },
    { rank: 3, title: 'Please Please Me', artist: 'The Beatles', rating: '9.2', coverGradient: 'linear-gradient(135deg, #01579b, #03a9f4)' },
    { rank: 4, title: 'Hybrid Theory', artist: 'Linkin Park', rating: '9.1', coverGradient: 'linear-gradient(135deg, #212121, #757575)' }
];

export default function Rankings() {
    const [activeTab, setActiveTab] = useState<'bollywood' | 'indie' | 'debut'>('bollywood');

    const getRankList = () => {
        switch (activeTab) {
            case 'bollywood': return BOLLYWOOD_RANKS;
            case 'indie': return INDIE_RANKS;
            case 'debut': return DEBUT_RANKS;
        }
    };

    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1: return { bg: 'gold', text: '#000', label: '1' };
            case 2: return { bg: '#c0c0c0', text: '#000', label: '2' };
            case 3: return { bg: '#cd7f32', text: '#fff', label: '3' };
            default: return { bg: 'rgba(255, 255, 255, 0.05)', text: '#aaa', label: String(rank) };
        }
    };

    return (
        <div className="rankings-card">
            <div className="card-header">
                <Trophy size={18} color="#ffd54f" />
                <h4>Rankings</h4>
            </div>

            {/* Inner category tabs */}
            <div className="tabs-header">
                <button
                    onClick={() => setActiveTab('bollywood')}
                    className={`tab-btn ${activeTab === 'bollywood' ? 'active' : ''}`}
                >
                    Bollywood
                </button>
                <button
                    onClick={() => setActiveTab('indie')}
                    className={`tab-btn ${activeTab === 'indie' ? 'active' : ''}`}
                >
                    Indie
                </button>
                <button
                    onClick={() => setActiveTab('debut')}
                    className={`tab-btn ${activeTab === 'debut' ? 'active' : ''}`}
                >
                    Debuts
                </button>
            </div>

            <div className="list-wrapper">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="rankings-list"
                    >
                        {getRankList().map((item) => {
                            const badge = getRankBadgeColor(item.rank);

                            return (
                                <div key={item.title} className="rank-item">
                                    <div
                                        className="rank-number"
                                        style={{
                                            backgroundColor: badge.bg,
                                            color: badge.text
                                        }}
                                    >
                                        {badge.label}
                                    </div>

                                    {/* Mock album cover art */}
                                    <div
                                        className="album-cover-placeholder"
                                        style={{ background: item.coverGradient }}
                                    >
                                        <div className="vinyl-groove" />
                                    </div>

                                    <div className="album-info">
                                        <span className="album-title">{item.title}</span>
                                        <span className="album-artist">{item.artist}</span>
                                    </div>

                                    <div className="album-rating">
                                        <Flame size={12} color="var(--md-sys-color-primary)" />
                                        <span>{item.rating}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            <style jsx>{`
                .rankings-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    backdrop-filter: blur(12px);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .card-header h4 {
                    font-size: 1rem;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.01em;
                }

                .tabs-header {
                    display: flex;
                    gap: 4px;
                    background: rgba(255, 255, 255, 0.02);
                    padding: 4px;
                    border-radius: var(--md-shape-corner-medium);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                }

                .tab-btn {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    padding: 6px 0;
                    border-radius: var(--md-shape-corner-small);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .tab-btn:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.03);
                }

                .tab-btn.active {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
                }

                .list-wrapper {
                    min-height: 200px;
                }

                .rankings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .rank-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    border-radius: var(--md-shape-corner-large);
                    padding: 10px 12px;
                    transition: var(--transition);
                }

                .rank-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.08);
                    transform: translateX(4px);
                }

                .rank-number {
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 800;
                    flex-shrink: 0;
                }

                .album-cover-placeholder {
                    width: 38px;
                    height: 38px;
                    border-radius: var(--md-shape-corner-medium);
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    flex-shrink: 0;
                }

                .vinyl-groove {
                    position: absolute;
                    top: 10%;
                    left: 10%;
                    width: 80%;
                    height: 80%;
                    border-radius: 50%;
                    border: 1px dashed rgba(255, 255, 255, 0.15);
                    opacity: 0.5;
                }

                .album-info {
                    flex: 1;
                    min-width: 0;
                }

                .album-title {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .album-artist {
                    display: block;
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.4);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .album-rating {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: rgba(255, 255, 255, 0.03);
                    padding: 4px 8px;
                    border-radius: var(--md-shape-corner-full);
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: var(--md-sys-color-primary);
                }
            `}</style>
        </div>
    );
}
