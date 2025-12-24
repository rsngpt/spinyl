'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Star, User } from 'lucide-react';

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

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function fetchReviews() {
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
                .order('created_at', { ascending: false })
                .limit(10);

            if (!error && data) {
                setReviews(data as any);
            } else if (error) {
                console.error('Error fetching reviews:', error);
            }
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

    if (reviews.length === 0) return null;

    return (
        <section style={{
            padding: '60px 0',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 2
        }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h3 className="text-gradient" style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    letterSpacing: '-0.03em',
                    marginBottom: '10px'
                }}>
                    On The Record
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
                    Join the conversation. See what the Spinyl community is listening to right now.
                </p>
            </div>

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
                        <Link href={`/album/${album.spotify_id}`} key={`${review.id}-${index}`} className="glass-panel review-card-glow" style={{
                            width: '350px',
                            padding: '20px',
                            borderRadius: '16px',
                            flexShrink: 0,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'start',
                            transition: 'all 0.3s ease',
                            textDecoration: 'none',
                            cursor: 'pointer'
                        }}>
                            {/* Album Art */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                background: '#222'
                            }}>
                                {album?.cover_image ? (
                                    <img src={album.cover_image} alt={album.name || 'Album'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                                        <Disc size={24} />
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                {/* Header: User Info */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: '#333',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={14} color="#fff" />
                                        )}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }}>@{profile?.username || 'Unknown'}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} fill={i < review.rating ? "#1DB954" : "none"} color={i < review.rating ? "#1DB954" : "#555"} />
                                    ))}
                                </div>

                                {/* Content */}
                                <p style={{
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: '0.9rem',
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
        </section >
    );
}

import { Disc } from 'lucide-react';
