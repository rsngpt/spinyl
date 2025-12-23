'use client';

import React, { useState } from 'react';
import AlbumCard from './AlbumCard';

type Album = {
    id: string;
    name: string;
    cover_image: string | null;
    avg_rating: number | null;
    artist: string;
};

type AlbumSwitcherProps = {
    globalAlbums: Album[];
    indianAlbums: Album[];
};

export default function AlbumSwitcher({ globalAlbums, indianAlbums }: AlbumSwitcherProps) {
    const [activeTab, setActiveTab] = useState<'global' | 'india'>('global');

    const activeAlbums = activeTab === 'global' ? globalAlbums : indianAlbums;

    return (
        <div className="switcher-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '40px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50px',
                        padding: '4px',
                        position: 'relative',
                    }}
                >
                    <button
                        onClick={() => setActiveTab('global')}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '50px',
                            border: 'none',
                            background: activeTab === 'global' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'global' ? '#000' : 'var(--text-secondary)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            outline: 'none',
                            fontSize: '0.95rem',
                        }}
                    >
                        New Releases Worldwide
                    </button>
                    <button
                        onClick={() => setActiveTab('india')}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '50px',
                            border: 'none',
                            background: activeTab === 'india' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'india' ? '#000' : 'var(--text-secondary)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            outline: 'none',
                            fontSize: '0.95rem',
                        }}
                    >
                        New Releases India 🇮🇳
                    </button>
                </div>
            </div>

            <div
                className="album-grid"
                style={{
                    animation: 'fadeIn 0.5s ease',
                }}
                key={activeTab} // Forces re-render animation when tab changes
            >
                <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

                {activeAlbums.length > 0 ? (
                    activeAlbums.map((album) => (
                        <a
                            key={album.id}
                            href={`/album/${album.id}`}
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                display: 'block',
                            }}
                        >
                            <AlbumCard album={album} />
                        </a>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                        <p>No albums found for this region.</p>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <a
                    href={activeTab === 'global' ? '/explore' : '/explore?region=IN'}
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        borderBottom: '1px solid transparent',
                        paddingBottom: '2px',
                        transition: 'border-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                    See All {activeTab === 'global' ? 'Global Releases' : 'Indian Releases'}
                </a>
            </div>
        </div>
    );
}
