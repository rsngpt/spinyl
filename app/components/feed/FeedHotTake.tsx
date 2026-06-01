'use client';

import React, { useState } from 'react';
import { Quote, ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';
import { HotTakeFeedItem } from '../../actions/feed';
import { toggleHotTakeVote } from '../../actions/hot_takes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DefaultAvatar from '../DefaultAvatar';

interface FeedHotTakeProps {
    item: HotTakeFeedItem & { type?: 'hot_take' }; // Ensure type compatibility
    isDetailView?: boolean;
}

export default function FeedHotTake({ item, isDetailView = false }: FeedHotTakeProps) {
    const router = useRouter();
    const [score, setScore] = useState(item.score);
    const [userVote, setUserVote] = useState(item.user_vote); // 0, 1, -1

    // We only track local score/vote. Comments are handled by page navigation or parent.

    const handleVote = async (type: 1 | -1, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link click if nested
        e.stopPropagation();

        const previousVote = userVote;
        const previousScore = score;

        // Optimistic Update
        let newVote: 0 | 1 | -1 = type;
        let scoreChange = 0;

        if (userVote === type) {
            newVote = 0; // Remove vote
            scoreChange = -type;
        } else {
            newVote = type; // Change/Add vote
            scoreChange = (type - userVote);
        }

        setUserVote(newVote);
        setScore(score + scoreChange);

        try {
            await toggleHotTakeVote(item.id, type);
        } catch (error) {
            // Revert on error
            setUserVote(previousVote);
            setScore(previousScore);
            console.error("Failed to vote", error);
        }
    };

    const handleCommentClick = (e: React.MouseEvent) => {
        if (isDetailView) return; // Already on detail page, do nothing or scroll to comments
        e.preventDefault();
        router.push(`/hot-take/${item.id}`);
    };

    // If NOT in detail view, the whole card could be clickable? 
    // Or just the usual parts. Let's make the comment button navigate.

    return (
        <div className="hot-take-card">
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
                            <DefaultAvatar fill="currentColor" />
                        )}
                    </div>
                    <span className="username">@{item.profiles?.username || 'unknown'}</span>
                </Link>

                <div className="hot-take-actions">
                    <div className="vote-pill">
                        <button
                            className={`vote-btn up ${userVote === 1 ? 'active' : ''}`}
                            onClick={(e) => handleVote(1, e)}
                        >
                            <ChevronUp size={20} />
                        </button>
                        <span className={`score ${userVote !== 0 ? 'voted' : ''}`}>{score}</span>
                        <button
                            className={`vote-btn down ${userVote === -1 ? 'active' : ''}`}
                            onClick={(e) => handleVote(-1, e)}
                        >
                            <ChevronDown size={20} />
                        </button>
                    </div>

                    <button className="comment-btn" onClick={handleCommentClick}>
                        <MessageCircle size={20} />
                        <span>{item.comments_count > 0 ? item.comments_count : ''}</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .hot-take-card {
                    background: var(--md-sys-color-surface-container-low);
                    border: 1px solid var(--md-sys-color-outline-variant);
                    border-radius: 24px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease;
                    height: 100%;
                }

                .hot-take-card:hover {
                    transform: translateY(-6px) scale(1.015);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 24px rgba(255, 159, 104, 0.15);
                    border-color: var(--md-sys-color-primary);
                }

                .hot-take-header {
                    display: flex;
                    justify-content: flex-start;
                }

                .hot-take-badge {
                    background: var(--md-sys-color-primary-container);
                    color: var(--md-sys-color-primary);
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 8px;
                    letter-spacing: 1px;
                }

                .hot-take-body {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    position: relative;
                    flex: 1;
                }

                .quote-icon {
                    color: rgba(255, 159, 104, 0.15);
                    position: absolute;
                    top: -10px;
                    left: -10px;
                }

                .hot-take-content {
                    font-size: 1.15rem;
                    font-weight: 600;
                    line-height: 1.5;
                    color: var(--md-sys-color-on-surface);
                    margin: 0;
                    z-index: 1;
                    font-family: var(--font-display);
                }

                .hot-take-footer {
                    margin-top: 8px;
                    padding-top: 16px;
                    border-top: 1px solid var(--md-sys-color-outline-variant);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap; /* Allow wrapping on very small screens */
                    gap: 12px; /* Gap when wrapped */
                }

                .hot-take-user {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                }

                .mini-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: var(--md-sys-color-surface-container-highest);
                    border: 1px solid var(--md-sys-color-outline-variant);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: bold;
                    color: var(--md-sys-color-on-surface);
                }

                .mini-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .username {
                    font-size: 0.85rem;
                    color: var(--md-sys-color-on-surface-variant);
                    font-weight: 500;
                    transition: color 0.2s;
                }

                .hot-take-user:hover .username {
                    color: var(--md-sys-color-primary);
                }

                .hot-take-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                @media (max-width: 480px) {
                    .hot-take-card {
                        padding: 16px;
                    }
                    .hot-take-footer {
                        flex-direction: row; /* Keep row generally */
                        align-items: center;
                    }
                    .hot-take-actions {
                        gap: 8px; /* Tighter gap on mobile */
                    }
                    .score {
                        font-size: 0.85rem;
                        min-width: 16px;
                    }
                    .vote-btn {
                        padding: 2px;
                    }
                }

                .vote-pill {
                    display: flex;
                    align-items: center;
                    background: var(--md-sys-color-surface-container-high);
                    border: 1px solid var(--md-sys-color-outline-variant);
                    border-radius: 24px;
                    padding: 4px;
                    gap: 4px;
                }

                .vote-btn {
                    background: transparent;
                    border: none;
                    color: var(--md-sys-color-on-surface-variant);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .vote-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--md-sys-color-on-surface);
                }

                .vote-btn.up.active {
                    color: var(--md-sys-color-primary);
                    background: var(--md-sys-color-primary-container);
                }
                
                .vote-btn.down.active {
                    color: var(--md-sys-color-error);
                    background: rgba(255, 180, 171, 0.15);
                }

                .score {
                    font-size: 0.95rem;
                    font-weight: 800;
                    min-width: 24px;
                    text-align: center;
                    color: var(--md-sys-color-on-surface);
                }
                
                .score.voted {
                    /* Optional styling when voted */
                }

                .comment-btn {
                    background: transparent;
                    border: none;
                    color: var(--md-sys-color-on-surface-variant);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                    padding: 6px 12px;
                    border-radius: 20px;
                }

                .comment-btn:hover {
                    background: var(--md-sys-color-surface-container-high);
                    color: var(--md-sys-color-primary);
                }

                .hot-take-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 120px;
                    height: 120px;
                    background: radial-gradient(circle at top right, rgba(255, 159, 104, 0.15), transparent 70%);
                    pointer-events: none;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
