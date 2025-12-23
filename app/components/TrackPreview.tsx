'use client';

import React, { useState, useRef, useEffect } from 'react';

type TrackPreviewProps = {
    previewUrl: string | null;
    spotifyUrl: string;
};

// Global state to ensure only one track plays at a time
// This is a simple event bus implementation
const previewEvents = new EventTarget();

export default function TrackPreview({ previewUrl, spotifyUrl }: TrackPreviewProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Listen for other tracks starting
        const handleOtherPlay = (e: Event) => {
            if ((e as CustomEvent).detail !== audioRef.current) {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                    setIsPlaying(false);
                }
            }
        };

        previewEvents.addEventListener('play_preview', handleOtherPlay);
        return () => {
            previewEvents.removeEventListener('play_preview', handleOtherPlay);
        };
    }, []);

    if (!previewUrl) {
        return (
            <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Spotify"
                style={{
                    marginRight: '12px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    textDecoration: 'none',
                    color: '#1DB954', // Spotify Green
                    fontSize: '1.2rem',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
                <span>🎧</span>
            </a>
        );
    }

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Notify others to stop
            previewEvents.dispatchEvent(new CustomEvent('play_preview', { detail: audioRef.current }));

            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <div style={{ marginRight: '12px' }}>
            <audio
                ref={audioRef}
                src={previewUrl}
                onEnded={() => setIsPlaying(false)}
            />
            <button
                onClick={togglePlay}
                style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isPlaying ? 'var(--primary)' : '#fff',
                    transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            >
                {isPlaying ? '⏸' : '▶'}
            </button>
        </div>
    );
}
