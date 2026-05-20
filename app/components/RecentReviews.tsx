'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { User } from 'lucide-react';
import { getRecentReviews } from '../actions/review';
import VinylRecordDisplay from './VinylRecordDisplay';

type Review = {
    id: string;
    rating: number;
    review_text: string | null;
    album_id: string;
    profiles: {
        username: string | null;
        avatar_url: string | null;
    } | null;
    albums: {
        name: string;
        cover_image: string | null;
        spotify_id: string | null;
    } | null;
};

export default function RecentReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function fetchReviews() {
            setLoading(true);
            try {
                const data = await getRecentReviews();
                console.log('RecentReviews Data (Server Action):', data);
                if (data) {
                    setReviews(data as any);
                }
            } catch (error) {
                console.error('RecentReviews Error:', error);
            }
            setLoading(false);
        }

        fetchReviews();

        // Realtime Subscription
        const channel = supabase
            .channel('realtime-reviews')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'reviews' },
                async (payload) => {
                    console.log('New review!', payload);
                    // Fetch the full review with relations
                    const { data, error } = await supabase
                        .from('reviews')
                        .select(`
                            id,
                            rating,
                            review_text,
                            album_id,
                            profiles (
                                username,
                                avatar_url
                            ),
                            albums (
                                name,
                                cover_image,
                                spotify_id
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single();

                    if (data && !error) {
                        setReviews((prev) => [data as any, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);


    return (
        <>
            <section style={{
                padding: '100px 0',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 2
            }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '3rem',
                        fontWeight: '800',
                        letterSpacing: '-0.03em',
                        marginBottom: '10px',
                        background: 'linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--md-sys-color-tertiary) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        On The Record
                    </h3>
                    <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '1.1rem' }}>
                        Join the conversation. See what the Spinyl community is listening to right now.
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : reviews.length > 0 ? (
                    <div style={{
                        display: 'flex',
                        width: 'fit-content',
                        gap: '24px'
                    }} className="animate-marquee-fast">
                        {/* Render twice for seamless loop */}
                        {[...reviews, ...reviews].map((review, index) => {
                            const album = Array.isArray(review.albums) ? review.albums[0] : review.albums;
                            const profile = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles;

                            if (!album?.spotify_id) return null;

                            return (
                                <Link 
                                    href={`/album/${album.spotify_id}`} 
                                    key={`${review.id}-${index}`} 
                                    className="review-card-responsive review-m3-card" 
                                    style={{
                                        padding: '20px',
                                        borderRadius: 'var(--md-shape-corner-large)',
                                        flexShrink: 0,
                                        background: 'var(--md-sys-color-surface-container)',
                                        border: '1px solid var(--md-sys-color-outline-variant)',
                                        display: 'flex',
                                        gap: '16px',
                                        alignItems: 'center',
                                        transition: 'var(--transition-spring)',
                                        textDecoration: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {/* Vinyl Sleeve + Record Display */}
                                    <div style={{ marginRight: '30px' /* Space for peeking vinyl */ }}>
                                        <VinylRecordDisplay
                                            coverUrl={album?.cover_image}
                                            rating={review.rating}
                                            size={80}
                                        />
                                    </div>

                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        {/* Header: User Info & Rating Badge */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: 'var(--md-shape-corner-full)',
                                                    background: 'var(--md-sys-color-surface-container-highest)',
                                                    border: '1px solid var(--md-sys-color-outline-variant)',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <User size={12} color="var(--md-sys-color-primary)" />
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--md-sys-color-on-surface)' }}>@{profile?.username || 'Unknown'}</span>
                                            </div>

                                            {/* Rating Text Badge */}
                                            <div style={{
                                                background: 'var(--md-sys-color-tertiary-container)',
                                                border: '1px solid var(--md-sys-color-outline-variant)',
                                                padding: '2px 8px',
                                                borderRadius: 'var(--md-shape-corner-medium)',
                                            }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    color: 'var(--md-sys-color-on-tertiary-container)'
                                                }}>
                                                    {review.rating}/10
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <p style={{
                                            color: 'var(--md-sys-color-on-surface-variant)',
                                            fontSize: '0.85rem',
                                            lineHeight: '1.4',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontStyle: 'italic'
                                        }}>
                                            "{review.review_text || 'No comment'}"
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)', padding: '40px' }}>
                        <p>No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </section>
            <style jsx global>{`
               .review-card-responsive {
                   width: 380px;
               }
               .review-m3-card:hover {
                   transform: scale(1.04) translateY(-3px);
                   background: var(--md-sys-color-surface-container-high) !important;
                   border-color: var(--md-sys-color-primary) !important;
                   box-shadow: 0 10px 25px rgba(0,0,0,0.3), 0 0 15px rgba(255, 159, 104, 0.1);
               }
               @media (max-width: 768px) {
                   .review-card-responsive {
                       width: 300px !important;
                   }
               }
            `}</style>
        </>
    );
}
