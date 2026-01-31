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
            // Simple hash of the ID
            const hash = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return {
                ...p,
                layoutType: hash % 7 === 0 ? 'horizontal' : 'vertical' // ~14% chance (similar to 0.85)
            };
        });
    };

    const [posts, setPosts] = useState<any[]>(() => {
        // Deduplicate initial posts just in case the server sent duplicates
        const uniqueInitial = initialPosts.filter((post, index, self) =>
            index === self.findIndex((t) => t.id === post.id)
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
                    // Filter out duplicates (based on ID)
                    const uniqueNext = enhancedNext.filter(
                        newPost => !prev.some(existing => existing.id === newPost.id)
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
                        className={`masonry-item ${post.layoutType === 'horizontal' && post.type === 'review' ? 'wide-span' : ''}`}
                        style={{
                            animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`, // Smoother easing
                            animationDelay: `${(index % 10) * 0.1}s`,
                            opacity: 0,
                        }}
                    >
                        {post.type === 'review' ? (
                            <FeedPost post={post} variant={post.layoutType} />
                        ) : (
                            <FeedHotTake item={post} />
                        )}
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
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                }

                @keyframes fadeInUp {
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
                    column-gap: 20px;
                }

                .masonry-item {
                    break-inside: avoid;
                    margin-bottom: 20px;
                }
                
                .wide-span {
                    column-span: all;
                    margin-top: 20px;
                    margin-bottom: 20px;
                }

                /* Responsive Columns */
                @media (max-width: 1200px) {
                    .masonry-grid {
                        column-count: 3;
                    }
                }

                @media (max-width: 900px) {
                    .masonry-grid {
                        column-count: 2;
                        column-gap: 16px; 
                    }
                    .feed-list-container {
                        padding: 12px;
                    }
                }

                @media (max-width: 500px) {
                    .masonry-grid {
                        column-count: 2; 
                        column-gap: 10px;
                    }
                    .masonry-item {
                        margin-bottom: 12px;
                    }
                    .feed-list-container {
                        padding: 8px;
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
                    color: #1DB954; /* Spotify Green for loading */
                }

                .end-msg {
                    color: #666;
                    font-size: 0.9rem;
                    opacity: 0.7;
                }
            `}</style>
        </div>
    );
}
