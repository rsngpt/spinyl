'use client';

import React, { useState, useEffect } from 'react';
import GenreSelector from './GenreSelector';
import ArtistSelector from './ArtistSelector';
import RecommendationsGrid from './RecommendationsGrid';
import { createBrowserClient } from '@supabase/ssr';
import './explore.css';

type Step = 'GENRE' | 'ARTIST' | 'RESULTS';

export default function ExploreWizard() {
    const [step, setStep] = useState<Step>('GENRE');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedArtists, setSelectedArtists] = useState<any[]>([]);
    const [loadingVibe, setLoadingVibe] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function loadVibe() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                console.log('[ExploreWizard] User:', user?.id);

                if (!user) {
                    setLoadingVibe(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('vibe')
                    .eq('id', user.id)
                    .single();

                console.log('[ExploreWizard] DB Vibe:', data?.vibe, 'Error:', error);

                if (data?.vibe && !error) {
                    const vibe = data.vibe as any;
                    if (vibe.genres && Array.isArray(vibe.genres) && vibe.artists && Array.isArray(vibe.artists)) {
                        console.log('[ExploreWizard] Vibe valid, switching to RESULTS');
                        setSelectedGenres(vibe.genres);
                        setSelectedArtists(vibe.artists);
                        setStep('RESULTS');
                    } else {
                        console.log('[ExploreWizard] Vibe invalid structure');
                    }
                }
            } catch (e) {
                console.error("Failed to load vibe", e);
            } finally {
                setLoadingVibe(false);
            }
        }
        loadVibe();
    }, []);

    const handleToggleGenre = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre].slice(0, 5)
        );
    };

    const handleToggleArtist = (artist: any) => {
        setSelectedArtists(prev => {
            const exists = prev.some(a => a.id === artist.id);
            if (exists) return prev.filter(a => a.id !== artist.id);
            return [...prev, artist].slice(0, 5);
        });
    };

    const finishWizard = async () => {
        setStep('RESULTS');

        // Save Local
        localStorage.setItem('spinyl_genres', JSON.stringify(selectedGenres));
        localStorage.setItem('spinyl_artists', JSON.stringify(selectedArtists));

        // Save DB
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('profiles')
                .update({
                    vibe: {
                        genres: selectedGenres,
                        artists: selectedArtists
                    }
                })
                .eq('id', user.id);
        }
    };

    const reset = async () => {
        setStep('GENRE');
        setSelectedGenres([]);
        setSelectedArtists([]);

        // Clear Local
        localStorage.removeItem('spinyl_genres');
        localStorage.removeItem('spinyl_artists');

        // Clear DB
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('profiles')
                .update({ vibe: null })
                .eq('id', user.id);
        }
    };

    // Prevent flash of wizard if vibe exists
    if (loadingVibe) return (
        <div className="explore-container">
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your vibe...</p>
            </div>
        </div>
    );

    return (
        <div className="explore-container">
            {/* Progress Indicator */}
            {step !== 'RESULTS' && (
                <div className="step-indicator">
                    <div className={`step-dot ${step === 'GENRE' || step === 'ARTIST' ? 'active' : ''}`}></div>
                    <div className="step-line">
                        <div className={`step-line-fill ${step === 'ARTIST' ? 'full' : ''}`}></div>
                    </div>
                    <div className={`step-dot ${step === 'ARTIST' ? 'active' : ''}`}></div>
                </div>
            )}

            {step === 'GENRE' && (
                <GenreSelector
                    selectedGenres={selectedGenres}
                    onToggleGenre={handleToggleGenre}
                    onNext={() => setStep('ARTIST')}
                />
            )}

            {step === 'ARTIST' && (
                <ArtistSelector
                    selectedArtists={selectedArtists}
                    onToggleArtist={handleToggleArtist}
                    onNext={finishWizard}
                    onBack={() => setStep('GENRE')}
                />
            )}

            {step === 'RESULTS' && (
                <RecommendationsGrid
                    seedGenres={selectedGenres}
                    seedArtists={selectedArtists}
                    onReset={reset}
                />
            )}
        </div>
    );
}
