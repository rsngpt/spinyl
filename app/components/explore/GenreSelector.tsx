import React, { useEffect, useState } from 'react';

const GENRE_SEEDS = [
    "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime",
    "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat",
    "british", "cantopop", "chicago-house", "children", "chill", "classical",
    "club", "comedy", "country", "dance", "dancehall", "death-metal",
    "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub",
    "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", "french",
    "funk", "garage", "german", "gospel", "goth", "grindcore", "groove",
    "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle",
    "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm",
    "indian", "indie", "indie-pop", "industrial", "iranian", "j-dance",
    "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin", "latino",
    "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno",
    "movies", "mpb", "new-age", "new-release", "opera", "pagode", "party",
    "piano", "pop", "pop-film", "post-dubstep", "power-pop", "progressive-house",
    "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae",
    "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance",
    "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter",
    "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study",
    "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop",
    "turkish", "work-out", "world-music"
];

type GenreSelectorProps = {
    selectedGenres: string[];
    onToggleGenre: (genre: string) => void;
    onNext: () => void;
};

export default function GenreSelector({ selectedGenres, onToggleGenre, onNext }: GenreSelectorProps) {
    const [genres] = useState<string[]>(GENRE_SEEDS);

    // No loading state needed for static data
    // if (loading) ...

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">Pick Your Vibe</h2>
                <p className="section-desc">Select up to 5 genres to get started.</p>
            </div>

            <div className="genre-grid">
                {genres.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                        <button
                            key={genre}
                            onClick={() => onToggleGenre(genre)}
                            className={`genre-pill ${isSelected ? 'selected' : ''}`}
                        >
                            {genre}
                        </button>
                    );
                })}
            </div>

            <div className="wizard-actions">
                <button
                    onClick={onNext}
                    disabled={selectedGenres.length === 0}
                    className="btn-primary"
                >
                    Next: Choose Artists
                </button>
            </div>
        </div>
    );
}
