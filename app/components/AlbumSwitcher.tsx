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

    let activeAlbums = globalAlbums;
    if (activeTab === 'india') activeAlbums = indianAlbums;

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
                    {/* Sliding Background */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            height: 'calc(100% - 8px)',
                            width: 'calc(50% - 4px)',
                            background: 'var(--primary)',
                            borderRadius: '50px',
                            transform: activeTab === 'global' ? 'translateX(0)' : 'translateX(100%)',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            zIndex: 0,
                        }}
                    />

                    <button
                        onClick={() => setActiveTab('global')}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '50px',
                            border: 'none',
                            background: 'transparent',
                            color: activeTab === 'global' ? '#000' : 'var(--text-secondary)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'color 0.3s',
                            zIndex: 1,
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
                            background: 'transparent',
                            color: activeTab === 'india' ? '#000' : 'var(--text-secondary)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'color 0.3s',
                            zIndex: 1,
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
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '24px',
                }}
                key={activeTab} // Forces re-render animation when tab changes
            >
                <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
                {activeAlbums.map((album) => (
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
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <a
                    href={activeTab === 'global' ? '/shelf' : '/shelf?region=IN'}
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
