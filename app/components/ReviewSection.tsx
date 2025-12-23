'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState, useEffect } from 'react';
import LoginButton from './LoginButton';
import { submitReview } from '../actions/review';

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
};

type AlbumData = {
    spotify_id: string;
    name: string;
    release_date: string;
    cover_image: string;
    artists: string[];
};

export default function ReviewSection({
    initialReviews,
    albumData,
}: {
    initialReviews: Review[];
    albumData: AlbumData;
}) {
    // We use initialReviews from props which are fresh from the server on revalidate
    const [user, setUser] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        // Subscribe to changes (optional, but good for real-time)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('spotify_id', albumData.spotify_id);
            formData.append('album_name', albumData.name);
            formData.append('cover_image', albumData.cover_image);
            // Note: cover_image might be undefined/null, handle carefully if needed, 
            // but formData sends "undefined" string if so. 
            // Better to send empty string if null.
            if (!albumData.cover_image) formData.append('cover_image', '');

            formData.append('artist_names', albumData.artists.join(', '));
            formData.append('release_date', albumData.release_date);
            formData.append('rating', rating.toString());
            formData.append('review_text', reviewText);

            const result = await submitReview(formData);

            if (!result.success) {
                throw new Error(result.message || 'Failed to submit review');
            }

            // Success
            setReviewText('');
            setRating(0);
            setShowForm(false);
            // Router refresh is not needed because Server Actions revalidatePath 
            // and we (the client component) will receive the new props automatically 
            // if this component is re-rendered by the parent. 
            // However, Next.js Server Actions revalidatePath refreshes the route.
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to post review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ background: '#181818', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Reviews</h2>
                {user && !showForm && (
                    <button
                        onClick={() => {
                            const existingReview = initialReviews.find(r => r.user_id === user.id);
                            if (existingReview) {
                                setRating(existingReview.rating);
                                setReviewText(existingReview.review_text);
                            } else {
                                setRating(0);
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
                        {initialReviews.some(r => r.user_id === user.id) ? 'Edit Review' : 'Write a Review'}
                    </button>
                )}
            </div>

            {!user ? (
                <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '10px' }}>Log in to rate and review this album.</p>
                </div>
            ) : showForm && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Rating</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        color: star <= rating ? '#FFD700' : '#444',
                                        transition: 'color 0.2s',
                                    }}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
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
                            placeholder="Share your thoughts..."
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
                            disabled={isSubmitting || rating === 0}
                            style={{
                                padding: '8px 24px',
                                background: 'var(--primary)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '20px',
                                fontWeight: 600,
                                cursor: isSubmitting || rating === 0 ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting || rating === 0 ? 0.5 : 1,
                            }}
                        >
                            {isSubmitting ? 'Posting...' : 'Post Review'}
                        </button>
                    </div>
                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {initialReviews.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first!</p>
                ) : (
                    initialReviews.map((review) => (
                        <div key={review.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ color: '#FFD700' }}>{'★'.repeat(review.rating)}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p style={{ margin: 0, lineHeight: '1.5' }}>{review.review_text}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
