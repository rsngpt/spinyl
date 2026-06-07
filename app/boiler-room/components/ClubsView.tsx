'use client';

import React, { useState } from 'react';
import ClubSearch from './ClubSearch';
import FeaturedClubs, { Club } from './FeaturedClubs';
import TrendingClubs from './TrendingClubs';
import AlbumClubCard, { AlbumClubData } from './AlbumClubCard';
import ClubDiscussionThread, { ClubThread } from './ClubDiscussionThread';

const INITIAL_CLUBS: Club[] = [
    // Featured Clubs
    {
        id: 'club-1',
        icon: 'Mic',
        name: 'Hip-Hop Club',
        description: 'For the headspaces of boom-bap, trap, drill, and lyricism.',
        memberCount: 12430,
        activeDiscussionsCount: 142,
        joined: false
    },
    {
        id: 'club-2',
        icon: 'Guitar',
        name: 'Indie Club',
        description: 'Underground rock, dream pop, bedroom indie, and shoegaze vibes.',
        memberCount: 8204,
        activeDiscussionsCount: 95,
        joined: false
    },
    {
        id: 'club-3',
        icon: 'Music',
        name: 'Bollywood Soundtracks',
        description: 'Discuss classic A.R. Rahman, Pritam, and contemporary film music.',
        memberCount: 15122,
        activeDiscussionsCount: 210,
        joined: true
    },
    // Trending Clubs
    {
        id: 'club-4',
        icon: 'Radio',
        name: 'Electronic Music',
        description: 'Synthesizers, techno, house, ambient, and EDM culture.',
        memberCount: 5644,
        activeDiscussionsCount: 48,
        joined: false
    },
    {
        id: 'club-5',
        icon: 'Sliders',
        name: 'Producers Club',
        description: 'Beats, DAWs, production tips, mixing, and sample exchange.',
        memberCount: 4210,
        activeDiscussionsCount: 64,
        joined: false
    },
    {
        id: 'club-6',
        icon: 'Disc',
        name: 'Vinyl Collectors',
        description: 'Showcase your physical setup, vinyl hauls, and collection tips.',
        memberCount: 6819,
        activeDiscussionsCount: 78,
        joined: false
    }
];

const MOCK_ALBUM_CLUB_DATA: AlbumClubData = {
    album: "Melodrama",
    artist: "Lorde",
    year: 2017,
    genres: ["Pop", "Art Pop", "Alternative"],
    listeners: 472,
    reviews: 189,
    discussions: 76,
    daysRemaining: 4,
    completionRate: 82,
    featuredTopic: "Is Melodrama the defining pop album of the 2010s?"
};

