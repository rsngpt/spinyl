'use client';

import React, { useState, useEffect } from 'react';

type Artist = {
    id: string;
    name: string;
    image?: string;
};

type ArtistSelectorProps = {
    selectedArtists: Artist[];
    onToggleArtist: (artist: Artist) => void;
    onNext: () => void;
    onBack: () => void;
};

export default function ArtistSelector({ selectedArtists, onToggleArtist, onNext, onBack }: ArtistSelectorProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 500);
        return () => clearTimeout(timer);
    }, [query]);

    // Fetch artists when debounced query changes
    useEffect(() => {
        async function searchArtists() {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                const data = await res.json();
                // API returns { artists: [...] } but structure might be slightly different in our API
                // Let's check api/search structure. It returns { artists: [ {id, name, image, type...} ] }
                setResults(data.artists || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        searchArtists();
    }, [debouncedQuery]);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-header">
                <h2 className="section-title">Pick Your Favorites</h2>
                <p className="section-desc">Add some artists to fine-tune your recommendations.</p>
            </div>

            {/* Search Input */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search for an artist..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
                {loading && (
                    <div className="loading-indicator">Searching...</div>
                )}
            </div>

            {/* Selected Artists (Chips) */}
            {selectedArtists.length > 0 && (
                <div className="selected-artists">
                    {selectedArtists.map(artist => (
                        <div key={artist.id} className="artist-chip">
                            <span>{artist.name}</span>
                            <button onClick={() => onToggleArtist(artist)}>&times;</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Results */}
            <div className="artist-results">
                {results.slice(0, 9).map((artist) => {
                    const isSelected = selectedArtists.some(a => a.id === artist.id);
                    return (
                        <button
                            key={artist.id}
                            onClick={() => onToggleArtist(artist)}
                            className={`artist-result-item ${isSelected ? 'selected' : ''}`}
                        >
                            {artist.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={artist.image} alt={artist.name} className="artist-avatar" />
                            ) : (
                                <div className="artist-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
                            )}
                            <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artist.name}</span>
                        </button>
                    );
                })}
            </div>

            <div className="wizard-actions">
                <button
                    onClick={onBack}
                    className="btn-secondary"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="btn-primary"
                >
                    See Recommendations
                </button>
            </div>
        </div>
    );
}
