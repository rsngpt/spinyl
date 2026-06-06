'use client';

import { getBrowserClient } from '@/src/lib/supabase-client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginButton from './LoginButton';
import { submitReview, deleteReview } from '../actions/review';
import Link from 'next/link';
import VinylRatingInput from './VinylRatingInput';
import { Share2, MessageCircle, Heart, MoreHorizontal, Download, Plus } from 'lucide-react';
import SpinylCard from './SpinylCard';
import ReviewModal from './ReviewModal';
import InstagramStoryCard from './InstagramStoryCard';
import html2canvas from 'html2canvas';
import { formatFriendlyDate, formatFriendlyTime } from '../../src/lib/date-utils';
import DefaultAvatar from './DefaultAvatar';




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

const ReviewItem = ({
    review,
    setReviewToShare,
    handleShareToStory,
    onOpenComments,
    currentUser,
    isGeneratingStory
}: {
    review: Review,
    setReviewToShare: (r: Review) => void,
    handleShareToStory: (r: Review) => void,
    onOpenComments: () => void,
    currentUser: any,
    isGeneratingStory: boolean
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false); // Placeholder

    const profile = review.profiles || { username: 'Unknown User', avatar_url: null };

    // Format Date & Time
    const dateStr = formatFriendlyDate(review.created_at);
    const timeStr = formatFriendlyTime(review.created_at);

    // Truncation Logic
    const CHAR_THRESHOLD = 150;
    const isLongReview = review.review_text.length > CHAR_THRESHOLD;
    const quotedText = `"${review.review_text}"`;

    return (
        <div className="review-card-item" style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '24px',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            alignItems: 'flex-start',
            boxSizing: 'border-box',
            width: '100%'
        }}>
            {/* LEFT COLUMN: Sleeve (User PFP) + Vinyl Disc */}
            <div className="review-vinyl-wrapper" style={{
                position: 'relative',
                flexShrink: 0
            }}>
                {/* Vinyl Record (fitted more than half visible, edge-to-edge) */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '55%',
                    width: '100%',
                    height: '100%',
                    zIndex: 5,
                    animation: 'spin 12s linear infinite',
                }}>
                    <VinylRatingInput value={review.rating} onChange={() => { }} readonly />
                </div>

                {/* Sleeve (User PFP) */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '0',
                    overflow: 'hidden',
                    zIndex: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    background: '#1a1513',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
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
                            background: 'linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--md-sys-color-tertiary) 100%)',
                            color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 900,
                            fontSize: '1.8rem',
                            letterSpacing: '-1px'
                        }}>
                            {getInitials(profile.username || 'Unknown')}
                        </div>
                    )}
                    {/* Glare sheen */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(125deg, rgba(255,255,255,0.12) 0%, transparent 45%)',
                        pointerEvents: 'none'
                    }} />
                </div>
            </div>

            {/* RIGHT COLUMN: Review Information & Verdict */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
                {/* Header: Username, Date/Time & Rating badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
                        <Link href={`/profile/${review.user_id}`} style={{ textDecoration: 'none', color: '#fff' }}>
                            <span className="font-display" style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                                {profile.username}
                            </span>
                        </Link>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>&bull;</span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                            {dateStr} {timeStr}
                        </span>
                    </div>

                    {/* Pill Rating Badge */}
                    <div style={{
                        border: '1.5px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: '24px',
                        padding: '6px 14px',
                        background: 'transparent',
                        flexShrink: 0
                    }}>
                        <span className="font-display" style={{
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            color: '#fff',
                            letterSpacing: '-0.02em'
                        }}>
                            {review.rating}/10
                        </span>
                    </div>
                </div>

                {/* Review text body */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={{
                        margin: 0,
                        lineHeight: '1.6',
                        color: 'rgba(255, 255, 255, 0.75)',
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
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                marginTop: '6px',
                                padding: 0,
                                textDecoration: 'underline',
                                alignSelf: 'flex-start'
                            }}
                        >
                            {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>

                {/* Action Bar footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px', color: 'rgba(255, 255, 255, 0.5)' }}>
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: isLiked ? 'var(--md-sys-color-tertiary)' : 'inherit', transition: 'color 0.2s' }}
                    >
                        <Heart size={18} fill={isLiked ? "var(--md-sys-color-tertiary)" : "none"} style={{ transition: 'transform 0.2s' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{isLiked ? '1' : ''}</span>
                    </button>

                    <button
                        onClick={onOpenComments}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit', transition: 'color 0.2s' }}
                    >
                        <MessageCircle size={18} />
                    </button>

                    {/* Share Button (Story) */}
                    <button
                        onClick={() => handleShareToStory(review)}
                        disabled={isGeneratingStory}
                        title="Share as Instagram Story"
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: isGeneratingStory ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'inherit',
                            transition: 'color 0.2s',
                            marginLeft: 'auto',
                            opacity: isGeneratingStory ? 0.5 : 1
                        }}
                    >
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            <style jsx>{`
                .review-vinyl-wrapper {
                    width: 110px;
                    height: 110px;
                    margin-right: 65px;
                }
                @media (max-width: 600px) {
                    .review-vinyl-wrapper {
                        width: 80px;
                        height: 80px;
                        margin-right: 48px;
                    }
                }
            `}</style>
        </div>
    );
};

