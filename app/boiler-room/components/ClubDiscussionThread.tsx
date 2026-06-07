'use client';

import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageSquare, Users, MessageCircle, Mic, Guitar, Music, Radio, Sliders, Disc } from 'lucide-react';
import DefaultAvatar from '../../components/DefaultAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import ThreadedComments, { Comment } from './ThreadedComments';

export interface ClubThread {
    id: string;
    title: string;
    author: string;
    likesCount: number;
    repliesCount: number;
    liked: boolean;
    timeAgo: string;
    commentsList: Comment[];
}

interface ClubDiscussionThreadProps {
    club: {
        id: string;
        name: string;
        description: string;
        memberCount: number;
        activeDiscussionsCount: number;
        joined: boolean;
        bannerColor?: string;
    };
    threads: ClubThread[];
    onBack: () => void;
    onPostThread: (title: string) => void;
    onLikeThread: (threadId: string) => void;
    onAddComment: (threadId: string, content: string, parentId: string | null) => void;
    onEditComment: (threadId: string, commentId: string, content: string) => void;
    onDeleteComment: (threadId: string, commentId: string) => void;
}

const CLUB_ICONS: Record<string, any> = {
    'club-1': Mic,
    'club-2': Guitar,
    'club-3': Music,
    'club-4': Radio,
    'club-5': Sliders,
    'club-6': Disc
};

const BANNER_GRADIENTS: Record<string, string> = {
    'club-1': 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', // Hip-hop
    'club-2': 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', // Indie
    'club-3': 'linear-gradient(135deg, #d84315 0%, #bf360c 100%)', // Bollywood
    'club-4': 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)', // Electronic
    'club-5': 'linear-gradient(135deg, #37474f 0%, #212121 100%)', // Producers
    'club-6': 'linear-gradient(135deg, #ad1457 0%, #880e4f 100%)'  // Vinyl
};

