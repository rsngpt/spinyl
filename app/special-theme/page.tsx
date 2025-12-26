'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ChristmasLights from '../components/special/ChristmasLights';


// Mock data for Stranger Things music with working Spotify IDs (where possible) and fallback images
const STRANGER_TRACKS = [
    {
        id: '1',
        name: 'Stranger Things Vol. 1',
        artist: 'Kyle Dixon & Michael Stein',
        image: 'https://i.scdn.co/image/ab67616d0000b2733fbdbf37626f8bee2abe8a39', // Verified & High Res
        spotify_id: '1puplOrvmUGoq2VxsB0ENJ',
        type: 'album'
    },
    {
        id: '2',
        name: 'Hounds of Love',
        artist: 'Kate Bush',
        image: 'https://i.scdn.co/image/ab67616d0000b273ad08f4b38efbff0c0da0f252',
        spotify_id: '5G5UwqPsxDKpxJLX4xsyuh',
        type: 'album'
    },
    {
        id: '3',
        name: 'Master of Puppets',
        artist: 'Metallica',
        image: 'https://i.scdn.co/image/ab67616d0000b273cad4832cb7b5844343278daa',
        spotify_id: '7CGhx630DIjdJqaBDVKc5j',
        type: 'album'
    },
    {
        id: '4',
        name: 'Combat Rock',
        artist: 'The Clash',
        image: 'https://i.scdn.co/image/ab67616d0000b273280b72ca76b4734debfc190e',
        spotify_id: '1ZH5g1RDq3GY1OvyD0w0s2',
        type: 'album'
    },
    {
        id: '5',
        name: 'Frontiers',
        artist: 'Journey',
        image: 'https://i.scdn.co/image/ab67616d0000b2739675b338e1be8f2bf4dae480',
        spotify_id: '3pZ6D15onAaT2YyiTbcHmh',
        type: 'album'
    },
    {
        id: '6',
        name: 'Stranger Things 4',
        artist: 'Kyle Dixon & Michael Stein',
        image: 'https://i.scdn.co/image/ab67616d0000b273acf5221c4faab1c7d2a8c792',
        spotify_id: '5qRG8S2ClNtl71wEf2TKPp',
        type: 'album'
    },
    {
        id: '7',
        name: 'The Youth of Today',
        artist: 'Musical Youth',
        image: 'https://i.scdn.co/image/ab67616d0000b2733d691945c91097b9f416b145',
        spotify_id: '2fzSaL01wmGVH2W1moTcCs',
        type: 'album'
    },
    {
        id: '8',
        name: 'Like a Virgin',
        artist: 'Madonna',
        image: 'https://i.scdn.co/image/ab67616d0000b27399d424b0873a9a714279a9f3',
        spotify_id: '2IU9ftOgyRL2caQGWK1jjX',
        type: 'album'
    }
];

