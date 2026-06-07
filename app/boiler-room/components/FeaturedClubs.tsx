'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

export interface Club {
    id: string;
    icon: string;
    name: string;
    description: string;
    memberCount: number;
    activeDiscussionsCount: number;
    joined: boolean;
}

interface FeaturedClubsProps {
    clubs: Club[];
    onToggleJoin: (id: string) => void;
    onClickClub: (id: string) => void;
}

const CLUB_BANNERS: Record<string, string> = {
    'club-1': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', // Hip-Hop
    'club-2': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', // Indie
    'club-3': 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=600&auto=format&fit=crop&q=80'  // Bollywood
};

const CLUB_CREATORS: Record<string, string> = {
    'club-1': 'Grandmaster Flash',
    'club-2': 'Bedroom Pop Co.',
    'club-3': 'Moctale Official'
};

export default function FeaturedClubs({ clubs, onClickClub }: FeaturedClubsProps) {
    return (
        <div className="featured-clubs-section">
            <h3 className="section-title">Featured Clubs</h3>
            
            {clubs.length > 0 ? (
                <div className="clubs-grid">
                    {clubs.map((club) => {
                        const coverImg = CLUB_BANNERS[club.id] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
                        const creator = CLUB_CREATORS[club.id] || 'Spinyl Staff';

                        return (
                            <div
                                key={club.id}
                                onClick={() => onClickClub(club.id)}
                                className="club-card"
                            >
                                {/* Spider-Man 2 style banner cover */}
                                <div className="card-cover-wrapper">
                                    <img src={coverImg} alt={club.name} className="card-cover-img" />
                                </div>

                                <div className="card-body">
                                    <div className="card-content-row">
                                        <div className="text-details">
                                            <h4 className="club-name">{club.name}</h4>
                                            <p className="club-description">{club.description}</p>
                                        </div>

                                        {/* Conversation speech bubble button */}
                                        <button className="chat-indicator-btn">
                                            <MessageSquare size={16} color="#fff" />
                                        </button>
                                    </div>

                                    {/* Footer metadata line */}
                                    <div className="card-footer-meta">
                                        <span>By {creator}</span>
                                        <span className="dot">•</span>
                                        <span>{club.memberCount.toLocaleString()} members</span>
                                        <span className="dot">•</span>
                                        <span>{club.activeDiscussionsCount} active threads</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="no-results">
                    <p>No featured clubs match your search.</p>
                </div>
            )}

            <style jsx>{`
                .featured-clubs-section {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 100%;
                }

                .section-title {
                    font-size: 1.35rem;
                    font-weight: 850;
                    color: #fff;
                    letter-spacing: -0.02em;
                    margin-bottom: 4px;
                }

                .clubs-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 28px;
                }

                .club-card {
                    background: #000;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: var(--md-shape-corner-extra-large);
                    display: flex;
                    flex-direction: column;
                    transition: var(--transition-spring);
                    overflow: hidden;
                    cursor: pointer;
                    width: 100%;
                }

                .club-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
                }

                .card-cover-wrapper {
                    width: 100%;
                    height: 280px;
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
                    padding: 20px 24px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .card-content-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 24px;
                }

                .text-details {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }

                .club-name {
                    font-size: 1.25rem;
                    font-weight: 850;
                    color: #fff;
                    letter-spacing: -0.02em;
                }

                .club-description {
                    font-size: 0.95rem;
                    color: rgba(255, 255, 255, 0.6);
                    line-height: 1.5;
                }

                .chat-indicator-btn {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    width: 44px;
                    height: 44px;
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
                    gap: 8px;
                    font-size: 0.82rem;
                    color: rgba(255, 255, 255, 0.4);
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
                    padding: 32px;
                    text-align: center;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
}
