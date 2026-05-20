'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getComments, addComment, deleteComment } from '../actions/comments';
import { X, Send, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatFriendlyDate } from '../../src/lib/date-utils';


interface Comment {
    id: string;
    content: string;
    created_at: string;
    profiles: {
        username: string;
        avatar_url: string | null;
    };
    user_id: string;
    parent_id: string | null;
}

interface CommentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    reviewId: string;
    spotifyId: string; // For revalidation
    currentUserId?: string;
}

export default function CommentDrawer({ isOpen, onClose, reviewId, spotifyId, currentUserId }: CommentDrawerProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [replyTo, setReplyTo] = useState<Comment | null>(null);

    // Fetch comments when drawer opens
    useEffect(() => {
        if (isOpen && reviewId) {
            setLoading(true);
            getComments(reviewId).then((data) => {
                setComments(data as Comment[]);
                setLoading(false);
            });
        }
    }, [isOpen, reviewId]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setIsPosting(true);

        const result = await addComment(reviewId, newComment, replyTo?.id, spotifyId);

        if (result.success && result.comment) {
            setComments([...comments, result.comment]);
            setNewComment('');
            setReplyTo(null);
        } else {
            alert(result.message || 'Failed to post comment');
        }
        setIsPosting(false);
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;
        const result = await deleteComment(commentId, spotifyId);
        if (result.success) {
            setComments(comments.filter(c => c.id !== commentId));
        }
    };

    // Group comments into threads (simple 1-level nesting for now)
    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000
                        }}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '100%',
                            maxWidth: '400px',
                            background: '#181818',
                            borderLeft: '1px solid #333',
                            zIndex: 1001,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Comments ({comments.length})</h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                            {loading ? (
                                <p style={{ color: '#888', textAlign: 'center' }}>Loading comments...</p>
                            ) : rootComments.length === 0 ? (
                                <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>No comments yet. Be the first!</p>
                            ) : (
                                rootComments.map(comment => (
                                    <div key={comment.id} style={{ marginBottom: '20px' }}>
                                        <CommentItem
                                            comment={comment}
                                            onReply={() => setReplyTo(comment)}
                                            currentUserId={currentUserId}
                                            onDelete={() => handleDelete(comment.id)}
                                        />
                                        {/* Replies */}
                                        <div style={{ marginLeft: '20px', paddingLeft: '10px', borderLeft: '2px solid #333', marginTop: '8px' }}>
                                            {getReplies(comment.id).map(reply => (
                                                <CommentItem
                                                    key={reply.id}
                                                    comment={reply}
                                                    onReply={() => setReplyTo(comment)} // Reply to root thread
                                                    currentUserId={currentUserId}
                                                    onDelete={() => handleDelete(reply.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '16px', borderTop: '1px solid #333', background: '#222' }}>
                            {replyTo && (
                                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Replying to <strong>@{replyTo.profiles.username}</strong></span>
                                    <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={14} /></button>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={currentUserId ? (replyTo ? "Write a reply..." : "Add a comment...") : "Login to comment"}
                                    disabled={!currentUserId || isPosting}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                    style={{
                                        flex: 1,
                                        background: '#333',
                                        border: 'none',
                                        borderRadius: '20px',
                                        padding: '10px 16px',
                                        color: '#fff',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <button
                                    onClick={handlePostComment}
                                    disabled={!newComment.trim() || isPosting || !currentUserId}
                                    style={{
                                        background: 'var(--primary)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#000',
                                        cursor: 'pointer',
                                        opacity: (!newComment.trim() || !currentUserId) ? 0.5 : 1
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function CommentItem({ comment, onReply, currentUserId, onDelete }: { comment: Comment, onReply: () => void, currentUserId?: string, onDelete: () => void }) {
    return (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0 }}>
                {comment.profiles.avatar_url ? (
                    <img src={comment.profiles.avatar_url} alt={comment.profiles.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {comment.profiles.username[0].toUpperCase()}
                    </div>
                )}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{comment.profiles.username}</span>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>{formatFriendlyDate(comment.created_at)}</span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '0.95rem', lineHeight: '1.4', color: '#ddd', whiteSpace: 'pre-wrap' }}>
                    {comment.content}
                </p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                    {currentUserId && (
                        <button onClick={onReply} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>Reply</button>
                    )}
                    {currentUserId === comment.user_id && (
                        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.8rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Trash2 size={12} /> Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
