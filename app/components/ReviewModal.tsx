'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Send, MoreHorizontal, Trash2 } from 'lucide-react';
import { getComments, addComment, deleteComment } from '../actions/comments';
import VinylRatingInput from './VinylRatingInput';
import Link from 'next/link';
import { deleteReview } from '../actions/review';
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
    userProfile?: { username: string; avatar_url: string | null } | null;
    spotifyId: string;
}

export default function ReviewModal({ isOpen, onClose, review, currentUser, userProfile, spotifyId }: ReviewModalProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [replyTo, setReplyTo] = useState<Comment | null>(null);

    // Profile Fallback
    const profile = review.profiles || { username: 'Unknown', avatar_url: null };
    const dateStr = formatFriendlyDate(review.created_at);

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
                        className="m3-modal-container"
                        style={{
                            position: 'fixed',
                            inset: '40px', // Margin from edges
                            margin: 'auto',
                            maxWidth: '1000px',
                            height: 'min(90vh, 800px)', // Max height
                            background: 'var(--md-sys-color-background)',
                            borderRadius: 'var(--md-shape-corner-extra-large)',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            zIndex: 1001,
                            display: 'flex',
                            overflow: 'hidden',
                            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)'
                        }}
                    >
                        {/* Drag Handle for mobile Bottom Sheet */}
                        <div className="m3-bottom-sheet-handle" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="m3-modal-close-btn"
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--md-sys-color-on-surface)',
                                borderRadius: 'var(--md-shape-corner-full)',
                                width: '36px',
                                height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10,
                                transition: 'var(--transition)'
                            }}
                        >
                            <X size={18} />
                        </button>

                        {/* LEFT COLUMN: The Review */}
                        <div className="m3-modal-left-col" style={{
                            flex: '6', // 60%
                            borderRight: '1px solid var(--md-sys-color-outline-variant)',
                            padding: '32px',
                            overflowY: 'auto',
                            background: 'var(--md-sys-color-surface-container-low)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* User Headers */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '0', background: 'var(--md-sys-color-surface-container-highest)', overflow: 'hidden' }}>
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--md-sys-color-on-surface)' }}>{profile.username[0].toUpperCase()}</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-display" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{profile.username}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dateStr}</span>
                                </div>
                            </div>

                            {/* Vinyl & Rating Large Display */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', background: 'var(--md-sys-color-surface-container-lowest)', border: '1px solid var(--md-sys-color-outline-variant)', padding: '20px', borderRadius: 'var(--md-shape-corner-large)' }}>
                                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
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
                                    <span className="font-display" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>VERDICT</span>
                                    <div className="font-display" style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: review.rating >= 8 ? 'var(--md-sys-color-tertiary)' : 'var(--md-sys-color-on-surface)' }}>
                                        {review.rating}<span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/10</span>
                                    </div>
                                </div>
                            </div>

                            {/* The Review Text */}
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--md-sys-color-on-surface)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)' }}>
                                    "{review.review_text}"
                                </p>
                            </div>

                            {/* Action Bar */}
                            <div style={{ display: 'flex', gap: '24px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
                                <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                    <Heart size={20} /> <span style={{ fontSize: '0.9rem' }}>Like</span>
                                </button>
                                <button style={{ background: 'none', border: 'none', color: 'var(--md-sys-color-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                    <MessageCircle size={20} /> <span style={{ fontSize: '0.9rem' }}>{comments.length} Comments</span>
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Comments */}
                        <div className="m3-modal-right-col" style={{
                            flex: '4', // 40%
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'var(--md-sys-color-surface-container-lowest)'
                        }}>
                            <div className="font-display" style={{ padding: '20px', borderBottom: '1px solid var(--md-sys-color-outline-variant)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--md-sys-color-on-surface)' }}>
                                Comments
                            </div>

                            {/* Scrollable List */}
                            <div className="m3-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                                {loading ? (
                                    <div style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</div>
                                ) : rootComments.length === 0 ? (
                                    <div style={{ padding: '40px 20px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                        <p style={{ fontWeight: 600 }}>No comments yet.</p>
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
                            <div style={{ padding: '16px', borderTop: '1px solid var(--md-sys-color-outline-variant)', background: 'var(--md-sys-color-surface-container-low)' }}>
                                {replyTo && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-primary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Replying to @{replyTo.profiles.username}</span>
                                        <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={12} /></button>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '0', background: 'var(--md-sys-color-surface-container-highest)', overflow: 'hidden', flexShrink: 0 }}>
                                        {/* Your Avatar */}
                                        {userProfile?.avatar_url || currentUser?.user_metadata?.avatar_url ? (
                                            <img src={userProfile?.avatar_url || currentUser.user_metadata.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--md-sys-color-surface-container-highest), var(--md-sys-color-surface-container-low))' }} />
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
                                            background: 'var(--md-sys-color-surface-container-lowest)',
                                            border: '1px solid var(--md-sys-color-outline-variant)',
                                            borderRadius: 'var(--md-shape-corner-full)',
                                            padding: '10px 18px',
                                            color: 'var(--md-sys-color-on-surface)',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            transition: 'var(--transition)'
                                        }}
                                    />
                                    <button
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim() || isPosting}
                                        className="font-display"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: newComment.trim() ? 'var(--md-sys-color-primary)' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontWeight: 700
                                        }}
                                    >
                                        Post
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
            <div style={{ width: isReply ? '24px' : '32px', height: isReply ? '24px' : '32px', borderRadius: '0', background: 'var(--md-sys-color-surface-container-highest)', overflow: 'hidden', flexShrink: 0 }}>
                {comment.profiles.avatar_url ? (
                    <img src={comment.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isReply ? '0.65rem' : '0.8rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>{comment.profiles.username[0].toUpperCase()}</div>
                )}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                    <span className="font-display" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)' }}>{comment.profiles.username}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatFriendlyDate(comment.created_at)}</span>
                </div>
                <p style={{ margin: '4px 0 8px', fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {comment.content}
                </p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <button onClick={onReply} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>Reply</button>
                    {currentUser?.id === comment.user_id && (
                        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#ff453a', padding: 0, cursor: 'pointer' }}>Delete</button>
                    )}
                </div>
            </div>
        </div>
    );
}