export default function ClubDiscussionThread({
    club,
    threads,
    onBack,
    onPostThread,
    onLikeThread,
    onAddComment,
    onEditComment,
    onDeleteComment
}: ClubDiscussionThreadProps) {
    const [newThreadContent, setNewThreadContent] = useState('');
    const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);

    const IconComponent = CLUB_ICONS[club.id] || Music;
    const bannerStyle = {
        background: BANNER_GRADIENTS[club.id] || 'linear-gradient(135deg, #333 0%, #111 100%)'
    };

    const handleCreateThread = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newThreadContent.trim()) return;
        onPostThread(newThreadContent.trim());
        setNewThreadContent('');
    };

    return (
        <div className="club-discussion-wrapper">
            {/* Back Button Link */}
            <button onClick={onBack} className="back-btn">
                <ArrowLeft size={16} />
                <span>Back to Clubs</span>
            </button>

            {/* Club Featured Banner */}
            <div className="club-header-banner" style={bannerStyle}>
                <div className="banner-overlay" />
                <div className="banner-content">
                    <div className="badge-logo">
                        <IconComponent size={32} color="#fff" />
                    </div>
                    <div className="club-header-details">
                        <h2>{club.name}</h2>
                        <p className="description">{club.description}</p>
                        
                        <div className="club-stats">
                            <div className="stat-item">
                                <Users size={14} />
                                <span>{club.memberCount.toLocaleString()} Members</span>
                            </div>
                            <span className="divider">•</span>
                            <div className="stat-item">
                                <MessageSquare size={14} />
                                <span>{club.activeDiscussionsCount} active discussions</span>
                            </div>
                            {club.joined && (
                                <>
                                    <span className="divider">•</span>
                                    <span className="joined-badge">Member</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Thread Composer */}
            <div className="thread-composer">
                <div className="composer-header">
                    <span>Create a new discussion thread</span>
                </div>
                <form onSubmit={handleCreateThread} className="composer-form">
                    <textarea
                        value={newThreadContent}
                        onChange={(e) => setNewThreadContent(e.target.value)}
                        placeholder={`What do you want to talk about in ${club.name}?`}
                        rows={3}
                        maxLength={250}
                    />
                    <div className="composer-actions">
                        <span className="char-count">{newThreadContent.length}/250</span>
                        <button type="submit" disabled={!newThreadContent.trim()} className="post-btn">
                            Post Thread
                        </button>
                    </div>
                </form>
            </div>

            {/* Threads Feed */}
            <div className="threads-feed">
                <h3>Club Discussions</h3>
                
                <div className="threads-list">
                    {threads.length > 0 ? (
                        threads.map((thread) => {
                            const isExpanded = expandedThreadId === thread.id;
                            return (
                                <div key={thread.id} className="thread-card">
                                    <div className="thread-card-header">
                                        <div className="author-meta">
                                            <div className="mini-avatar">
                                                <DefaultAvatar fill="#999" />
                                            </div>
                                            <span className="author">@{thread.author}</span>
                                            <span className="dot">•</span>
                                            <span className="time">{thread.timeAgo}</span>
                                        </div>
                                    </div>

                                    <div className="thread-card-body">
                                        <p className="thread-title">{thread.title}</p>
                                    </div>

                                    <div className="thread-card-footer">
                                        <button
                                            onClick={() => onLikeThread(thread.id)}
                                            className={`thread-action-btn like ${thread.liked ? 'liked' : ''}`}
                                        >
                                            <Heart size={14} fill={thread.liked ? '#ef5350' : 'transparent'} />
                                            <span>{thread.likesCount}</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => setExpandedThreadId(isExpanded ? null : thread.id)}
                                            className={`thread-action-btn comment ${isExpanded ? 'active' : ''}`}
                                        >
                                            <MessageCircle size={14} />
                                            <span>{thread.repliesCount}</span>
                                        </button>
                                    </div>

                                    {/* Threaded Comments */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="comments-wrapper"
                                            >
                                                <div className="divider-line" />
                                                
                                                <ThreadedComments
                                                    comments={thread.commentsList}
                                                    onAddComment={(content, parentId) => onAddComment(thread.id, content, parentId)}
                                                    onEditComment={(commentId, newContent) => onEditComment(thread.id, commentId, newContent)}
                                                    onDeleteComment={(commentId) => onDeleteComment(thread.id, commentId)}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-threads">
                            <p>No discussion threads started yet. Be the first to post!</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .club-discussion-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.95rem;
                    font-weight: 700;
                    cursor: pointer;
                    width: fit-content;
                    padding: 8px 0;
                    transition: var(--transition);
                }

                .back-btn:hover {
                    color: #fff;
                    transform: translateX(-4px);
                }

                .club-header-banner {
                    position: relative;
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 40px;
                    overflow: hidden;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
                }

                .banner-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%);
                    z-index: 0;
                }

                .banner-content {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    gap: 28px;
                    align-items: center;
                }

                .badge-logo {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    width: 76px;
                    height: 76px;
                    border-radius: var(--md-shape-corner-large);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
                }

                .club-header-details {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .club-header-details h2 {
                    font-size: 1.85rem;
                    font-weight: 900;
                    color: #fff;
                }

                .club-header-details .description {
                    font-size: 1rem;
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.45;
                }

                .club-stats {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 4px;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.55);
                    font-weight: 600;
                }

                .divider {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.3);
                }

                .joined-badge {
                    background: #4db6ac;
                    color: #000;
                    font-size: 0.78rem;
                    font-weight: 800;
                    padding: 2px 10px;
                    border-radius: var(--md-shape-corner-full);
                }

                .thread-composer {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .composer-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.55);
                }

                .avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 4px;
                }

                .composer-form {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                textarea {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: var(--md-shape-corner-medium);
                    padding: 16px;
                    color: #fff;
                    font-size: 1.05rem;
                    font-family: inherit;
                    resize: none;
                    outline: none;
                    line-height: 1.6;
                    transition: var(--transition);
                }

                textarea:focus {
                    border-color: rgba(255, 255, 255, 0.25);
                    background: rgba(255, 255, 255, 0.03);
                }

                .composer-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .char-count {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 600;
                }

                .post-btn {
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 10px 22px;
                    border-radius: var(--md-shape-corner-full);
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--transition-spring);
                }

                .post-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.25);
                }

                .post-btn:disabled {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.25);
                    cursor: not-allowed;
                }

                .threads-feed {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    margin-top: 10px;
                }

                .threads-feed h3 {
                    font-size: 1.25rem;
                    font-weight: 850;
                    color: #fff;
                }

                .threads-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .thread-card {
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    transition: var(--transition);
                }

                .thread-card:hover {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .thread-card-header {
                    display: flex;
                    justify-content: space-between;
                }

                .author-meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .mini-avatar {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                }

                .author {
                    font-size: 0.85rem;
                    font-weight: 750;
                    color: rgba(255, 255, 255, 0.75);
                }

                .time {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                }

                .thread-title {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #fff;
                    line-height: 1.45;
                }

                .thread-card-footer {
                    display: flex;
                    gap: 14px;
                }

                .thread-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    color: rgba(255, 255, 255, 0.55);
                    padding: 6px 12px;
                    border-radius: var(--md-shape-corner-full);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .thread-action-btn:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.05);
                }

                .thread-action-btn.like.liked {
                    color: #ef5350;
                    background: rgba(239, 83, 80, 0.08);
                    border-color: rgba(239, 83, 80, 0.18);
                }

                .thread-action-btn.comment.active {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.18);
                }

                .comments-wrapper {
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .divider-line {
                    height: 1px;
                    background: rgba(255, 255, 255, 0.06);
                }

                .empty-threads {
                    background: rgba(255,255,255,0.005);
                    border: 1px dashed rgba(255,255,255,0.06);
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