// Mock threads data mapping clubId to ClubThread[]
const INITIAL_THREADS: Record<string, ClubThread[]> = {
    'club-1': [
        {
            id: 't1-1',
            title: 'Who has the best verse on the new Kendrick Lamar album?',
            author: 'cole_world',
            likesCount: 52,
            repliesCount: 3,
            liked: false,
            timeAgo: '2h ago',
            commentsList: [
                { id: 'c1-1-1', author: 'rap_enthusiast', content: 'Kendrick himself on the title track. Insane flow.', timeAgo: '1h ago', parentId: null },
                { id: 'c1-1-2', author: 'k-dot-stan', content: 'Baby Keems feature was surprisingly deep too.', timeAgo: '45m ago', parentId: null },
                { id: 'c1-1-3', author: 'hiphop_head', content: 'The production on track 4 is what really stands out.', timeAgo: '10m ago', parentId: 'c1-1-1' } // Nested
            ]
        },
        {
            id: 't1-2',
            title: 'Boom Bap vs Trap: which era had better storytelling in lyrics?',
            author: 'nas_disciple',
            likesCount: 89,
            repliesCount: 2,
            liked: true,
            timeAgo: '5h ago',
            commentsList: [
                { id: 'c1-2-1', author: 'old_school_cool', content: 'Boom Bap without a doubt. Pac, Nas, Biggie... they were poets.', timeAgo: '4h ago', parentId: null },
                { id: 'c1-2-2', author: 'metro_boomin_fan', content: 'Trap tells stories too, just different realities. Modern struggles.', timeAgo: '2h ago', parentId: 'c1-2-1' } // Nested
            ]
        }
    ],
    'club-2': [
        {
            id: 't2-1',
            title: 'Phoebe Bridgers songwriting on Punisher is emotionally devastating.',
            author: 'savior_complex',
            likesCount: 65,
            repliesCount: 2,
            liked: false,
            timeAgo: '3h ago',
            commentsList: [
                { id: 'c2-1-1', author: 'boygenius_fan', content: 'IKnowTheEnd is one of the greatest album closers ever written.', timeAgo: '2h ago', parentId: null },
                { id: 'c2-1-2', author: 'lucy_dacus_stan', content: 'The build up in the final two minutes is pure art.', timeAgo: '1h ago', parentId: 'c2-1-1' } // Nested
            ]
        },
        {
            id: 't2-2',
            title: 'Dream pop recommendations needed for a rainy Sunday afternoon',
            author: 'beach_house_dreamer',
            likesCount: 22,
            repliesCount: 1,
            liked: false,
            timeAgo: '8h ago',
            commentsList: [
                { id: 'c2-2-1', author: 'shoegazer', content: 'Check out Cocteau Twins - Heaven or Las Vegas. Pure bliss.', timeAgo: '6h ago', parentId: null }
            ]
        }
    ],
    'club-3': [
        {
            id: 't3-1',
            title: 'A.R. Rahman\'s Guru vs Rockstar: which is the superior soundtrack?',
            author: 'rahmaniac',
            likesCount: 120,
            repliesCount: 3,
            liked: false,
            timeAgo: '4h ago',
            commentsList: [
                { id: 'c3-1-1', author: 'kun_faya_kun_lover', content: 'Rockstar has Kun Faya Kun and Nadaan Parindey. It is a masterpiece.', timeAgo: '3h ago', parentId: null },
                { id: 'c3-1-2', author: 'guru_fan', content: 'Guru has Tere Bina and Barso Re. Better variety of acoustic melodies.', timeAgo: '2h ago', parentId: null },
                { id: 'c3-1-3', author: 'rahman_forever', content: 'Both represent the absolute peak of Bollywood music production.', timeAgo: '1h ago', parentId: 'c3-1-1' } // Nested
            ]
        },
        {
            id: 't3-2',
            title: 'Amit Trivedi does not get enough credit for Dev.D - it completely changed modern Bollywood rock.',
            author: 'trivedi_faner',
            likesCount: 43,
            repliesCount: 2,
            liked: false,
            timeAgo: '12h ago',
            commentsList: [
                { id: 'c3-2-1', author: 'indie_bolly', content: 'Emosional Atyachar was a cultural reset back in the day.', timeAgo: '10h ago', parentId: null },
                { id: 'c3-2-2', author: 'guitarist_boy', content: 'Nayan Tarse has some of the coolest guitar riffs in Hindi cinema.', timeAgo: '8h ago', parentId: 'c3-2-1' } // Nested
            ]
        }
    ],
    'club-4': [
        {
            id: 't4-1',
            title: 'Daft Punk\'s legacy: Discovery is a flawless electronic album.',
            author: 'harder_better',
            likesCount: 98,
            repliesCount: 1,
            liked: true,
            timeAgo: '6h ago',
            commentsList: [
                { id: 'c4-1-1', author: 'alive_2007', content: 'Digital Love has the greatest synth solo in history.', timeAgo: '4h ago', parentId: null }
            ]
        }
    ],
    'club-5': [
        {
            id: 't5-1',
            title: 'What DAW are you using in 2026? Logic Pro or Ableton Live?',
            author: 'producer_dan',
            likesCount: 50,
            repliesCount: 2,
            liked: false,
            timeAgo: '1d ago',
            commentsList: [
                { id: 'c5-1-1', author: 'beatmaker_99', content: 'Ableton for workflow and live performing. Nothing else compares.', timeAgo: '18h ago', parentId: null },
                { id: 'c5-1-2', author: 'logic_guru', content: 'Logic Pro has the best stock plugins and virtual instruments for the price.', timeAgo: '12h ago', parentId: 'c5-1-1' } // Nested
            ]
        }
    ],
    'club-6': [
        {
            id: 't6-1',
            title: 'How do you clean your records? Wet vacuum or microfibre brush?',
            author: 'dust_remover',
            likesCount: 29,
            repliesCount: 1,
            liked: false,
            timeAgo: '1d ago',
            commentsList: [
                { id: 'c6-1-1', author: 'analog_purity', content: 'Spin-Clean washer works wonders for budget setups. Highly recommend.', timeAgo: '15h ago', parentId: null }
            ]
        }
    ]
};

