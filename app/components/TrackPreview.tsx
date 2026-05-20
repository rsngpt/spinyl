'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music, Volume2 } from 'lucide-react';

type TrackPreviewProps = {
    previewUrl: string | null;
    spotifyUrl: string;
    onPlayEmbed?: () => void;
    isActive?: boolean;
};

// Global state to ensure only one track plays at a time
// This is a simple event bus implementation
const previewEvents = new EventTarget();

export default function TrackPreview({ previewUrl, spotifyUrl, onPlayEmbed, isActive }: TrackPreviewProps) {
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

    // If an embedded play action is registered, bypass the HTML5 audio preview logic
    if (onPlayEmbed) {
        return (
            <button
                onClick={onPlayEmbed}
                title={isActive ? "Playing in Spotify Player" : "Play in Spotify Player"}
                style={{
                    marginRight: '12px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isActive ? 'var(--md-sys-color-primary-container)' : 'rgba(255, 255, 255, 0.04)',
                    border: isActive ? '1px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: 'var(--md-shape-corner-full)',
                    color: isActive ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                }}
                onMouseOver={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
                        e.currentTarget.style.borderColor = 'var(--md-sys-color-outline)';
                    }
                    e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseOut={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
                    }
                    e.currentTarget.style.transform = 'none';
                }}
            >
                {isActive ? <Volume2 size={16} className="animate-pulse" /> : <Play size={14} />}
            </button>
        );
    }

    if (!previewUrl) {
        return (
            <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Spotify"
                style={{
                    marginRight: '12px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: 'var(--md-shape-corner-full)',
                    color: 'var(--md-sys-color-secondary)',
                    transition: 'var(--transition)',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--md-sys-color-secondary-container)';
                    e.currentTarget.style.borderColor = 'var(--md-sys-color-secondary)';
                    e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
                    e.currentTarget.style.transform = 'none';
                }}
            >
                <Music size={14} />
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
                    background: isPlaying ? 'var(--md-sys-color-primary-container)' : 'rgba(255, 255, 255, 0.04)',
                    border: isPlaying ? '1px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: 'var(--md-shape-corner-full)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isPlaying ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
                    transition: 'var(--transition)',
                }}
                onMouseOver={(e) => {
                    if (!isPlaying) {
                        e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
                        e.currentTarget.style.borderColor = 'var(--md-sys-color-outline)';
                    }
                    e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseOut={(e) => {
                    if (!isPlaying) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
                    }
                    e.currentTarget.style.transform = 'none';
                }}
            >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
        </div>
    );
}
