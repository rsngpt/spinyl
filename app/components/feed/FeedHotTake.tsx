'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import { HotTakeFeedItem } from '../../actions/feed';
import Link from 'next/link';

interface FeedHotTakeProps {
    item: HotTakeFeedItem;
}

export default function FeedHotTake({ item }: FeedHotTakeProps) {
    return (
        <div className="hot-take-card glass-panel">
            <div className="hot-take-header">
                <span className="hot-take-badge">HOT TAKE</span>
            </div>

            <div className="hot-take-body">
                <Quote className="quote-icon" size={24} />
                <p className="hot-take-content">{item.content}</p>
            </div>

            <div className="hot-take-footer">
                <Link href={`/profile/${(item as any).user_id}`} className="hot-take-user">
                    <div className="mini-avatar">
                        {item.profiles?.avatar_url ? (
                            <img src={item.profiles.avatar_url} alt={item.profiles.username || 'User'} />
                        ) : (
                            <span>{(item.profiles?.username?.[0] || 'U').toUpperCase()}</span>
                        )}
                    </div>
                    <span className="username">@{item.profiles?.username || 'unknown'}</span>
                </Link>
            </div>

            <style jsx>{`
                .hot-take-card {
                    background: linear-gradient(135deg, #1e1e1e 0%, #121212 100%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .hot-take-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    border-color: rgba(255, 25, 25, 0.3);
                }

                .hot-take-header {
                    display: flex;
                    justify-content: flex-start;
                }

                .hot-take-badge {
                    background: #E50914;
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 900;
                    padding: 4px 8px;
                    border-radius: 4px;
                    letter-spacing: 1px;
                }

                .hot-take-body {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    position: relative;
                }

                .quote-icon {
                    color: rgba(229, 9, 20, 0.3);
                    position: absolute;
                    top: -10px;
                    left: -10px;
                }

                .hot-take-content {
                    font-size: 1.1rem;
                    font-weight: 600;
                    line-height: 1.5;
                    color: #fff;
                    margin: 0;
                    z-index: 1;
                }

                .hot-take-footer {
                    margin-top: 8px;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .hot-take-user {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                }

                .mini-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    font-weight: bold;
                    color: #fff;
                }

                .mini-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .username {
                    font-size: 0.85rem;
                    color: #888;
                }

                .hot-take-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100px;
                    height: 100px;
                    background: radial-gradient(circle at top right, rgba(229, 9, 20, 0.1), transparent 70%);
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}
