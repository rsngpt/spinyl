'use client';

import React, { useState } from 'react';
import { postHotTakeComment } from '../../actions/hot_takes';
import { Send } from 'lucide-react';
import Link from 'next/link';
import { formatFriendlyDate } from '../../../src/lib/date-utils';


interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
        username: string | null;
        avatar_url: string | null;
    } | null;
}

interface HotTakeCommentsProps {
    hotTakeId: string;
    initialComments: Comment[];
    user: any;
    userProfile: any;
}

// Helper for time ago
const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return formatFriendlyDate(date);
};


export default function HotTakeComments({ hotTakeId, initialComments, user, userProfile }: HotTakeCommentsProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handlePostComment = async () => {
        if (!newComment.trim() || isPosting || !user) return;

        setIsPosting(true);
        try {
            await postHotTakeComment(hotTakeId, newComment);

            // Optimistic add
            const optimisticComment: Comment = {
                id: 'temp-' + Date.now(),
                content: newComment,
                created_at: new Date().toISOString(),
                user_id: user.id,
                profiles: {
                    username: userProfile?.username || user.email?.split('@')[0] || 'User',
                    avatar_url: userProfile?.avatar_url || null
                }
            };

            setComments([...comments, optimisticComment]);
            setNewComment('');

        } catch (error) {
            console.error("Failed to post comment", error);
            alert("Failed to post comment");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="comments-container">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#fff' }}>Comments ({comments.length})</h3>

            {/* Comment List */}
            <div className="comments-list">
                {comments.length === 0 ? (
                    <div className="no-comments">
                        <p>No comments yet. Start the debate!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <Link href={`/profile/${comment.user_id}`} className="comment-avatar">
                                {comment.profiles?.avatar_url ? (
                                    <img src={comment.profiles.avatar_url} alt={comment.profiles.username || 'User'} />
                                ) : (
                                    <span>{(comment.profiles?.username?.[0] || 'U').toUpperCase()}</span>
                                )}
                            </Link>
                            <div className="comment-content">
                                <div className="comment-header">
                                    <Link href={`/profile/${comment.user_id}`} className="comment-username">
                                        {comment.profiles?.username || 'Unknown'}
                                    </Link>
                                    <span className="comment-time">{timeAgo(comment.created_at)}</span>
                                </div>
                                <p className="comment-text">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area (Fixed Bottom or Inline?) Inline is standard for page. Fixed for mobile maybe? Let's do inline for now as it's cleaner */}
            {user ? (
                <div className="comment-input-area">
                    <div className="input-avatar">
                        {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="You" />
                        ) : (
                            <span>{(userProfile?.username?.[0] || 'U').toUpperCase()}</span>
                        )}
                    </div>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                            disabled={isPosting}
                        />
                        <button
                            onClick={handlePostComment}
                            disabled={isPosting || !newComment.trim()}
                            className="send-btn"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="login-prompt">
                    <Link href="/login" className="login-link">Log in to comment</Link>
                </div>
            )}

            <style jsx>{`
                .comments-container {
                    padding-bottom: 20px;
                }
                
                .comments-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .no-comments {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                    background: rgba(255,255,255,0.03);
                    border-radius: 12px;
                }
                
                .comment-item {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }
                
                .comment-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #333;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.8rem;
                }
                
                .comment-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .comment-content {
                    flex: 1;
                }
                
                .comment-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                }
                
                .comment-username {
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-decoration: none;
                }
                
                .comment-time {
                    color: #666;
                    font-size: 0.75rem;
                }
                
                .comment-text {
                    color: #ddd;
                    font-size: 0.95rem;
                    line-height: 1.4;
                    margin: 0;
                }
                
                .comment-input-area {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: #121212; /* Match theme bg */
                    padding: 12px 16px 20px 16px; /* Extra padding for safe area */
                    border-top: 1px solid rgba(255,255,255,0.1);
                    z-index: 100;
                }
                
                /* Adjust main page padding to account for fixed input */
                
                .input-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #333;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.8rem;
                }
                
                .input-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .input-wrapper {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    background: rgba(255,255,255,0.1);
                    border-radius: 24px;
                    padding: 4px 4px 4px 16px;
                }
                
                .input-wrapper input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.95rem;
                    outline: none;
                    padding: 8px 0;
                }
                
                .send-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--primary);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #000;
                    cursor: pointer;
                    margin-left: 8px;
                }
                
                .send-btn:disabled {
                    background: #444;
                    color: #888;
                    cursor: not-allowed;
                }
                
                .login-prompt {
                    text-align: center;
                    padding: 20px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
                
                .login-link {
                    color: var(--primary);
                    font-weight: 700;
                }
                
                @media (min-width: 600px) {
                    .comment-input-area {
                        position: static;
                        background: transparent;
                        padding: 0;
                        border: none;
                        margin-top: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