export default function ReviewSection({
    initialReviews,
    albumData,
    currentUser,
    isMobileActive = false
}: {
    initialReviews: Review[];
    albumData: AlbumData;
    currentUser?: any;
    isMobileActive?: boolean;
}) {
    const [supabase] = useState(() => getBrowserClient()!);
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(currentUser || null);
    const [userProfile, setUserProfile] = useState<{ username: string; avatar_url: string | null } | null>(null);
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

    // Instagram Story Generation State
    const [storyData, setStoryData] = useState<any | null>(null);
    const storyCardRef = useRef<HTMLDivElement>(null);

    const [isGeneratingStory, setIsGeneratingStory] = useState(false);

    const handleShareToStory = async (review: Review) => {
        if (isGeneratingStory) return;
        setIsGeneratingStory(true);

        // 1. Set data to render the hidden card
        setStoryData({
            albumName: albumData.name,
            artistName: albumData.artists.join(', '),
            coverUrl: albumData.cover_image,
            rating: review.rating,
            reviewText: review.review_text,
            username: review.profiles?.username || 'User',
            userAvatar: review.profiles?.avatar_url
        });

        // 2. Wait for state update and render
        // Increased timeout to 500ms to allow DOM to settle and image to potentially start loading
        setTimeout(async () => {
            if (storyCardRef.current) {
                try {
                    console.log("Starting Capture...");
                    const canvas = await html2canvas(storyCardRef.current, {
                        useCORS: true,
                        scale: 2, // High res for quality
                        backgroundColor: '#111',
                        logging: true,
                        allowTaint: true,
                        foreignObjectRendering: false // sometimes helps with filters
                    });

                    console.log("Capture complete. Downloading...");
                    const link = document.createElement('a');
                    link.download = `spinyl-story-${albumData.name.replace(/\s+/g, '-')}.png`;
                    link.href = canvas.toDataURL('image/png', 1.0);
                    link.click();
                } catch (err) {
                    console.error("Story generation failed:", err);
                    alert("Failed to generate story image. Check console for details.");
                } finally {
                    setStoryData(null); // Cleanup
                    setIsGeneratingStory(false);
                }
            } else {
                console.error("Story card ref missing");
                setIsGeneratingStory(false);
            }
        }, 1000); // Give it a full second for images to be ready
    };

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

    useEffect(() => {
        const handleWriteTrigger = () => {
            setShowForm(true);
        };

        if (searchParams.get('writeReview') === 'true' && user) {
            setShowForm(true);
        }

        window.addEventListener('writeReviewTriggered', handleWriteTrigger);
        return () => {
            window.removeEventListener('writeReviewTriggered', handleWriteTrigger);
        };
    }, [searchParams, user]);

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
        const fetchUserProfile = async (userId: string) => {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', userId)
                    .single();
                if (profile) {
                    setUserProfile(profile);
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
            }
        };

        // If we didn't get a user from server props, try fetching client-side
        if (!currentUser) {
            const getUser = async () => {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                setUser(authUser);
                if (authUser) {
                    fetchUserProfile(authUser.id);
                }
            };
            getUser();
        } else {
            setUser(currentUser);
            if (currentUser) {
                fetchUserProfile(currentUser.id);
            }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const authUser = session?.user ?? null;
                setUser(authUser);
                if (authUser) {
                    fetchUserProfile(authUser.id);
                } else {
                    setUserProfile(null);
                }
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
                        username: userProfile?.username || user.user_metadata?.username || user.email?.split('@')[0] || 'User',
                        avatar_url: userProfile?.avatar_url || user.user_metadata?.avatar_url || null
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
        <div style={{ background: 'transparent', padding: 0 }}>
            {/* HIDDEN STORY CARD FOR GENERATION */}
            {storyData && (
                <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                    <InstagramStoryCard ref={storyCardRef} {...storyData} />
                </div>
            )}

            {/* SINGLE Shared Review Modal for Deep Linking */}
            {activeReview && (
                <ReviewModal
                    isOpen={!!activeReview}
                    onClose={() => setActiveReview(null)}
                    review={activeReview}
                    spotifyId={albumData.spotify_id}
                    currentUser={user}
                    userProfile={userProfile}
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
                <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--md-sys-color-on-surface)' }}>Reviews</h2>
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
                        className="m3-btn-primary desktop-only"
                    >
                        {reviews.some(r => r.user_id === user.id) ? 'Edit Review' : 'Write a Review'}
                    </button>
                )}
            </div>

            {/* Mobile Android-style Floating Action Button (FAB) */}
            {user && isMobileActive && !showForm && (
                <button
                    onClick={() => {
                        const existingReview = reviews.find(r => r.user_id === user.id);
                        if (existingReview) {
                            setRating(existingReview.rating);
                            setReviewText(existingReview.review_text);
                        } else {
                            setRating(8);
                            setReviewText('');
                        }
                        setShowForm(true);
                    }}
                    className="m3-fab"
                    title={reviews.some(r => r.user_id === user.id) ? "Edit Review" : "Write a Review"}
                >
                    <Plus size={24} />
                </button>
            )}

            {!user ? (
                <div style={{ textAlign: 'center', padding: '32px', background: 'var(--md-sys-color-surface-container-low)', border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: 'var(--md-shape-corner-large)' }}>
                    <p style={{ marginBottom: '10px', color: 'var(--md-sys-color-on-surface-variant)' }}>Log in to rate and review this album.</p>
                </div>
            ) : showForm && (
                <div className="m3-review-form-container">
                    <form onSubmit={handleSubmit} className="m3-review-form-inner">
                        {/* Drag Handle for mobile Bottom Sheet */}
                        <div className="m3-bottom-sheet-handle" />

                        <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: 'var(--md-sys-color-on-surface)' }}>
                            {reviews.some(r => r.user_id === user?.id) ? 'Edit Your Verdict' : 'Write a Verdict'}
                        </h3>

                        {/* NEW VINYL RATING */}
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                            <VinylRatingInput value={rating} onChange={setRating} />
                        </div>

                        <div className="m3-text-field-container" style={{ marginBottom: '24px' }}>
                            <span className="m3-text-field-label">Verdict Review</span>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={4}
                                className="m3-text-field"
                                placeholder="Share your thoughts... (Why is this a masterpiece or trash?)"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {reviews.some(r => r.user_id === user?.id) && (
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    disabled={isDeleting}
                                    className="m3-btn-danger"
                                    style={{ marginRight: 'auto' }}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="m3-btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="m3-btn-primary"
                            >
                                {isSubmitting ? 'Posting...' : 'Post Verdict'}
                            </button>
                        </div>
                    </form>
                </div>
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
                            handleShareToStory={handleShareToStory}
                            onOpenComments={() => setActiveReview(review)}
                            currentUser={user}
                            isGeneratingStory={isGeneratingStory}
                        />
                    ))
                )}
            </div >
        </div >
    );
}
