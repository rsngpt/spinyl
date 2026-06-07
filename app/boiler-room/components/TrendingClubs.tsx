'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Club } from './FeaturedClubs';

interface TrendingClubsProps {
    clubs: Club[];
    onToggleJoin: (id: string) => void;
    onClickClub: (id: string) => void;
}

const CLUB_BANNERS: Record<string, string> = {
    'club-4': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', // Electronic
    'club-5': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80', // Producers
    'club-6': 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&auto=format&fit=crop&q=80'  // Vinyl
};

const CLUB_CREATORS: Record<string, string> = {
    'club-4': 'Daedalus DJ',
    'club-5': 'Ableton User Club',
    'club-6': 'Physical Records Org'
};

export default function TrendingClubs({ clubs, onClickClub }: TrendingClubsProps) {
    return (
        <div className="trending-clubs-section">
            <h3 className="section-title">Trending Clubs</h3>

            {clubs.length > 0 ? (
                <div className="clubs-grid">
                    {clubs.map((club) => {
                        const coverImg = CLUB_BANNERS[club.id] || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80';
                        const creator = CLUB_CREATORS[club.id] || 'Spinyl Staff';

                        return (
                            <div
                                key={club.id}
                                onClick={() => onClickClub(club.id)}
                                className="club-card"
                            >
                                {/* Cover Banner Image */}
                                <div className="card-cover-wrapper">
                                    <img src={coverImg} alt={club.name} className="card-cover-img" />
                                </div>

                                <div className="card-body">
                                    <div className="card-content-row">
                                        <div className="text-details">
                                            <h4 className="club-name">{club.name}</h4>
                                            <p className="club-description">{club.description}</p>
                                        </div>

                                        {/* Conversation Indicator Circle */}
                                        <button className="chat-indicator-btn">
                                            <MessageSquare size={14} color="#fff" />
                                        </button>
                                    </div>

                                    {/* Footer metadata */}
                                    <div className="card-footer-meta">
                                        <span>By {creator}</span>
                                        <span className="dot">•</span>
                                        <span>{club.memberCount.toLocaleString()} members</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="no-results">
                    <p>No trending clubs match your search.</p>
                </div>
            )}

            <style jsx>{`
                .trending-clubs-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 100%;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.02em;
                    margin-bottom: 4px;
                }

                .clubs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                }

                .club-card {
                    background: #000;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--md-shape-corner-extra-large);
                    display: flex;
                    flex-direction: column;
                    transition: var(--transition-spring);
                    overflow: hidden;
                    cursor: pointer;
                }

                .club-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(255, 255, 255, 0.12);
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
                }

                .card-cover-wrapper {
                    width: 100%;
                    height: 180px;
                    overflow: hidden;
                    position: relative;
                }

                .card-cover-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
                }

                .club-card:hover .card-cover-img {
                    transform: scale(1.03);
                }

                .card-body {
                    padding: 16px 18px 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .card-content-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                }

                .text-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    flex: 1;
                }

                .club-name {
                    font-size: 1.1rem;
                    font-weight: 850;
                    color: #fff;
                    letter-spacing: -0.02em;
                }

                .club-description {
                    font-size: 0.88rem;
                    color: rgba(255, 255, 255, 0.6);
                    line-height: 1.45;
                }

                .chat-indicator-btn {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: var(--transition-spring);
                    flex-shrink: 0;
                }

                .club-card:hover .chat-indicator-btn {
                    background: #fff;
                }
                
                .club-card:hover .chat-indicator-btn :global(svg) {
                    color: #000 !important;
                }

                .card-footer-meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.78rem;
                    color: rgba(255, 255, 255, 0.45);
                    font-weight: 600;
                    flex-wrap: wrap;
                }

                .dot {
                    opacity: 0.5;
                }

                .no-results {
                    background: rgba(255,255,255,0.01);
                    border: 1px dashed rgba(255,255,255,0.08);
                    border-radius: var(--md-shape-corner-large);
                    padding: 24px;
                    text-align: center;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.85rem;
                }
            `}</style>
        </div>
    );
}
