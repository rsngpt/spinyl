'use client';

import React, { useState } from 'react';
import { Quote, ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';
import { HotTakeFeedItem } from '../../actions/feed';
import { toggleHotTakeVote } from '../../actions/hot_takes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 4px;
                    gap: 4px;
                }

                .vote-btn {
                    background: transparent;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .vote-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .vote-btn.up.active {
                    color: #4CAF50;
                }
                
                .vote-btn.down.active {
                    color: #E50914;
                }

                .score {
                    font-size: 0.9rem;
                    font-weight: 700;
                    min-width: 20px;
                    text-align: center;
                    color: #fff;
                }
                
                .score.voted {
                    /* color: #E50914; */ /* Optional: color score when voted */
                }

                .comment-btn {
                    background: transparent;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: color 0.2s;
                    font-size: 0.9rem;
                }

                .comment-btn:hover {
                    color: #fff;
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
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