export default function StrangerThingsPage() {
    const [isUpsideDown, setIsUpsideDown] = useState(false);
    const [particles, setParticles] = useState<{
        left: string;
        animationDuration: string;
        animationDelay: string;
        opacity: number;
        transform: string;
    }[]>([]);

    useEffect(() => {
        // Generate particles only on the client
        const newParticles = Array.from({ length: 50 }).map(() => ({
            left: `${Math.random() * 100}vw`,
            animationDuration: `${5 + Math.random() * 10}s`,
            animationDelay: `-${Math.random() * 10}s`,
            opacity: 0.2 + Math.random() * 0.5,
            transform: `scale(${0.5 + Math.random()})`
        }));
        setParticles(newParticles);
    }, []);

    return (
        <main className={`upside-down-container ${isUpsideDown ? 'upside-down' : ''}`}>
            <button
                onClick={() => setIsUpsideDown(!isUpsideDown)}
                className="st-toggle-btn"
            >
                {isUpsideDown ? 'LEAVE THE UPSIDE DOWN' : 'ENTER THE UPSIDE DOWN'}
            </button>


            <style jsx global>{`
                .st-toggle-btn {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    z-index: 100;
                    background: #E50914;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    transition: all 0.3s;
                }
                .upside-down .st-toggle-btn {
                    background: #0099FF;
                    transform: rotate(180deg);
                }

                .upside-down-container {
                    min-height: 100vh;
                    background: radial-gradient(circle at center, #1a0202 0%, #000000 100%);
                    color: white;
                    font-family: 'Times New Roman', serif;
                    position: relative;
                    overflow-x: hidden;
                    padding-bottom: 80px;
                    transition: transform 1s ease, filter 1s ease;
                }

                .upside-down-container.upside-down {
                    transform: rotate(180deg);
                    filter: hue-rotate(170deg) contrast(1.2);
                }

                .snow-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1;
                }

                .particle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 50%;
                    animation: float 10s linear infinite;
                    box-shadow: 0 0 5px rgba(255, 255, 255, 0.6);
                    top: -10px; /* Start slightly above viewport */
                }

                @keyframes float {
                    0% {
                        transform: translateY(-10px) translateX(0) rotate(0deg);
                    }
                    100% {
                        transform: translateY(100vh) translateX(20px) rotate(360deg);
                    }
                }
                
                /* Define a second float animation with different translateX for variety if needed, 
                   but standardizing is safer for now or we can use CSS variables for that too.
                   Let's keep it simple to fix the error first. */

                .st-header {
                    text-align: center;
                    padding-top: 120px;
                    padding-bottom: 60px;
                    position: relative;
                    z-index: 10;
                }

                .st-logo {
                    max-width: 90%;
                    width: 600px;
                    height: auto;
                    filter: drop-shadow(0 0 15px rgba(229, 9, 20, 0.6));
                    animation: flicker 4s infinite;
                    margin-bottom: 20px;
                }

                .st-subtitle {
                    font-size: 1.5rem;
                    color: #fff;
                    letter-spacing: 2px;
                    opacity: 0.8;
                }
                
                @keyframes flicker {
                    0%, 18%, 22%, 25%, 53%, 57%, 100% {
                        filter: drop-shadow(0 0 15px rgba(229, 9, 20, 0.6)) brightness(1);
                        opacity: 1;
                    }
                    20%, 24%, 55% {
                        filter: drop-shadow(0 0 5px rgba(229, 9, 20, 0.3)) brightness(0.7);
                        opacity: 0.8;
                    }
                }

                .st-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 32px;
                    padding: 0 40px;
                    max-width: 1400px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 10;
                    align-items: stretch; /* Ensure all items in a row stretch to match height */
                }
                
                @media (max-width: 1024px) {
                    .st-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 600px) {
                    .st-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .st-card {
                    background: rgba(20, 0, 0, 0.6);
                    border: 1px solid rgba(229, 9, 20, 0.2);
                    border-radius: 8px;
                    padding: 16px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    position: relative;
                    backdrop-filter: blur(4px);
                    display: flex;
                    flex-direction: column;
                    height: 100%; /* Make card fill the grid cell */
                    text-decoration: none; /* Remove default link underline */
                }


                .st-card:hover {
                    transform: translateY(-5px) scale(1.02);
                    border-color: #E50914;
                    box-shadow: 0 0 20px rgba(229, 9, 20, 0.3);
                }

                .st-image-wrapper {
                    width: 100%;
                    aspect-ratio: 1;
                    overflow: hidden;
                    border-radius: 4px;
                    margin-bottom: 12px;
                    position: relative;
                    background: #333; /* Placeholder color in case image fails */
                }

                .st-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                    filter: sepia(0.2) contrast(1.1);
                }

                .st-card:hover .st-image {
                    transform: scale(1.1);
                    filter: none;
                }

                .st-track-title {
                    font-size: 1.1rem;
                    font-weight: bold;
                    color: #fff;
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .st-artist {
                    font-size: 0.9rem;
                    color: #aaa;
                }
                
                .vine {
                    position: absolute;
                    width: 100%;
                    height: 200px;
                    background: url('hero-pattern-red.png'); /* If we had one, or create with CSS gradients */
                    opacity: 0.1;
                    bottom: 0;
                    pointer-events: none;
                }
                
                .back-link {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    color: rgba(255,255,255,0.6);
                    text-decoration: none;
                    font-size: 0.9rem;
                    z-index: 20;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: color 0.3s;
                    background: rgba(0,0,0,0.5);
                    padding: 8px 16px;
                    border-radius: 20px;
                }
                
                .back-link:hover {
                    color: #E50914;
                    background: rgba(229, 9, 20, 0.1);
                }
            `}</style>

            <Link href="/" className="back-link">
                ← Return to Normal World
            </Link>

            <div className="snow-container">
                {particles.map((style, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: style.left,
                            animationDuration: style.animationDuration,
                            animationDelay: style.animationDelay,
                            opacity: style.opacity,
                            transform: style.transform
                        }}
                    />
                ))}
            </div>

            <div className="st-header">
                <img src="/stranger-things-transparent.png" alt="Stranger Things" className="st-logo" />
                <p className="st-subtitle">WELCOME TO THE UPSIDE DOWN</p>
            </div>

            <ChristmasLights />

            <div className="st-grid">
                {STRANGER_TRACKS.map((track) => (
                    <Link href={`/album/${track.spotify_id}`} key={track.id} className="st-card">
                        <div className="st-image-wrapper">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={track.image}
                                alt={track.name}
                                className="st-image"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=2670&auto=format&fit=crop'; // Fallback vinyl image
                                }}
                            />
                        </div>
                        <h3 className="st-track-title" title={track.name}>{track.name}</h3>
                        <p className="st-artist" title={track.artist}>{track.artist}</p>
                    </Link>
                ))}
            </div>

        </main>
    );
}
