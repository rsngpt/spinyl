'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AlbumCard from './AlbumCard';
import { Music, Disc, Globe, Languages, Tag, Star, Activity, Sparkles, Megaphone } from 'lucide-react';

interface Album {
    id: string;
    name: string;
    cover_image: string | null;
    artist: string;
    avg_rating: number | null;
}

interface DashboardHomeProps {
    userProfile: {
        username: string | null;
        avatar_url: string | null;
    } | null;
    initialTrending: Album[];
    initialNewReleases: Album[];
}

export default function DashboardHome({
    userProfile,
    initialTrending,
    initialNewReleases,
}: DashboardHomeProps) {
    const [chartType, setChartType] = useState<'country' | 'language' | 'genre'>('country');
    const [chartValue, setChartValue] = useState('US');
    const [chartAlbums, setChartAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(false);

    const handleTypeChange = (type: 'country' | 'language' | 'genre') => {
        setChartType(type);
        if (type === 'country') setChartValue('US');
        else if (type === 'language') setChartValue('english');
        else if (type === 'genre') setChartValue('pop');
    };

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/discover/charts?type=${chartType}&value=${chartValue}`);
                if (res.ok) {
                    const data = await res.json();
                    setChartAlbums(data);
                }
            } catch (err) {
                console.error('Error fetching charts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [chartType, chartValue]);

    const countries = [
        { name: 'United States', code: 'US', flag: '🇺🇸' },
        { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
        { name: 'Japan', code: 'JP', flag: '🇯🇵' },
        { name: 'India', code: 'IN', flag: '🇮🇳' },
        { name: 'Germany', code: 'DE', flag: '🇩🇪' },
    ];

    const languages = [
        { name: 'English', code: 'english', flag: '🇺🇸' },
        { name: 'Spanish', code: 'spanish', flag: '🇪🇸' },
        { name: 'Japanese', code: 'japanese', flag: '🇯🇵' },
        { name: 'Korean', code: 'korean', flag: '🇰🇷' },
        { name: 'Hindi', code: 'hindi', flag: '🇮🇳' },
    ];

    const genres = [
        { name: 'Pop', code: 'pop', icon: '🎤' },
        { name: 'Rock', code: 'rock', icon: '🎸' },
        { name: 'Hip-Hop', code: 'hip-hop', icon: '🎧' },
        { name: 'Electronic', code: 'electronic', icon: '⚡' },
        { name: 'Jazz', code: 'jazz', icon: '🎷' },
    ];

    // Sidebar: Ranked list showing top-rated trending items
    const topInterested = initialTrending.length > 0 ? initialTrending.slice(0, 5) : initialNewReleases.slice(0, 5);

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
            {/* Dashboard Header Banner */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    background: 'linear-gradient(135deg, rgba(255, 159, 104, 0.12) 0%, rgba(229, 9, 20, 0.04) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    padding: '24px 32px',
                    marginBottom: '32px',
                    marginTop: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--md-sys-color-primary)', filter: 'blur(80px)', opacity: 0.12, pointerEvents: 'none' }} />
                
                {userProfile?.avatar_url ? (
                    <img
                        src={userProfile.avatar_url}
                        alt="Profile"
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px dashed rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <Disc size={28} className="animate-spin-slow" style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                )}

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Sparkles size={14} color="var(--md-sys-color-primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--md-sys-color-primary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Discover</span>
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>
                        Welcome back, {userProfile?.username || 'music fan'}!
                    </h1>
                </div>
            </div>

            {/* TWO-COLUMN GRID */}
            <div className="dashboard-grid">
                {/* LEFT MAIN COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', minWidth: 0 }}>
                    {/* Talk Of The Town */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <Megaphone size={20} color="var(--md-sys-color-primary)" />
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.2px' }}>
                                Talk Of The Town
                            </h2>
                        </div>

                        {initialTrending.length > 0 ? (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                    gap: '20px'
                                }}
                            >
                                {initialTrending.map((album) => (
                                    <Link key={album.id} href={`/album/${album.id}`} style={{ textDecoration: 'none' }}>
                                        <AlbumCard album={album} />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    padding: '32px',
                                    textAlign: 'center',
                                    color: 'rgba(255,255,255,0.4)',
                                    border: '1px dashed rgba(255,255,255,0.08)'
                                }}
                            >
                                <Music size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>No reviews posted yet. Go compose your first check!</p>
                            </div>
                        )}
                    </section>

                    {/* Explore Charts */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <Globe size={20} color="var(--md-sys-color-primary)" />
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.2px' }}>
                                Explore Charts
                            </h2>
                        </div>

                        {/* Metric Selectors */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => handleTypeChange('country')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 650,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        background: chartType === 'country' ? 'var(--md-sys-color-primary)' : 'rgba(255,255,255,0.04)',
                                        color: chartType === 'country' ? '#000' : 'rgba(255,255,255,0.8)',
                                        border: 'none'
                                    }}
                                >
                                    <Globe size={13} />
                                    Country
                                </button>
                                <button
                                    onClick={() => handleTypeChange('language')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 650,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        background: chartType === 'language' ? 'var(--md-sys-color-primary)' : 'rgba(255,255,255,0.04)',
                                        color: chartType === 'language' ? '#000' : 'rgba(255,255,255,0.8)',
                                        border: 'none'
                                    }}
                                >
                                    <Languages size={13} />
                                    Language
                                </button>
                                <button
                                    onClick={() => handleTypeChange('genre')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 650,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        background: chartType === 'genre' ? 'var(--md-sys-color-primary)' : 'rgba(255,255,255,0.04)',
                                        color: chartType === 'genre' ? '#000' : 'rgba(255,255,255,0.8)',
                                        border: 'none'
                                    }}
                                >
                                    <Tag size={13} />
                                    Genre
                                </button>
                            </div>

                            {/* Sub values selection list */}
                            <div
                                style={{
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.04)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    gap: '8px',
                                    flexWrap: 'wrap',
                                    alignItems: 'center'
                                }}
                            >
                                {chartType === 'country' &&
                                    countries.map((c) => (
                                        <button
                                            key={c.code}
                                            onClick={() => setChartValue(c.code)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                background: chartValue === c.code ? 'rgba(255,255,255,0.08)' : 'transparent',
                                                color: chartValue === c.code ? '#fff' : 'rgba(255,255,255,0.5)',
                                                border: chartValue === c.code ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{ marginRight: '4px' }}>{c.flag}</span>
                                            {c.name}
                                        </button>
                                    ))}

                                {chartType === 'language' &&
                                    languages.map((l) => (
                                        <button
                                            key={l.code}
                                            onClick={() => setChartValue(l.code)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                background: chartValue === l.code ? 'rgba(255,255,255,0.08)' : 'transparent',
                                                color: chartValue === l.code ? '#fff' : 'rgba(255,255,255,0.5)',
                                                border: chartValue === l.code ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{ marginRight: '4px' }}>{l.flag}</span>
                                            {l.name}
                                        </button>
                                    ))}

                                {chartType === 'genre' &&
                                    genres.map((g) => (
                                        <button
                                            key={g.code}
                                            onClick={() => setChartValue(g.code)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                background: chartValue === g.code ? 'rgba(255,255,255,0.08)' : 'transparent',
                                                color: chartValue === g.code ? '#fff' : 'rgba(255,255,255,0.5)',
                                                border: chartValue === g.code ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{ marginRight: '4px' }}>{g.icon}</span>
                                            {g.name}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Chart Grid */}
                        {loading ? (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                    gap: '20px'
                                }}
                            >
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div style={{ width: '100%', aspectRatio: '1/1', background: 'rgba(255,255,255,0.04)', marginBottom: '12px' }} />
                                        <div style={{ height: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', width: '80%', marginBottom: '6px' }} />
                                        <div style={{ height: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', width: '50%' }} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                    gap: '20px'
                                }}
                            >
                                {chartAlbums.map((album) => (
                                    <Link key={album.id} href={`/album/${album.id}`} style={{ textDecoration: 'none' }}>
                                        <AlbumCard album={album} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT SIDEBAR COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Most Interested ranked leader widget */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={18} color="var(--md-sys-color-primary)" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 750, margin: 0, color: '#fff' }}>Most Interested</h3>
                            </div>
                            <select
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: '0.75rem',
                                    padding: '4px 8px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option>This Week</option>
                                <option>This Month</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {topInterested.map((album, index) => (
                                <Link key={album.id} href={`/album/${album.id}`} style={{ textDecoration: 'none' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        className="ranking-item-hover"
                                    >
                                        {/* Large styled Rank Number */}
                                        <span
                                            style={{
                                                fontSize: '2.4rem',
                                                fontWeight: 900,
                                                color: 'rgba(255, 255, 255, 0.15)',
                                                lineHeight: 1,
                                                minWidth: '24px',
                                                textAlign: 'center',
                                                fontFamily: 'system-ui, sans-serif'
                                            }}
                                        >
                                            {index + 1}
                                        </span>

                                        {/* Album Thumbnail */}
                                        <img
                                            src={album.cover_image || '/placeholder.png'}
                                            alt={album.name}
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '8px',
                                                objectFit: 'cover',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                            }}
                                        />

                                        {/* Album Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {album.name}
                                            </h4>
                                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {album.artist}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--md-sys-color-primary)' }}>
                                                <span>🔥</span>
                                                <span>{album.avg_rating ? `${Math.round(album.avg_rating * 780)} Interested` : 'New Release'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 40px;
                }

                @media (max-width: 960px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                }

                :global(.ranking-item-hover):hover {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                    transform: translateX(4px);
                }
            `}</style>
        </div>
    );
}