export default function ClubsView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
    
    // Club Forum state
    const [activeClubId, setActiveClubId] = useState<string | null>(null);
    const [threads, setThreads] = useState<Record<string, ClubThread[]>>(INITIAL_THREADS);

    const handleToggleJoin = (id: string) => {
        setClubs((prevClubs) =>
            prevClubs.map((club) => {
                if (club.id === id) {
                    const joined = !club.joined;
                    const memberCount = joined ? club.memberCount + 1 : club.memberCount - 1;
                    return { ...club, joined, memberCount };
                }
                return club;
            })
        );
    };

    // Thread Actions
    const handlePostThread = (clubId: string, title: string) => {
        const newThread: ClubThread = {
            id: `thread-${Date.now()}`,
            title,
            author: 'You',
            likesCount: 0,
            repliesCount: 0,
            liked: false,
            timeAgo: 'Just now',
            commentsList: []
        };

        setThreads(prev => ({
            ...prev,
            [clubId]: [newThread, ...(prev[clubId] || [])]
        }));

        // Thread creation complete
    };

    const handleLikeThread = (clubId: string, threadId: string) => {
        setThreads(prev => ({
            ...prev,
            [clubId]: (prev[clubId] || []).map(thread => {
                if (thread.id === threadId) {
                    const liked = !thread.liked;
                    const likesCount = liked ? thread.likesCount + 1 : thread.likesCount - 1;
                    return { ...thread, liked, likesCount };
                }
                return thread;
            })
        }));
    };

    const handleAddComment = (clubId: string, threadId: string, content: string, parentId: string | null) => {
        const newComment = {
            id: `comm-${Date.now()}`,
            author: 'You',
            content,
            timeAgo: 'Just now',
            parentId
        };

        setThreads(prev => ({
            ...prev,
            [clubId]: (prev[clubId] || []).map(thread => {
                if (thread.id === threadId) {
                    return {
                        ...thread,
                        repliesCount: thread.repliesCount + 1,
                        commentsList: [...thread.commentsList, newComment]
                    };
                }
                return thread;
            })
        }));

        // Comment creation complete
    };

    const handleEditComment = (clubId: string, threadId: string, commentId: string, content: string) => {
        setThreads(prev => ({
            ...prev,
            [clubId]: (prev[clubId] || []).map(thread => {
                if (thread.id === threadId) {
                    return {
                        ...thread,
                        commentsList: thread.commentsList.map(c =>
                            c.id === commentId ? { ...c, content } : c
                        )
                    };
                }
                return thread;
            })
        }));
    };

    const handleDeleteComment = (clubId: string, threadId: string, commentId: string) => {
        setThreads(prev => ({
            ...prev,
            [clubId]: (prev[clubId] || []).map(thread => {
                if (thread.id === threadId) {
                    // Recursive helper to get all deleted IDs
                    const getDescendantIds = (list: any[], targetId: string): string[] => {
                        const children = list.filter(c => c.parentId === targetId);
                        return [targetId, ...children.flatMap(c => getDescendantIds(list, c.id))];
                    };

                    const deleteIds = getDescendantIds(thread.commentsList, commentId);
                    const newCommentsList = thread.commentsList.filter(c => !deleteIds.includes(c.id));

                    return {
                        ...thread,
                        repliesCount: Math.max(0, thread.repliesCount - deleteIds.length),
                        commentsList: newCommentsList
                    };
                }
                return thread;
            })
        }));
    };

    // Filter clubs client-side
    const filteredClubs = clubs.filter(
        (club) =>
            club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            club.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Split clubs into Featured and Trending
    const featuredClubs = filteredClubs.filter((club) => ['club-1', 'club-2', 'club-3'].includes(club.id));
    const trendingClubs = filteredClubs.filter((club) => ['club-4', 'club-5', 'club-6'].includes(club.id));

    const activeClub = clubs.find(c => c.id === activeClubId);
    const activeClubThreads = activeClubId ? (threads[activeClubId] || []) : [];

    return (
        <div className="clubs-view-container">
            {/* Show search only when browsing the lists of clubs */}
            {!activeClubId && (
                <ClubSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            )}

            <div className="clubs-layout-grid">
                {/* Main section */}
                <div className="main-column">
                    {activeClubId && activeClub ? (
                        <ClubDiscussionThread
                            club={activeClub}
                            threads={activeClubThreads}
                            onBack={() => setActiveClubId(null)}
                            onPostThread={(title) => handlePostThread(activeClubId, title)}
                            onLikeThread={(threadId) => handleLikeThread(activeClubId, threadId)}
                            onAddComment={(threadId, content, parentId) => handleAddComment(activeClubId, threadId, content, parentId)}
                            onEditComment={(threadId, commentId, content) => handleEditComment(activeClubId, threadId, commentId, content)}
                            onDeleteComment={(threadId, commentId) => handleDeleteComment(activeClubId, threadId, commentId)}
                        />
                    ) : (
                        <>
                            <FeaturedClubs
                                clubs={featuredClubs}
                                onToggleJoin={handleToggleJoin}
                                onClickClub={setActiveClubId}
                            />
                            <TrendingClubs
                                clubs={trendingClubs}
                                onToggleJoin={handleToggleJoin}
                                onClickClub={setActiveClubId}
                            />
                        </>
                    )}
                </div>

                {/* Sidebar widget */}
                <div className="widgets-column">
                    <AlbumClubCard 
                        data={MOCK_ALBUM_CLUB_DATA} 
                        onJoin={() => console.log('Joined Album Club!')}
                        onViewAlbum={() => {
                            // Focus on Bollywood Soundtracks Club for the demo thread discussions
                            setActiveClubId('club-3');
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
                .clubs-view-container {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .clubs-layout-grid {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    gap: 32px;
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
                }

                @media (max-width: 1024px) {
                    .clubs-layout-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                }
            `}</style>
        </div>
    );
}
