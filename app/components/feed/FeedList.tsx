'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FeedItem, getGlobalFeed } from '../../actions/feed';
import FeedPost from './FeedPost';
import FeedHotTake from './FeedHotTake';
import { Loader2 } from 'lucide-react';

interface FeedListProps {
    initialPosts: FeedItem[];
}

export default function FeedList({ initialPosts }: FeedListProps) {
    // Enhance posts with layout type (Vertical or Horizontal)
    // Use deterministic hash based on ID to avoid hydration mismatch
    const enhancePosts = (rawPosts: FeedItem[]) => {
        return rawPosts.map(p => {
            return {
                ...p,
                layoutType: 'vertical'
            };
        });
    };

    const [posts, setPosts] = useState<any[]>(() => {
        // Deduplicate initial posts and only include reviews
        const uniqueInitial = initialPosts.filter((post, index, self) =>
            post.type === 'review' && index === self.findIndex((t) => t.id === post.id)
        );
        return enhancePosts(uniqueInitial);
    });
    const [offset, setOffset] = useState(initialPosts.length);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const nextPosts = await getGlobalFeed(offset, 10);
            if (nextPosts.length === 0) {
                setHasMore(false);
            } else {
                setPosts(prev => {
                    const enhancedNext = enhancePosts(nextPosts);
                    // Filter out duplicates and only include reviews
                    const uniqueNext = enhancedNext.filter(
                        newPost => newPost.type === 'review' && !prev.some(existing => existing.id === newPost.id)
                    );
                    return [...prev, ...uniqueNext];
                });
                setOffset(prev => prev + nextPosts.length);
            }
        } catch (error) {
            console.error("Failed to load more posts", error);
        } finally {
            setLoading(false);
        }
    }, [offset, loading, hasMore]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !loading) {
                loadMore();
            }
        }, {
            root: null,
            rootMargin: '400px', // Load well before the user hits the bottom
            threshold: 0.1
        });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [loadMore, hasMore, loading]);

    return (
        <div className="feed-list-container">
            <div className="masonry-grid">
                {posts.map((post, index) => (
                    <div
                        key={`${post.id}-${post.created_at}`}
                        className="masonry-item"
                        style={{
                            animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`, // Smoother easing
                            animationDelay: `${(index % 10) * 0.1}s`,
                            opacity: 0,
                        }}
                    >
                        <FeedPost post={post} variant={post.layoutType} />
                    </div>
                ))}
            </div>

            {/* Sentinel / Loader Element */}
            <div ref={loaderRef} className="pagination-container">
                {hasMore && (
                    <div className="loader">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                )}
                {!hasMore && posts.length > 0 && (
                    <p className="end-msg">You're all caught up!</p>
                )}
            </div>

            <style jsx>{`
                .feed-list-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px 24px;
                }

                @keyframes :global(fadeInUp) {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .masonry-grid {
                    column-count: 4;
                    column-gap: 24px;
                    width: 100%;
                }

                .masonry-item {
                    width: 100%;
                    display: inline-block;
                    margin-bottom: 24px;
                    break-inside: avoid;
                    box-sizing: border-box;
                }

                /* Responsive Columns */
                @media (max-width: 1200px) {
                    .masonry-grid {
                        column-count: 3;
                        column-gap: 20px;
                    }
                    .masonry-item {
                        margin-bottom: 20px;
                    }
                }

                @media (max-width: 900px) {
                    .masonry-grid {
                        column-count: 2;
                        column-gap: 16px;
                    }
                    .masonry-item {
                        margin-bottom: 16px;
                    }
                    .feed-list-container {
                        padding: 16px;
                    }
                }

                @media (max-width: 600px) {
                    .masonry-grid {
                        column-count: 1;
                        column-gap: 16px;
                    }
                    .feed-list-container {
                        padding: 12px;
                    }
                }

                .pagination-container {
                    display: flex;
                    justify-content: center;
                    padding: 40px 0; /* Space for the loader */
                    min-height: 100px; /* Ensure sentinel has height to be observed */
                    align-items: center;
                    width: 100%;
                }

                .loader {
                    color: var(--md-sys-color-primary); /* Material 3 Orange for loading */
                }

                .end-msg {
                    color: var(--md-sys-color-on-surface-variant);
                    font-size: 0.95rem;
                    opacity: 0.7;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                }
            `}</style>
        </div>
    );
}
