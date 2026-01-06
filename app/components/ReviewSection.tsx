'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginButton from './LoginButton';
import { submitReview, deleteReview } from '../actions/review';
import Link from 'next/link';
import VinylRatingInput from './VinylRatingInput';
import { Share2, MessageCircle, Heart, MoreHorizontal } from 'lucide-react';
import SpinylCard from './SpinylCard';
import ReviewModal from './ReviewModal';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Review = {
    id: string;
    rating: number;
    review_text: string;
    created_at: string;
    user_id: string;
    profiles?: {
        username: string;
        avatar_url: string | null;
    } | null;
};

type AlbumData = {
    spotify_id: string;
    name: string;
    release_date: string;
    cover_image: string;
    artists: string[];
};

// Helper for initials
const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// ReviewItem now delegates Modal opening to parent
const ReviewItem = ({
    review,
    setReviewToShare,
    onOpenComments,
    currentUser
}: {
    review: Review,
    setReviewToShare: (r: Review) => void,
    onOpenComments: () => void,
    currentUser: any
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false); // Placeholder

    const profile = review.profiles || { username: 'Unknown User', avatar_url: null };

    // Format Date & Time
    const dateObj = new Date(review.created_at);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Truncation Logic
    const CHAR_THRESHOLD = 150;
    const isLongReview = review.review_text.length > CHAR_THRESHOLD;
    const quotedText = `"${review.review_text}"`;

    return (
        <div style={{
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '24px 0',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

                {/* LEFT: Sleeve + Vinyl */}
                <div style={{ position: 'relative', width: '60px', flexShrink: 0 }}>
                    <div style={{
                        position: 'absolute',
                        top: '1px',
                        left: '28px',
                        width: '56px',
                        height: '56px',
                        zIndex: 5,
                        animation: 'spin 10s linear infinite',
                        filter: 'brightness(0.9)'
                    }}>
                        <VinylRatingInput value={review.rating} onChange={() => { }} readonly />
                    </div>

                    <Link href={`/profile/${review.user_id}`}>
                        <div style={{
                            position: 'relative',
                            width: '60px',
                            height: '60px',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            zIndex: 10,
                            boxShadow: '3px 0 8px rgba(0,0,0,0.6)',
                            background: '#222',
                            cursor: 'pointer'
                        }}>
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.username}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%', height: '100%',
                                    background: 'linear-gradient(135deg, #444, #222)',
                                    color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem', fontWeight: 800
                                }}>
                                    {getInitials(profile.username)}
                                </div>
                            )}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.1) 0%, transparent 40%)' }} />
                        </div>
                    </Link>
                </div>

                {/* MIDDLE: Content */}
                <div style={{ flex: 1, paddingLeft: '34px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ lineHeight: '1.2' }}>
                        <Link href={`/profile/${review.user_id}`} style={{ textDecoration: 'none', color: '#fff' }}>
                            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                                {profile.username}
                            </div>
                        </Link>
                        <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {dateStr} <span style={{ opacity: 0.5, margin: '0 4px' }}>•</span> {timeStr}
                        </div>
                    </div>

                    <div>
                        <p style={{
                            margin: 0,
                            lineHeight: '1.5',
                            color: '#ddd',
                            fontSize: '0.95rem',
                            whiteSpace: 'pre-line',
                            display: isExpanded ? 'block' : '-webkit-box',
                            WebkitLineClamp: isExpanded ? 'unset' : 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}>
                            {quotedText}
                        </p>
                        {isLongReview && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#888',
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    marginTop: '2px',
                                    padding: 0,
                                    textDecoration: 'underline'
                                }}
                            >
                                {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                        )}
                    </div>

                    {/* ACTION BAR */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px', color: '#888' }}>
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: isLiked ? '#E91E63' : 'inherit', transition: 'color 0.2s' }}
                        >
                            <Heart size={18} fill={isLiked ? "#E91E63" : "none"} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{isLiked ? '1' : ''}</span>
                        </button>

                        <button
                            onClick={onOpenComments}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit', transition: 'color 0.2s' }}
                        >
                            <MessageCircle size={18} />
                            {/* Comments Count could be passed here if we had it */}
                        </button>

                        <button
                            onClick={() => setReviewToShare(review)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', marginLeft: 'auto' }}
                        >
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                </div>

                {/* RIGHT: Rating */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '60px' }}>
                    <div style={{
                        background: review.rating >= 8 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.08)',
                        border: review.rating >= 8 ? '1px solid rgba(255,215,0,0.4)' : '1px solid #444',
                        padding: '2px 0',
                        width: '42px',
                        borderRadius: '4px',
                        textAlign: 'center',
                        flexShrink: 0
                    }}>
                        <span style={{
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: review.rating >= 8 ? '#FFD700' : '#fff',
                            letterSpacing: '-0.05em'
                        }}>
                            {review.rating}/10
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default function ReviewSection({
    initialReviews,
    albumData,
    currentUser,
}: {
    initialReviews: Review[];
    albumData: AlbumData;
    currentUser?: any;
}) {
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(currentUser || null);
    const [rating, setRating] = useState(1); // Default to 1 (Scale 1-10)
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false); // Keep this state for form visibility
    const [reviews, setReviews] = useState<Review[]>(initialReviews); // Manage reviews in state
    const [reviewToShare, setReviewToShare] = useState<Review | null>(null);

    // Deep Linking State
    const [activeReview, setActiveReview] = useState<Review | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Check URL for reviewId to auto-open
    useEffect(() => {
        const reviewId = searchParams.get('reviewId');
        if (reviewId && reviews.length > 0) {
            const target = reviews.find(r => r.id === reviewId);
            if (target) {
                setActiveReview(target);
                // Optional: clear params from URL without reload
            }
        }
    }, [searchParams, reviews]);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!user) return;
        const existingReview = reviews.find(r => r.user_id === user.id);
        if (!existingReview) return;

        setIsDeleting(true);
        try {
            const result = await deleteReview(existingReview.id, albumData.spotify_id);
            if (result.success) {
                // Remove from state
                setReviews(reviews.filter(r => r.id !== existingReview.id));
                // Reset form
                setReviewText('');
                setRating(8);
                setShowForm(false);
                setShowDeleteConfirm(false);
            } else {
                alert(result.message || 'Failed to delete review');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        // If we didn't get a user from server props, try fetching client-side
        if (!currentUser) {
            const getUser = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            };
            getUser();
        } else {
            setUser(currentUser);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('spotify_id', albumData.spotify_id);
            formData.append('album_name', albumData.name);
            formData.append('cover_image', albumData.cover_image);
            formData.append('artist_names', albumData.artists.join(', '));
            formData.append('release_date', albumData.release_date);
            formData.append('rating', rating.toString());
            formData.append('review_text', reviewText);

            // Call the server action
            const result = await submitReview(formData);

            if (result.success && result.review) {
                // Optimistically add the new review to the list
                const newReview: Review = {
                    ...result.review,
                    profiles: {
                        username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
                        avatar_url: user.user_metadata?.avatar_url || null
                    }
                };

                // Check if the user already has a review and update it, otherwise add new
                const existingReviewIndex = reviews.findIndex(r => r.user_id === user.id);
                if (existingReviewIndex > -1) {
                    const updatedReviews = [...reviews];
                    updatedReviews[existingReviewIndex] = newReview;
                    setReviews(updatedReviews);
                } else {
                    setReviews([newReview, ...reviews]);
                }

                // Success
                setReviewText('');
                setRating(8); // Reset to a "Good" default
                setShowForm(false);
            } else {
                throw new Error(result.message || 'Failed to submit review');
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to post review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ background: '#181818', borderRadius: '12px', padding: '24px' }}>
            {/* SINGLE Shared Review Modal for Deep Linking */}
            {activeReview && (
                <ReviewModal
                    isOpen={!!activeReview}
                    onClose={() => setActiveReview(null)}
                    review={activeReview}
                    spotifyId={albumData.spotify_id}
                    currentUser={user}
                />
            )}

            {/* Spinyl Card Modal */}
            {reviewToShare && albumData && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 100,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setReviewToShare(null)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <SpinylCard
                            albumName={albumData.name}
                            artistName={albumData.artists.join(', ')}
                            coverUrl={albumData.cover_image}
                            rating={reviewToShare.rating}
                            reviewText={reviewToShare.review_text}
                            username={reviewToShare.profiles?.username || 'User'}
                            onClose={() => setReviewToShare(null)}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 101, // Above everything
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setShowDeleteConfirm(false)}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#222',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            textAlign: 'center'
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.2rem', color: '#fff' }}>Delete Review?</h3>
                        <p style={{ color: '#aaa', marginBottom: '24px', lineHeight: '1.5' }}>
                            Are you sure you want to delete your review? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                    border: '1px solid #444',
                                    background: 'transparent',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: '#ff3b30',
                                    color: '#fff',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    opacity: isDeleting ? 0.7 : 1
                                }}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Reviews</h2>
                {user && !showForm && (
                    <button
                        onClick={() => {
                            const existingReview = reviews.find(r => r.user_id === user.id);
                            if (existingReview) {
                                setRating(existingReview.rating);
                                setReviewText(existingReview.review_text);
                            } else {
                                setRating(8); // Default to Mint on new review
                                setReviewText('');
                            }
                            setShowForm(true);
                        }}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            background: 'var(--primary)',
                            color: '#000',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {reviews.some(r => r.user_id === user.id) ? 'Edit Review' : 'Write a Review'}
                    </button>
                )}
            </div>

            {!user ? (
                <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '10px' }}>Log in to rate and review this album.</p>
                </div>
            ) : showForm && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
                    {/* NEW VINYL RATING */}
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                        <VinylRatingInput value={rating} onChange={setRating} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Review</label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                            style={{
                                width: '100%',
                                background: '#222',
                                border: '1px solid #333',
                                borderRadius: '4px',
                                color: '#fff',
                                padding: '12px',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                            }}
                            placeholder="Share your thoughts... (Why is this a masterpiece or trash?)"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {reviews.some(r => r.user_id === user?.id) && (
                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                disabled={isDeleting}
                                style={{
                                    marginRight: 'auto',
                                    padding: '8px 16px',
                                    background: 'rgba(255, 59, 48, 0.1)',
                                    border: '1px solid rgba(255, 59, 48, 0.3)',
                                    color: '#ff3b30',
                                    borderRadius: '20px',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            style={{
                                padding: '8px 16px',
                                background: 'transparent',
                                border: '1px solid #444',
                                color: '#fff',
                                borderRadius: '20px',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '8px 24px',
                                background: 'var(--primary)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '20px',
                                fontWeight: 600,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.5 : 1,
                            }}
                        >
                            {isSubmitting ? 'Posting...' : 'Post Verdict'}
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to judge.</p>
                ) : (
                    reviews.map((review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            setReviewToShare={setReviewToShare}
                            onOpenComments={() => setActiveReview(review)} // Open centralized modal
                            currentUser={user}
                        />
                    ))
                )}
            </div >
        </div >
    );
}
