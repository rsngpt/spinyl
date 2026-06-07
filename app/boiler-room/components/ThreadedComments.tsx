'use client';

import React, { useState } from 'react';
import { Heart, CornerDownRight, MoreHorizontal } from 'lucide-react';
import DefaultAvatar from '../../components/DefaultAvatar';
import { motion, AnimatePresence } from 'framer-motion';

export interface Comment {
    id: string;
    author: string;
    content: string;
    timeAgo: string;
    parentId: string | null;
    likesCount?: number;
    liked?: boolean;
}

interface ThreadedCommentsProps {
    comments: Comment[];
    onAddComment: (content: string, parentId: string | null) => void;
    onEditComment: (commentId: string, newContent: string) => void;
    onDeleteComment: (commentId: string) => void;
}

export default function ThreadedComments({
    comments,
    onAddComment,
    onEditComment,
    onDeleteComment
}: ThreadedCommentsProps) {
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'top' | 'newest'>('top');
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    
    // Local interactive states for likes
    const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
    const [likesCounters, setLikesCounters] = useState<Record<string, number>>({});

    const [replyText, setReplyText] = useState('');
    const [editText, setEditText] = useState('');

    const handleReplySubmit = (e: React.FormEvent, parentId: string | null) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onAddComment(replyText.trim(), parentId);
        setReplyText('');
        setReplyingToId(null);
        if (parentId) {
            setExpandedComments(prev => ({ ...prev, [parentId]: true }));
        }
    };

    const handleEditSubmit = (e: React.FormEvent, commentId: string) => {
        e.preventDefault();
        if (!editText.trim()) return;
        onEditComment(commentId, editText.trim());
        setEditText('');
        setEditingId(null);
    };

    const toggleLike = (commentId: string, initialLikes: number) => {
        const currentlyLiked = likedComments[commentId] ?? false;
        const currentCount = likesCounters[commentId] ?? initialLikes;

        setLikedComments(prev => ({ ...prev, [commentId]: !currentlyLiked }));
        setLikesCounters(prev => ({
            ...prev,
            [commentId]: currentlyLiked ? currentCount - 1 : currentCount + 1
        }));
    };

    const toggleReplies = (commentId: string) => {
        setExpandedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const startEditing = (comment: Comment) => {
        setEditingId(comment.id);
        setEditText(comment.content);
        setReplyingToId(null);
    };

    // Sort comments based on filter
    const sortedComments = [...comments].sort((a, b) => {
        if (activeFilter === 'newest') {
            return b.id.localeCompare(a.id); // Newer first
        }
        // Top filter: likes count order
        const aLikes = likesCounters[a.id] ?? a.likesCount ?? 0;
        const bLikes = likesCounters[b.id] ?? b.likesCount ?? 0;
        return bLikes - aLikes;
    });

    // Build comment tree mapping parentId -> Child Comments
    const commentsByParent = sortedComments.reduce<Record<string, Comment[]>>((acc, comm) => {
        const pId = comm.parentId || 'root';
        if (!acc[pId]) acc[pId] = [];
        acc[pId].push(comm);
        return acc;
    }, {});

    // Recursive component to render a comment and its children
    const CommentNode = ({ comment, depth }: { comment: Comment; depth: number }) => {
        const children = commentsByParent[comment.id] || [];
        const isReplying = replyingToId === comment.id;
        const isEditing = editingId === comment.id;
        const isAuthorYou = comment.author === 'You';
        
        const isLiked = likedComments[comment.id] ?? comment.liked ?? false;
        const currentLikes = likesCounters[comment.id] ?? comment.likesCount ?? 0;
        const isExpanded = expandedComments[comment.id] ?? false;

        return (
            <div className="comment-node-wrapper">
                <div className="comment-main-row">
                    {/* Left side Avatar and thread connector line */}
                    <div className="avatar-column">
                        <div className="commenter-avatar">
                            <DefaultAvatar size={32} fill={isAuthorYou ? '#fff' : '#666'} />
                        </div>
                        {/* Thread connection line running to replies */}
                        {depth >= 0 && children.length > 0 && isExpanded && (
                            <div className="thread-connector-vertical" />
                        )}
                    </div>
                    
                    {/* Middle Card Details */}
                    <div className="comment-details-column">
                        <div className="comment-bubble">
                            <span className="commenter-name">{isAuthorYou ? 'You' : comment.author}</span>
                            
                            {isEditing ? (
                                <form onSubmit={(e) => handleEditSubmit(e, comment.id)} className="edit-form">
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        maxLength={200}
                                        autoFocus
                                    />
                                    <div className="edit-actions">
                                        <button type="submit" disabled={!editText.trim()} className="save-btn">
                                            Save
                                        </button>
                                        <button type="button" onClick={() => setEditingId(null)} className="cancel-btn">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <p className="comment-text">{comment.content}</p>
                            )}
                        </div>

                        {/* Comment Actions Footer */}
                        {!isEditing && (
                            <div className="comment-actions-footer">
                                <span className="comment-time">{comment.timeAgo}</span>
                                
                                <button
                                    onClick={() => {
                                        setReplyingToId(isReplying ? null : comment.id);
                                        setReplyText('');
                                    }}
                                    className={`action-btn-link reply-link ${isReplying ? 'active' : ''}`}
                                >
                                    Reply
                                </button>

                                {isAuthorYou ? (
                                    <>
                                        <button onClick={() => startEditing(comment)} className="action-btn-link">
                                            Edit
                                        </button>
                                        <button onClick={() => onDeleteComment(comment.id)} className="action-btn-link delete">
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <button className="action-btn-link" title="Options">
                                        <MoreHorizontal size={14} style={{ verticalAlign: 'middle' }} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* "View replies" toggle button */}
                        {children.length > 0 && (
                            <button onClick={() => toggleReplies(comment.id)} className="view-replies-toggle">
                                <span className="line-prefix">——</span>
                                <span>{isExpanded ? 'Hide replies' : `View all ${children.length} replies`}</span>
                            </button>
                        )}
                    </div>

                    {/* Right side Likes Trigger */}
                    <div className="like-column">
                        <button
                            onClick={() => toggleLike(comment.id, comment.likesCount ?? 0)}
                            className={`like-trigger-btn ${isLiked ? 'liked' : ''}`}
                        >
                            <Heart size={14} fill={isLiked ? '#ef5350' : 'transparent'} />
                        </button>
                        {currentLikes > 0 && <span className="likes-count">{currentLikes}</span>}
                    </div>
                </div>

                {/* Inline Reply Input */}
                <AnimatePresence>
                    {isReplying && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="reply-composer-wrapper"
                        >
                            <div className="reply-avatar-col">
                                <div className="mini-avatar">
                                    <DefaultAvatar size={24} fill="#fff" />
                                </div>
                            </div>
                            <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="reply-input-form">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    maxLength={200}
                                    autoFocus
                                />
                                <span className="smiley-trigger">😊</span>
                                <button type="submit" disabled={!replyText.trim()} className="reply-send-btn">
                                    Post
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recursive Children rendering */}
                {children.length > 0 && isExpanded && (
                    <div className="nested-replies-container">
                        {children.map((child) => (
                            <CommentNode key={child.id} comment={child} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const rootComments = commentsByParent['root'] || [];

    return (
        <div className="threaded-comments-container">
            {/* Top Sort Filters */}
            <div className="filters-row">
                <button
                    onClick={() => setActiveFilter('top')}
                    className={`filter-pill ${activeFilter === 'top' ? 'active' : ''}`}
                >
                    Top
                </button>
                <button
                    onClick={() => setActiveFilter('newest')}
                    className={`filter-pill ${activeFilter === 'newest' ? 'active' : ''}`}
                >
                    Newest
                </button>
            </div>

            {/* Direct Root Comment Composer (Top Level) */}
            <div className="root-composer-wrapper">
                <div className="root-avatar-col">
                    <div className="composer-avatar">
                        <DefaultAvatar size={32} fill="#fff" />
                    </div>
                </div>
                <form onSubmit={(e) => handleReplySubmit(e, null)} className="root-composer-form">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a comment..."
                        maxLength={200}
                    />
                    <span className="smiley-trigger">😊</span>
                    <button type="submit" disabled={!replyText.trim()} className="root-send-btn">
                        Post
                    </button>
                </form>
            </div>

            {/* Comments List */}
            {rootComments.length > 0 ? (
                <div className="threaded-list">
                    {rootComments.map((rootComm) => (
                        <CommentNode key={rootComm.id} comment={rootComm} depth={0} />
                    ))}
                </div>
            ) : (
                <p className="no-comments-message">No replies yet. Be the first to start the thread!</p>
            )}

            <style jsx>{`
                .threaded-comments-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 100%;
                    background: #000;
                    padding: 16px 0;
                    color: #fff;
                }

                .threaded-comments-container :global(.filters-row) {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .threaded-comments-container :global(.filter-pill) {
                    background: rgba(255, 255, 255, 0.08);
                    border: none;
                    color: #fff;
                    padding: 6px 16px;
                    border-radius: var(--md-shape-corner-medium);
                    font-size: 0.85rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .threaded-comments-container :global(.filter-pill.active) {
                    background: #fff;
                    color: #000;
                }

                .threaded-comments-container :global(.root-composer-wrapper) {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .threaded-comments-container :global(.root-avatar-col) {
                    width: 32px;
                    height: 32px;
                    flex-shrink: 0;
                }

                .threaded-comments-container :global(.composer-avatar) {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                }

                .threaded-comments-container :global(.root-composer-form) {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    background: #121212;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 6px 14px;
                    gap: 8px;
                }

                .threaded-comments-container :global(.root-composer-form input) {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.9rem;
                    outline: none;
                    font-family: inherit;
                    padding: 6px 0;
                }

                .threaded-comments-container :global(.root-composer-form input::placeholder) {
                    color: rgba(255, 255, 255, 0.4);
                }

                .threaded-comments-container :global(.smiley-trigger) {
                    font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    user-select: none;
                    transition: color 0.2s ease;
                }

                .threaded-comments-container :global(.smiley-trigger:hover) {
                    color: #fff;
                }

                .threaded-comments-container :global(.root-send-btn) {
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.9rem;
                    font-weight: 750;
                    cursor: pointer;
                    padding: 0 4px;
                }

                .threaded-comments-container :global(.root-send-btn:disabled) {
                    color: rgba(255, 255, 255, 0.2);
                    cursor: not-allowed;
                }

                .threaded-comments-container :global(.threaded-list) {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .threaded-comments-container :global(.comment-node-wrapper) {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .threaded-comments-container :global(.comment-main-row) {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    position: relative;
                }

                .threaded-comments-container :global(.avatar-column) {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex-shrink: 0;
                    position: relative;
                    height: 100%;
                }

                .threaded-comments-container :global(.commenter-avatar) {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .threaded-comments-container :global(.commenter-avatar svg) {
                    width: 100% !important;
                    height: 100% !important;
                }

                .threaded-comments-container :global(.thread-connector-vertical) {
                    position: absolute;
                    top: 36px;
                    bottom: -16px;
                    left: 15px;
                    width: 1px;
                    border-left: 1.5px solid rgba(255, 255, 255, 0.12);
                    z-index: 0;
                }

                .threaded-comments-container :global(.comment-details-column) {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .threaded-comments-container :global(.comment-bubble) {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .threaded-comments-container :global(.commenter-name) {
                    font-size: 0.88rem;
                    font-weight: 750;
                    color: #fff;
                }

                .threaded-comments-container :global(.comment-text) {
                    font-size: 0.92rem;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.45;
                    word-break: break-word;
                }

                .threaded-comments-container :global(.comment-actions-footer) {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.8rem;
                }

                .threaded-comments-container :global(.comment-time) {
                    cursor: default;
                }

                .threaded-comments-container :global(.action-btn-link) {
                    background: transparent;
                    border: none;
                    padding: 0;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: color 0.2s ease;
                }

                .threaded-comments-container :global(.action-btn-link:hover) {
                    color: #fff;
                }

                .threaded-comments-container :global(.action-btn-link.delete:hover) {
                    color: #ef5350;
                }

                .threaded-comments-container :global(.view-replies-toggle) {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    width: fit-content;
                    padding: 6px 0;
                    transition: color 0.2s ease;
                }

                .threaded-comments-container :global(.view-replies-toggle:hover) {
                    color: #fff;
                }

                .threaded-comments-container :global(.line-prefix) {
                    opacity: 0.5;
                }

                .threaded-comments-container :global(.like-column) {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    min-width: 24px;
                    margin-top: 4px;
                }

                .threaded-comments-container :global(.like-trigger-btn) {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    padding: 4px;
                    transition: var(--transition);
                }

                .threaded-comments-container :global(.like-trigger-btn:hover) {
                    color: #fff;
                    transform: scale(1.1);
                }

                .threaded-comments-container :global(.like-trigger-btn.liked) {
                    color: #ef5350;
                }

                .threaded-comments-container :global(.likes-count) {
                    font-size: 0.72rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 600;
                }

                .threaded-comments-container :global(.reply-composer-wrapper) {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    margin-left: 44px;
                    margin-top: 8px;
                }

                .threaded-comments-container :global(.reply-avatar-col) {
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                }

                .threaded-comments-container :global(.mini-avatar) {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .threaded-comments-container :global(.reply-avatar-col svg) {
                    width: 100% !important;
                    height: 100% !important;
                }

                .threaded-comments-container :global(.reply-input-form) {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    background: #121212;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 4px 12px;
                    gap: 8px;
                }

                .threaded-comments-container :global(.reply-input-form input) {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.85rem;
                    outline: none;
                    font-family: inherit;
                    padding: 4px 0;
                }

                .threaded-comments-container :global(.reply-send-btn) {
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.85rem;
                    font-weight: 750;
                    cursor: pointer;
                    padding: 0 4px;
                }

                .threaded-comments-container :global(.reply-send-btn:disabled) {
                    color: rgba(255, 255, 255, 0.2);
                    cursor: not-allowed;
                }

                .threaded-comments-container :global(.nested-replies-container) {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-left: 24px;
                    margin-top: 12px;
                }

                .threaded-comments-container :global(.no-comments-message) {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.35);
                    text-align: center;
                    padding: 12px 0;
                }

                /* Edit form */
                .threaded-comments-container :global(.edit-form) {
                    display: flex;
                    gap: 8px;
                    background: #121212;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: var(--md-shape-corner-medium);
                    padding: 4px 6px 4px 12px;
                    align-items: center;
                    width: 100%;
                }

                .threaded-comments-container :global(.edit-form input) {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.88rem;
                    outline: none;
                    font-family: inherit;
                    padding: 6px 0;
                }

                .threaded-comments-container :global(.edit-actions) {
                    display: flex;
                    gap: 6px;
                }

                .threaded-comments-container :global(.save-btn), .threaded-comments-container :global(.cancel-btn) {
                    border: none;
                    padding: 4px 10px;
                    border-radius: var(--md-shape-corner-small);
                    font-size: 0.72rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .threaded-comments-container :global(.save-btn) {
                    background: #fff;
                    color: #000;
                }

                .threaded-comments-container :global(.cancel-btn) {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
            `}</style>
        </div>
    );
}
