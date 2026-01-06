'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Send, MoreHorizontal, Trash2 } from 'lucide-react';
import { getComments, addComment, deleteComment } from '../actions/comments';
import VinylRatingInput from './VinylRatingInput';
import Link from 'next/link';
import { deleteReview } from '../actions/review';

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

interface Review {
    id: string;
    rating: number;
    review_text: string;
    created_at: string;
    user_id: string;
    profiles?: {
        username: string;
        avatar_url: string | null;
    } | null;
}

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    review: Review;
    currentUser?: any;
    spotifyId: string;
}

export default function ReviewModal({ isOpen, onClose, review, currentUser, spotifyId }: ReviewModalProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [replyTo, setReplyTo] = useState<Comment | null>(null);

    // Profile Fallback
    const profile = review.profiles || { username: 'Unknown', avatar_url: null };
    const dateStr = new Date(review.created_at).toLocaleDateString();

    useEffect(() => {
        if (isOpen && review.id) {
            setLoading(true);
            getComments(review.id).then((data) => {
                setComments(data as Comment[]);
                setLoading(false);
            });
        }
    }, [isOpen, review.id]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setIsPosting(true);

        const result = await addComment(review.id, newComment, replyTo?.id, spotifyId);

        if (result.success && result.comment) {
            setComments([...comments, result.comment]);
            setNewComment('');
            setReplyTo(null);
        } else {
            console.error(result.message);
            alert(result.message); // Show error to user
        }
        setIsPosting(false);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;
        const result = await deleteComment(commentId, spotifyId);
        if (result.success) {
            setComments(comments.filter(c => c.id !== commentId));
        }
    };

    // Filter logic
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
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 1000
                        }}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            inset: '40px', // Margin from edges
                            margin: 'auto',
                            maxWidth: '1000px',
                            height: 'min(90vh, 800px)', // Max height
                            background: '#000',
                            borderRadius: '16px',
                            border: '1px solid #333',
                            zIndex: 1001,
                            display: 'flex',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                        }}
                    >
                        {/* Close Button Mobile / Tablet overlay if needed, usually top right outside or inside */}
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'rgba(0,0,0,0.5)',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                        >
                            <X size={18} />
                        </button>

                        {/* LEFT COLUMN: The Review */}
                        <div style={{
                            flex: '6', // 60%
                            borderRight: '1px solid #222',
                            padding: '32px',
                            overflowY: 'auto',
                            background: '#121212',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* User Headers */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{profile.username[0].toUpperCase()}</div>
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{profile.username}</h3>
                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{dateStr}</span>
                                </div>
                            </div>

                            {/* Vinyl & Rating Large Display */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
                                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                    {/* Spinning Vinyl Animation Concept */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        borderRadius: '50%',
                                        background: '#111',
                                        border: '1px solid #333',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <VinylRatingInput value={review.rating} onChange={() => { }} readonly />
                                    </div>
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>VERDICT</span>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: review.rating >= 8 ? '#FFD700' : '#fff' }}>
                                        {review.rating}<span style={{ fontSize: '1.2rem', color: '#444' }}>/10</span>
                                    </div>
                                </div>
                            </div>

                            {/* The Review Text */}
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#eee', whiteSpace: 'pre-wrap' }}>
                                    "{review.review_text}"
                                </p>
                            </div>

                            {/* Action Bar (Fake interaction for now) */}
                            <div style={{ display: 'flex', gap: '24px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #222' }}>
                                <button style={{ background: 'none', border: 'none', color: '#888', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <Heart size={20} /> <span style={{ fontSize: '0.9rem' }}>Like</span>
                                </button>
                                <button style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <MessageCircle size={20} /> <span style={{ fontSize: '0.9rem' }}>{comments.length} Comments</span>
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Comments */}
                        <div style={{
                            flex: '4', // 40%
                            display: 'flex',
                            flexDirection: 'column',
                            background: '#000'
                        }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #222', fontWeight: 700, fontSize: '1rem' }}>
                                Comments
                            </div>

                            {/* Scrollable List */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                                {loading ? (
                                    <div style={{ padding: '20px', color: '#666', textAlign: 'center' }}>Loading...</div>
                                ) : rootComments.length === 0 ? (
                                    <div style={{ padding: '40px 20px', color: '#444', textAlign: 'center' }}>
                                        <p>No comments yet.</p>
                                        <p style={{ fontSize: '0.85rem' }}>Start the discussion.</p>
                                    </div>
                                ) : (
                                    <div style={{ padding: '16px' }}>
                                        {rootComments.map(comment => (
                                            <div key={comment.id} style={{ marginBottom: '24px' }}>
                                                <CommentItem
                                                    comment={comment}
                                                    currentUser={currentUser}
                                                    onReply={() => setReplyTo(comment)}
                                                    onDelete={() => handleDeleteComment(comment.id)}
                                                />
                                                {/* Replies */}
                                                <div style={{ marginLeft: '42px', marginTop: '12px' }}>
                                                    {getReplies(comment.id).map(reply => (
                                                        <div key={reply.id} style={{ marginBottom: '12px' }}>
                                                            <CommentItem
                                                                comment={reply}
                                                                currentUser={currentUser}
                                                                onReply={() => setReplyTo(comment)}
                                                                onDelete={() => handleDeleteComment(reply.id)}
                                                                isReply
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div style={{ padding: '16px', borderTop: '1px solid #222', background: '#111' }}>
                                {replyTo && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Replying to @{replyTo.profiles.username}</span>
                                        <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={12} /></button>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0 }}>
                                        {/* Your Avatar */}
                                        {currentUser?.user_metadata?.avatar_url ? (
                                            <img src={currentUser.user_metadata.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: '#444' }} />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                        placeholder={currentUser ? "Post a reply..." : "Login to reply"}
                                        disabled={!currentUser || isPosting}
                                        style={{
                                            flex: 1,
                                            background: '#000',
                                            border: '1px solid #333',
                                            borderRadius: '20px',
                                            padding: '8px 16px',
                                            color: '#fff',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <button
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim() || isPosting}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: newComment.trim() ? 'var(--primary)' : '#444',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Post</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function CommentItem({ comment, currentUser, onReply, onDelete, isReply = false }: { comment: Comment, currentUser: any, onReply: () => void, onDelete: () => void, isReply?: boolean }) {
    return (
        <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: isReply ? '24px' : '32px', height: isReply ? '24px' : '32px', borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0 }}>
                {comment.profiles.avatar_url ? (
                    <img src={comment.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{comment.profiles.username[0]}</div>
                )}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{comment.profiles.username}</span>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ margin: '2px 0 6px', fontSize: '0.9rem', lineHeight: '1.4', color: '#ddd' }}>
                    {comment.content}
                </p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>
                    <button onClick={onReply} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>Reply</button>
                    {currentUser?.id === comment.user_id && (
                        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>Delete</button>
                    )}
                </div>
            </div>
        </div>
    );
}
