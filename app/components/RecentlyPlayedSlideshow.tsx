'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

type PlayHistoryItem = {
    track: {
        id: string;
        name: string;
        album: {
            id: string;
            name: string;
            images: { url: string }[];
        };
        artists: {
            name: string;
        }[];
    };
    played_at: string;
};

export default function RecentlyPlayedSlideshow() {
    const [items, setItems] = useState<PlayHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                fetchRecentlyPlayed();
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchRecentlyPlayed();
            } else {
                setItems([]);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchRecentlyPlayed = async () => {
        try {
            const res = await fetch('/api/user/recently-played');
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
            }
        } catch (error) {
            console.error('Failed to fetch recently played:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!session || items.length === 0) {
        return null;
    }

    return (
        <section style={{ padding: '3rem 24px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '1.5rem',
                color: 'var(--md-sys-color-on-background)'
            }}>
                Recently Played
            </h2>

            <div
                className="marquee-container"
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%',
                    maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                }}
            >
                <div
                    className="marquee-track"
                    style={{
                        display: 'flex',
                        gap: '24px',
                        width: 'max-content',
                        paddingBottom: '20px'
                    }}
                >
                    {/* First set of items */}
                    {items.map((item, index) => (
                        <SlideItem key={`original-${index}`} item={item} />
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {items.map((item, index) => (
                        <SlideItem key={`duplicate-${index}`} item={item} />
                    ))}
                </div>
            </div>

            <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .marquee-track {
          animation: scroll 40s linear infinite;
        }
        
        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
}

function SlideItem({ item }: { item: PlayHistoryItem }) {
    return (
        <Link
            href={`/album/${item.track.album.id}`}
            style={{
                textDecoration: 'none',
                color: 'inherit',
                minWidth: '160px',
                maxWidth: '160px',
                transition: 'var(--transition-spring)',
                display: 'block'
            }}
            className="recently-played-slide-item"
        >
            <div style={{
                position: 'relative',
                aspectRatio: '1/1',
                borderRadius: '0',
                overflow: 'hidden',
                marginBottom: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                transition: 'var(--transition-spring)'
            }} className="slide-image-box">
                <img
                    src={item.track.album.images[0]?.url}
                    alt={item.track.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </div>

            <h3 style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--md-sys-color-on-surface)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '4px'
            }}>
                {item.track.name}
            </h3>

            <p style={{
                fontSize: '0.85rem',
                color: 'var(--md-sys-color-on-surface-variant)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {item.track.artists.map(a => a.name).join(', ')}
            </p>

            <style jsx global>{`
                .recently-played-slide-item:hover {
                    transform: scale(1.08);
                }
                .recently-played-slide-item:hover .slide-image-box {
                    box-shadow: 0 8px 25px rgba(255, 159, 104, 0.3);
                    border-color: var(--md-sys-color-primary);
                }
            `}</style>
        </Link>
    );
}
