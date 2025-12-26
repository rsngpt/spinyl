'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState, useEffect } from 'react';
import LoginButton from './LoginButton';
import { submitReview } from '../actions/review';
import Link from 'next/link';
import VinylRatingInput from './VinylRatingInput';
import { Share2 } from 'lucide-react';
import SpinylCard from './SpinylCard';

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

// Helper for initials (moved here as it's used by ReviewItem)
const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const ReviewItem = ({ review, setReviewToShare }: { review: Review, setReviewToShare: (r: Review) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const profile = review.profiles || { username: 'Unknown User', avatar_url: null };

    // Format Date & Time
    const dateObj = new Date(review.created_at);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Truncation Logic
    // We rely on CSS line-clamp for the visual truncation to exactly 3 lines.
    // We use a character threshold heuristic to decide whether to show the "Read more" button at all.
    const CHAR_THRESHOLD = 150;
    const isLongReview = review.review_text.length > CHAR_THRESHOLD;

    // Auto-quote the text
    const quotedText = `"${review.review_text}"`;

    return (
        <div style={{
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '16px 0', // Reduced padding
            position: 'relative'
        }}>
            {/* 3-Column Layout Container */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>

                {/* COLUMN 1: LEFT - Sleeve + Vinyl */}
                <div style={{ position: 'relative', width: '60px', flexShrink: 0 }}>
                    {/* Vinyl Record */}
                    <div style={{
                        position: 'absolute',
                        top: '1px',
                        left: '28px', // Adjusted offset
                        width: '56px', // Smaller vinyl
                        height: '56px',
                        zIndex: 5,
                        animation: 'spin 10s linear infinite',
                        filter: 'brightness(0.9)'
                    }}>
                        <VinylRatingInput value={review.rating} onChange={() => { }} readonly />
                    </div>

                    {/* Sleeve */}
                    <Link href={`/profile/${review.user_id}`}>
                        <div style={{
                            position: 'relative',
                            width: '60px', // Smaller sleeve
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

                {/* COLUMN 2: MIDDLE - Content (Metadata + Text) */}
                <div style={{ flex: 1, paddingLeft: '34px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Metadata Block */}
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

                    {/* Review Text */}
                    <div>
                        <p style={{
                            margin: 0,
                            lineHeight: '1.5',
                            color: '#ddd',
                            fontSize: '0.9rem', // Smaller text
                            whiteSpace: 'pre-line', // Preserves newlines

                            // CSS Line Clamping
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
                                    marginTop: '2px', // Tighter spacing
                                    padding: 0,
                                    textDecoration: 'underline'
                                }}
                            >
                                {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                        )}
                    </div>
                </div>

                {/* COLUMN 3: RIGHT - Actions & Rating */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', minWidth: '80px' }}>

                    {/* Top Right: Rating Badge */}
                    <div style={{
                        background: review.rating >= 8 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.08)',
                        border: review.rating >= 8 ? '1px solid rgba(255,215,0,0.4)' : '1px solid #444',
                        padding: '2px 0', // Tighter vertical padding
                        width: '42px', // Smaller fixed width
                        borderRadius: '4px', // Slightly sharper corners
                        textAlign: 'center',
                        flexShrink: 0
                    }}>
                        <span style={{
                            fontWeight: 800, // Slightly less heavy to match size
                            fontSize: '0.85rem', // Smaller text
                            color: review.rating >= 8 ? '#FFD700' : '#fff',
                            letterSpacing: '-0.05em'
                        }}>
                            {review.rating}/10
                        </span>
                    </div>

                    {/* Bottom Right: Share Button */}
                    <button
                        onClick={() => setReviewToShare(review)}
                        title="Share Spinyl Card"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#666';
                        }}
                    >
                        <Share2 size={18} />
                    </button>
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
    currentUser?: any; // Accepting the user object from server
}) {
    // Initialize user state with the server-passed user if available
    const [user, setUser] = useState<any>(currentUser || null);
    const [rating, setRating] = useState(1); // Default to 1 (Scale 1-10)
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false); // Keep this state for form visibility
    const [reviews, setReviews] = useState<Review[]>(initialReviews); // Manage reviews in state
    const [reviewToShare, setReviewToShare] = useState<Review | null>(null);

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

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                        <ReviewItem key={review.id} review={review} setReviewToShare={setReviewToShare} />
                    ))
                )}
            </div >
        </div >
    );
}
