'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
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
        <motion.button
            onClick={handleToggleFollow}
            disabled={isPending}
            whileHover={{ 
                scale: 1.05,
                boxShadow: isFollowing 
                    ? '0 0 15px rgba(255, 159, 104, 0.15)' 
                    : '0 8px 24px rgba(255, 159, 104, 0.35)',
                background: isFollowing 
                    ? 'rgba(255, 159, 104, 0.08)' 
                    : 'var(--md-sys-color-primary)',
                borderColor: isFollowing 
                    ? 'var(--md-sys-color-primary)' 
                    : 'transparent'
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 15 }}
            style={{
                padding: '8px 24px',
                borderRadius: '500px',
                border: isFollowing ? '1px solid var(--md-sys-color-outline-variant)' : '1px solid transparent',
                background: isFollowing ? 'transparent' : 'var(--md-sys-color-primary)',
                color: isFollowing ? '#fff' : 'var(--md-sys-color-on-primary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
            }}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </motion.button>
    );
}
