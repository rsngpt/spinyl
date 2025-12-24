'use client';

import { useState, useTransition } from 'react';
import { followUser, unfollowUser } from '../actions/follow';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
}

export default function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggleFollow = async () => {
        const previousState = isFollowing;
        // Optimistic update
        setIsFollowing(!previousState);

        startTransition(async () => {
            try {
                if (previousState) {
                    await unfollowUser(targetUserId);
                } else {
                    await followUser(targetUserId);
                }
                router.refresh();
            } catch (error) {
                // Revert on error
                setIsFollowing(previousState);
                console.error('Failed to toggle follow:', error);
            }
        });
    };

    return (
        <button
            onClick={handleToggleFollow}
            disabled={isPending}
            style={{
                padding: '8px 24px',
                borderRadius: '500px',
                border: isFollowing ? '1px solid #555' : 'none',
                background: isFollowing ? 'transparent' : 'var(--primary)',
                color: isFollowing ? '#fff' : '#000',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: isPending ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
                if (!isFollowing) e.currentTarget.style.transform = 'scale(1.05)';
                if (isFollowing) e.currentTarget.style.borderColor = '#fff';
            }}
            onMouseOut={(e) => {
                if (!isFollowing) e.currentTarget.style.transform = 'scale(1)';
                if (isFollowing) e.currentTarget.style.borderColor = '#555';
            }}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
}
