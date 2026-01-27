'use client';

import React, { useState } from 'react';
import { FeedItem, getGlobalFeed } from '../../actions/feed';
import FeedPost from './FeedPost';
import { Loader2 } from 'lucide-react';

interface FeedListProps {
    initialPosts: FeedItem[];
}

export default function FeedList({ initialPosts }: FeedListProps) {
    const [posts, setPosts] = useState<FeedItem[]>(initialPosts);
    const [offset, setOffset] = useState(initialPosts.length);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const nextPosts = await getGlobalFeed(offset, 10);
            if (nextPosts.length === 0) {
                setHasMore(false);
            } else {
                setPosts(prev => [...prev, ...nextPosts]);
                setOffset(prev => prev + nextPosts.length);
            }
        } catch (error) {
            console.error("Failed to load more posts", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="feed-list-container">
            {posts.map((post, index) => (
                <div
                    key={`${post.id}-${post.created_at}`}
                    style={{
                        animation: `fadeInUp 0.5s ease forwards`,
                        animationDelay: `${index * 0.1}s`,
                        opacity: 0,
                        transform: 'translateY(20px)'
                    }}
                >
                    <FeedPost post={post} />
                </div>
            ))}

            <div className="pagination-container">
                {loading ? (
                    <div className="loader">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : hasMore ? (
                    <button onClick={loadMore} className="load-more-btn">
                        Load More
                    </button>
                ) : (
                    <p className="end-msg">You're all caught up!</p>
                )}
            </div>

            <style jsx>{`
                .feed-list-container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .pagination-container {
                    display: flex;
                    justify-content: center;
                    padding: 40px 0;
                }

                .load-more-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 30px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .load-more-btn:hover {
                    background: white;
                    color: black;
                    transform: translateY(-2px);
                }

                .loader {
                    color: var(--primary);
                }

                .end-msg {
                    color: #666;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
}
