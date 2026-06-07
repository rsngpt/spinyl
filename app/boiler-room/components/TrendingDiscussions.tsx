'use client';

import React, { useState } from 'react';
import { Heart, MessageSquare, Quote } from 'lucide-react';
import DefaultAvatar from '../../components/DefaultAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import ThreadedComments, { Comment } from './ThreadedComments';

export interface Discussion {
    id: string;
    title: string;
    repliesCount: number;
    likesCount: number;
    liked?: boolean;
    categoryTag: string;
    author: string;
    avatarUrl?: string;
    timeAgo: string;
    commentsList: Comment[];
}

interface TrendingDiscussionsProps {
    discussions: Discussion[];
    onLike: (id: string) => void;
    onAddComment: (discId: string, content: string, parentId: string | null) => void;
    onEditComment: (discId: string, commentId: string, content: string) => void;
    onDeleteComment: (discId: string, commentId: string) => void;
}

const TAG_COLORS: Record<string, string> = {
    'Hot Take': '#ff8a65',
    'Discussion': '#4db6ac',
    'Debate': '#ffb74d',
    'Question': '#64b5f6',
    'Soundtracks': '#ba68c8',
    'Rankings': '#f06292'
};

export default function TrendingDiscussions({
    discussions,
    onLike,
    onAddComment,
    onEditComment,
    onDeleteComment
}: TrendingDiscussionsProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleToggleComments = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="trending-discussions">
            <div className="section-title">
                <Quote size={22} color="var(--md-sys-color-primary)" />
                <h3>Trending Discussions</h3>
            </div>

            <div className="feed-list">
                <AnimatePresence initial={false}>
                    {discussions.map((disc) => {
                        const tagColor = TAG_COLORS[disc.categoryTag] || '#ffffff';
                        const isExpanded = expandedId === disc.id;

                        return (
                            <motion.div
                                key={disc.id}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="discussion-card"
                            >
                                <div className="card-header">
                                    <div className="author-info">
                                        <div className="avatar">
                                            {disc.avatarUrl ? (
                                                <img src={disc.avatarUrl} alt={disc.author} />
                                            ) : (
                                                <DefaultAvatar fill="#aaa" />
                                            )}
                                        </div>
                                        <span className="author">@{disc.author}</span>
                                        <span className="dot">•</span>
                                        <span className="time">{disc.timeAgo}</span>
                                    </div>

                                    <span
                                        className="category-badge"
                                        style={{
                                            color: tagColor,
                                            backgroundColor: `${tagColor}15`,
                                            borderColor: `${tagColor}30`
                                        }}
                                    >
                                        {disc.categoryTag}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <p className="discussion-title">{disc.title}</p>
                                </div>

                                <div className="card-footer">
                                    <button
                                        onClick={() => onLike(disc.id)}
                                        className={`action-btn like-btn ${disc.liked ? 'liked' : ''}`}
                                    >
                                        <Heart size={16} fill={disc.liked ? '#ef5350' : 'transparent'} />
                                        <span>{disc.likesCount}</span>
                                    </button>

                                    <button
                                        onClick={() => handleToggleComments(disc.id)}
                                        className={`action-btn comment-btn ${isExpanded ? 'active' : ''}`}
                                    >
                                        <MessageSquare size={16} />
                                        <span>{disc.repliesCount}</span>
                                    </button>
                                </div>

                                {/* Threaded Comments Section */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                            className="comments-section"
                                        >
                                            <div className="comments-divider" />
                                            
                                            <ThreadedComments
                                                comments={disc.commentsList}
                                                onAddComment={(content, parentId) => onAddComment(disc.id, content, parentId)}
                                                onEditComment={(commentId, newContent) => onEditComment(disc.id, commentId, newContent)}
                                                onDeleteComment={(commentId) => onDeleteComment(disc.id, commentId)}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .trending-discussions {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 4px;
                }

                .section-title h3 {
                    font-size: 1.35rem;
                    font-weight: 850;
                    letter-spacing: -0.02em;
                    color: #fff;
                }

                .feed-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                :global(.discussion-card) {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    transition: border-color 0.3s ease, background 0.3s ease;
                }

                :global(.discussion-card):hover {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.12);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .author-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .author {
                    font-size: 0.9rem;
                    font-weight: 750;
                    color: rgba(255, 255, 255, 0.85);
                }

                .dot {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.3);
                }

                .time {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.4);
                }

                .category-badge {
                    font-size: 0.78rem;
                    font-weight: 750;
                    padding: 4px 12px;
                    border-radius: var(--md-shape-corner-full);
                    border: 1px solid transparent;
                }

                .discussion-title {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #fff;
                    line-height: 1.5;
                }

                .card-footer {
                    display: flex;
                    gap: 16px;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.65);
                    padding: 8px 16px;
                    border-radius: var(--md-shape-corner-full);
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.06);
                    color: #fff;
                }

                .like-btn.liked {
                    color: #ef5350;
                    background: rgba(239, 83, 80, 0.1);
                    border-color: rgba(239, 83, 80, 0.2);
                }

                .like-btn.liked:hover {
                    background: rgba(239, 83, 80, 0.15);
                }

                .comment-btn.active {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.18);
                }

                .comments-section {
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .comments-divider {
                    height: 1px;
                    background: rgba(255, 255, 255, 0.08);
                    width: 100%;
                }
            `}</style>
        </div>
    );
}
