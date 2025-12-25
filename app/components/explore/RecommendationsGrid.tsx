'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// Assuming we can reuse AlbumCard or create a simple TrackCard. 
// Since we mapped recommendations to look like tracks with album info, let's create a simple card inline or reuse if possible.
// Wait, Explore page previously used `AlbumCard`. 
// Let's import AlbumCard and see if it fits, or just make a simple grid.
import AlbumCard from '../AlbumCard';

// We fetched tracks, but AlbumCard expects an album.
// Our API returns: { id, name, artists, album: { id, name, image }, preview_url }
// AlbumCard props: `album`.
// Let's peek at AlbumCard definition if needed, but for now I'll assume we can pass a compatible object or just render our own grid.
// Given the premium design request, let's build a nice grid here.

type Recommendation = {
    id: string;
    name: string;
    artists: { name: string, id: string }[];
    album: {
        id: string;
        name: string;
        image: string;
    };
    preview_url: string;
};

type RecommendationsGridProps = {
    seedGenres: string[];
    seedArtists: { id: string }[];
    onReset: () => void;
};

export default function RecommendationsGrid({ seedGenres, seedArtists, onReset }: RecommendationsGridProps) {
    const [tracks, setTracks] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRecommendations() {
            try {
                setLoading(true);
                const genreParams = seedGenres.join(',');
                const artistParams = seedArtists.map(a => a.id).join(',');

                const res = await fetch(`/api/discover/recommendations?seed_genres=${genreParams}&seed_artists=${artistParams}`);

                const data = await res.json();
                setTracks(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setTracks([]);
            } finally {
                setLoading(false);
            }
        }
        fetchRecommendations();
    }, [seedGenres, seedArtists]);

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p className="section-desc">Curating your mix...</p>
        </div>
    );

    return (
        <div>
            <div className="recommendations-header">
                <h2 className="section-title">Made For You</h2>
                <button onClick={onReset} className="reset-link">
                    Edit Vibe
                </button>
            </div>

            {tracks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No matches found</h3>
                    <p className="section-desc">Try selecting different genres or artists.</p>
                </div>
            ) : (
                <div className="rec-grid">
                    {tracks.map(track => (
                        <Link href={`/album/${track.album.id}`} key={track.id} className="rec-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <div className="rec-image-wrapper">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={track.album.image}
                                    alt={track.name}
                                    className="rec-image"
                                />
                            </div>

                            <h3 className="rec-title">{track.name}</h3>
                            <p className="rec-artist">{track.artists.map(a => a.name).join(', ')}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
