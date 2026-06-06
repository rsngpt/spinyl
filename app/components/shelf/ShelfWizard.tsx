'use client';

import React, { useState, useEffect } from 'react';
import GenreSelector from './GenreSelector';
import ArtistSelector from './ArtistSelector';
import RecommendationsGrid from './RecommendationsGrid';
import { createBrowserClient } from '@supabase/ssr';
import './shelf.css';

type Step = 'GENRE' | 'ARTIST' | 'RESULTS';

type ShelfWizardProps = {
    initialVibe?: {
        genres: string[];
        artists: any[];
    } | null;
};

export default function ShelfWizard({ initialVibe }: ShelfWizardProps) {
    const [step, setStep] = useState<Step>(
        (initialVibe?.genres?.length && initialVibe?.artists?.length) ? 'RESULTS' : 'GENRE'
    );
    const [selectedGenres, setSelectedGenres] = useState<string[]>(initialVibe?.genres || []);
    const [selectedArtists, setSelectedArtists] = useState<any[]>(initialVibe?.artists || []);

    // No longer need loading state since data comes from server
    // const [loadingVibe, setLoadingVibe] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Client-side fetch removed in favor of Server-Side Prop


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



    return (
        <div className="shelf-container">
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
