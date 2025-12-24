'use client';

import { useState, useTransition } from 'react';
import { toggleLikeReview } from '../actions/like';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
    reviewId: string;
    initialIsLiked: boolean;
    initialLikeCount: number;
}

export default function LikeButton({ reviewId, initialIsLiked, initialLikeCount }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggleLike = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if wrapped in Link
        e.stopPropagation();

        const previousIsLiked = isLiked;
        const previousCount = likeCount;

        // Optimistic update
        const newIsLiked = !previousIsLiked;
        setIsLiked(newIsLiked);
        setLikeCount(previousCount + (newIsLiked ? 1 : -1));

        startTransition(async () => {
            try {
                await toggleLikeReview(reviewId);
                router.refresh();
            } catch (error) {
                // Revert on error
                setIsLiked(previousIsLiked);
                setLikeCount(previousCount);
            }
        });
    };

    return (
        <button
            onClick={handleToggleLike}
            disabled={isPending}
            className="like-btn"
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isLiked ? '#E91E63' : '#888',
                fontSize: '0.9rem',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.2s'
            }}
        >
            <span style={{ fontSize: '1.1rem', transform: isLiked ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
                {isLiked ? '❤️' : '🤍'}
            </span>
            <span>{likeCount || 0}</span>
            <style jsx>{`
                .like-btn:hover {
                    background: rgba(255,255,255,0.05);
                    color: ${isLiked ? '#E91E63' : '#fff'};
                }
            `}</style>
        </button>
    );
}
