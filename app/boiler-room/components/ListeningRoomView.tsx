'use client';

import React, { useState } from 'react';
import Composer from './Composer';
import TrendingDiscussions, { Discussion } from './TrendingDiscussions';
import DailyPrompt from './DailyPrompt';
import CommunityPoll from './CommunityPoll';

export interface Comment {
    id: string;
    author: string;
    content: string;
    timeAgo: string;
    parentId: string | null;
}

const INITIAL_DISCUSSIONS: Discussion[] = [
    {
        id: 'disc-1',
        title: 'Is Rockstar the greatest Bollywood soundtrack ever?',
        repliesCount: 3,
        likesCount: 128,
        liked: false,
        categoryTag: 'Soundtracks',
        author: 'ar_rahman_fan',
        timeAgo: '2h ago',
        commentsList: [
            { id: 'c1-1', author: 'kunal_ghose', content: 'Yes, Kun Faya Kun is a spiritual experience. Nothing matches this.', timeAgo: '1h ago', parentId: null },
            { id: 'c1-2', author: 'mohit_chauhan_stan', content: 'Mohit Chauhans vocals on Aur Ho and Nadaan Parindey are legendary.', timeAgo: '30m ago', parentId: null },
            { id: 'c1-3', author: 'rahmaniac_boy', content: ' Tere Bina is also great but Rockstar as a whole album is a journey.', timeAgo: '15m ago', parentId: 'c1-1' } // Nested
        ]
    },
    {
        id: 'disc-2',
        title: 'Most overrated album of the decade?',
        repliesCount: 2,
        likesCount: 56,
        liked: false,
        categoryTag: 'Hot Take',
        author: 'fantano_clone',
        timeAgo: '4h ago',
        commentsList: [
            { id: 'c2-1', author: 'indie_music_critic', content: 'Honestly, I think midnights by Taylor Swift was way over-awarded.', timeAgo: '3h ago', parentId: null },
            { id: 'c2-2', author: 'vinyl_lover', content: 'Hard agree. The production felt very generic compared to folklore.', timeAgo: '2h ago', parentId: 'c2-1' } // Nested
        ]
    },
    {
        id: 'disc-3',
        title: 'Which album has zero skips?',
        repliesCount: 2,
        likesCount: 312,
        liked: true,
        categoryTag: 'Discussion',
        author: 'vinyl_junkie',
        timeAgo: '6h ago',
        commentsList: [
            { id: 'c3-1', author: 'pink_floyd_god', content: 'Dark Side of the Moon is the definition of a zero skip album.', timeAgo: '5h ago', parentId: null },
            { id: 'c3-2', author: 'rap_scholar', content: 'Good Kid, M.A.A.D City by Kendrick Lamar. A perfect cinematic experience.', timeAgo: '4h ago', parentId: null }
        ]
    }
];

export default function ListeningRoomView() {
    const [discussions, setDiscussions] = useState<Discussion[]>(INITIAL_DISCUSSIONS);

    const handlePost = (title: string, categoryTag: string) => {
        const newDisc: Discussion = {
            id: `disc-${Date.now()}`,
            title,
            repliesCount: 0,
            likesCount: 0,
            liked: false,
            categoryTag,
            author: 'You',
            timeAgo: 'Just now',
            commentsList: []
        };
        setDiscussions((prev) => [newDisc, ...prev]);
    };

    const handleLike = (id: string) => {
        setDiscussions((prev) =>
            prev.map((disc) => {
                if (disc.id === id) {
                    const liked = !disc.liked;
                    return {
                        ...disc,
                        liked,
                        likesCount: liked ? disc.likesCount + 1 : disc.likesCount - 1
                    };
                }
                return disc;
            })
        );
    };

    const handleAddComment = (discId: string, content: string, parentId: string | null) => {
        setDiscussions((prev) =>
            prev.map((disc) => {
                if (disc.id === discId) {
                    const newComment = {
                        id: `comm-${Date.now()}`,
                        author: 'You',
                        content,
                        timeAgo: 'Just now',
                        parentId
                    };
                    return {
                        ...disc,
                        repliesCount: disc.repliesCount + 1,
                        commentsList: [...disc.commentsList, newComment]
                    };
                }
                return disc;
            })
        );
    };

    const handleEditComment = (discId: string, commentId: string, content: string) => {
        setDiscussions((prev) =>
            prev.map((disc) => {
                if (disc.id === discId) {
                    return {
                        ...disc,
                        commentsList: disc.commentsList.map((c) =>
                            c.id === commentId ? { ...c, content } : c
                        )
                    };
                }
                return disc;
            })
        );
    };

    const handleDeleteComment = (discId: string, commentId: string) => {
        setDiscussions((prev) =>
            prev.map((disc) => {
                if (disc.id === discId) {
                    // Recursive helper to find all child/grandchild comment IDs to delete
                    const getDescendantIds = (list: any[], targetId: string): string[] => {
                        const children = list.filter((c) => c.parentId === targetId);
                        return [targetId, ...children.flatMap((c) => getDescendantIds(list, c.id))];
                    };

                    const deleteIds = getDescendantIds(disc.commentsList, commentId);
                    const newCommentsList = disc.commentsList.filter((c) => !deleteIds.includes(c.id));
                    
                    return {
                        ...disc,
                        repliesCount: Math.max(0, disc.repliesCount - deleteIds.length),
                        commentsList: newCommentsList
                    };
                }
                return disc;
            })
        );
    };

    return (
        <div className="listening-room-grid">
            {/* Main Content Column (Wider for threads readability) */}
            <div className="main-column">
                <Composer onPost={handlePost} />
                <TrendingDiscussions
                    discussions={discussions}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                />
            </div>

            {/* Right Widget Sidebar Column */}
            <div className="widgets-column">
                <DailyPrompt />
                <CommunityPoll />
            </div>

            <style jsx>{`
                .listening-room-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 40px;
                    align-items: start;
                }

                .main-column {
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                    min-width: 0;
                }

                .widgets-column {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    position: sticky;
                    top: 100px;
                }

                @media (max-width: 1024px) {
                    .listening-room-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                    
                    .widgets-column {
                        position: relative;
                        top: 0;
                    }
                }
            `}</style>
        </div>
    );
}
