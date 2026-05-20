'use client';

import React from 'react';
import Link from 'next/link';

export default function Hero() {
    return (
        <section style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '120px 24px 60px',
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: '400px',
                height: '400px',
                background: 'rgba(29, 185, 84, 0.15)',
                filter: 'blur(100px)',
                borderRadius: '50%',
                zIndex: 0,
                animation: 'pulse 5s ease-in-out infinite'
            }} />

            <div style={{
                maxWidth: '1200px',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '60px',
                alignItems: 'center',
                zIndex: 1,
                position: 'relative'
            }}>
                {/* Left: Text Content */}
                <div style={{ textAlign: 'left' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: 'rgba(255, 159, 104, 0.1)',
                        border: '1px solid rgba(255, 159, 104, 0.3)',
                        borderRadius: '50px',
                        color: '#ffb488',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '24px',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }} className="animate-fade-in-up">
                        Welcome to Spinyl
                    </div>

                    <h1 className="animate-fade-in-up" style={{
                        fontSize: 'clamp(3rem, 5vw, 4.5rem)', // Responsive font size
                        lineHeight: '1.1',
                        fontWeight: 800,
                        marginBottom: '24px',
                        color: '#fff',
                        animationDelay: '0.1s'
                    }}>
                        Discover Your <br />
                        <span className="text-gradient">Next Favorite Album</span>
                    </h1>

                    <p className="animate-fade-in-up" style={{
                        fontSize: '1.2rem',
                        color: '#B3B3B3',
                        lineHeight: '1.6',
                        marginBottom: '40px',
                        maxWidth: '500px',
                        animationDelay: '0.2s'
                    }}>
                        Join a community of music lovers. connect with your favorite tunes, share reviews, and uncover hidden gems.
                    </p>

                    <div className="animate-fade-in-up" style={{ display: 'flex', gap: '20px', animationDelay: '0.3s' }}>
                        <Link
                            href="/explore"
                            style={{
                                padding: '16px 32px',
                                background: '#ff9f68',
                                color: '#4e260f',
                                borderRadius: '500px',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                position: 'relative',
                                zIndex: 10,
                                textDecoration: 'none'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 159, 104, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            Start Exploring
                        </Link>
                    </div>
                </div>

                {/* Right: Floating Visual (Hidden on mobile via CSS usually, or just stacked) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <div className="animate-float vinyl-group" style={{
                        position: 'relative',
                        width: '400px',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        {/* Decorative Circle (Simulating a record or abstract sound wave) */}
                        {/* New Larger Rings */}
                        <div style={{
                            position: 'absolute',
                            width: '130%',
                            height: '130%',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '50%',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none'
                        }} />
                        <div style={{
                            position: 'absolute',
                            width: '160%',
                            height: '160%',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '50%',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none'
                        }} />
                        <div style={{
                            position: 'absolute',
                            width: '190%',
                            height: '190%',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: '50%',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none'
                        }} />

                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                        }} />
                        <div style={{
                            position: 'absolute',
                            width: '80%',
                            height: '80%',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                        }} />

                        {/* The Record */}
                        {/* The Record */}
                        <div className="animate-spin-slow" style={{
                            width: '320px',
                            height: '320px',
                            background: 'radial-gradient(circle at 30% 30%, #2a2a2a, #000)',
                            borderRadius: '50%',
                            position: 'relative',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 8px rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #333',
                            animationDuration: '4s' // Faster rotation for realism
                        }}>
                            {/* Record Label */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: '#ff9f68',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
                                position: 'relative'
                            }}>
                                {/* Decorative Ring */}
                                <div style={{
                                    position: 'absolute',
                                    width: '85%',
                                    height: '85%',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '50%'
                                }} />

                                <span style={{
                                    fontSize: '3rem',
                                    fontWeight: '800',
                                    color: '#fff',
                                    fontFamily: 'var(--font-family)',
                                    textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                                    marginBottom: '2px'
                                }}>S</span>
                            </div>
                        </div>

                        {/* Tone Arm */}
                        <div className="tone-arm" style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '20px',
                            width: '120px',
                            height: '180px',
                            pointerEvents: 'none',
                            // Transform handled by CSS class .tone-arm
                            filter: 'drop-shadow(5px 5px 10px rgba(0,0,0,0.5))'
                        }}>
                            {/* Pivot Base */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '40px',
                                height: '40px',
                                background: '#444',
                                borderRadius: '50%',
                                border: '2px solid #222'
                            }} />
                            {/* Arm Rod */}
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                width: '12px',
                                height: '140px',
                                background: '#666',
                                borderRadius: '6px',
                                transform: 'rotate(-25deg)',
                                transformOrigin: 'top center'
                            }} />
                            {/* Head shell */}
                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '30px',
                                width: '30px',
                                height: '40px',
                                background: '#333',
                                borderRadius: '4px',
                                transform: 'rotate(15deg)'
                            }} />
                        </div>

                        {/* Floating Review 1 - Top Left (High) */}
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            left: '0px',
                            background: 'rgba(255,255,255,0.18)', // Level 1
                            padding: '8px 16px',
                            borderRadius: '20px',
                            color: 'rgba(255,255,255,0.95)',
                            fontSize: '0.85rem',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                            animation: 'float 5s ease-in-out infinite',
                            animationDelay: '0s',
                            zIndex: 2,
                            pointerEvents: 'none'
                        }}>
                            ⭐⭐⭐⭐⭐ "Masterpiece"
                        </div>

                        {/* Floating Review 2 - Far Right (Below Tone Arm) */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            right: '-90px',
                            background: 'rgba(255,255,255,0.14)', // Level 2
                            padding: '8px 16px',
                            borderRadius: '20px',
                            color: 'rgba(255,255,255,0.85)',
                            fontSize: '0.8rem',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            animation: 'float 7s ease-in-out infinite reverse',
                            animationDelay: '1s',
                            zIndex: 1,
                            pointerEvents: 'none'
                        }}>
                            "Matches my vibe 🌊"
                        </div>

                        {/* Floating Review 3 - Bottom Left */}
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '-30px',
                            background: 'rgba(255,255,255,0.10)', // Level 3
                            padding: '6px 14px',
                            borderRadius: '20px',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.75rem',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            animation: 'float 6s ease-in-out infinite',
                            animationDelay: '2s',
                            zIndex: 1,
                            pointerEvents: 'none'
                        }}>
                            "Instant Classic."
                        </div>

                        {/* Floating Review 4 - Bottom Right */}
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '-50px',
                            background: 'rgba(255,255,255,0.07)', // Level 4
                            padding: '8px 16px',
                            borderRadius: '20px',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.8rem',
                            backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            animation: 'float 8s ease-in-out infinite reverse',
                            animationDelay: '1.5s',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}>
                            "On repeat 🔁"
                        </div>

                        {/* Floating Review 5 - Far Left (Mid) */}
                        <div style={{
                            position: 'absolute',
                            top: '40%',
                            left: '-90px',
                            background: 'rgba(255,255,255,0.05)', // Level 5
                            padding: '6px 12px',
                            borderRadius: '20px',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.7rem',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            animation: 'float 9s ease-in-out infinite',
                            animationDelay: '3s',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}>
                            "Underrated gem."
                        </div>

                        {/* Floating Review 6 - Bottom Center (Deep) */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(255,255,255,0.03)', // Level 6
                            padding: '8px 14px',
                            borderRadius: '20px',
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.75rem',
                            backdropFilter: 'blur(3px)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                            animation: 'float 7.5s ease-in-out infinite',
                            animationDelay: '4s',
                            zIndex: -1,
                            pointerEvents: 'none'
                        }}>
                            "Soundtrack of my life 🎵"
                        </div>

                        {/* Floating elements */}
                        <div style={{
                            position: 'absolute',
                            top: '10%',
                            right: '10%',
                            background: '#ff9f68',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            filter: 'blur(30px)',
                            opacity: 0.6,
                            animation: 'float 4s ease-in-out infinite reverse'
                        }} />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 900px) {
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                        text-align: center;
                         gap: 40px !important;
                    }
                    div[style*="text-align: left"] {
                        text-align: center !important;
                        align-items: center;
                        display: flex;
                        flex-direction: column;
                        margin: 0 auto;
                    }
                    /* HIDE VINYL ON MOBILE */
                    .vinyl-group, .tone-arm {
                        display: none !important;
                    }
                    div[style*="justify-content: center"] {
                         display: none !important; /* Hide the wrapper too to remove spacing */
                    }
                }
            `}</style>
        </section>
    );
}
