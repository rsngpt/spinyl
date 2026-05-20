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
                width: '450px',
                height: '450px',
                background: 'radial-gradient(circle, rgba(255, 159, 104, 0.15) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(100px)',
                borderRadius: '50%',
                zIndex: 0,
                animation: 'pulse 6s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '15%',
                width: '350px',
                height: '350px',
                background: 'radial-gradient(circle, rgba(255, 209, 102, 0.08) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(80px)',
                borderRadius: '50%',
                zIndex: 0,
                animation: 'pulse 8s ease-in-out infinite'
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
                        padding: '8px 20px',
                        background: 'var(--md-sys-color-primary-container)',
                        border: '1px solid var(--md-sys-color-outline-variant)',
                        borderRadius: 'var(--md-shape-corner-full)',
                        color: 'var(--md-sys-color-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '24px',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }} className="animate-fade-in-up">
                        ✨ Welcome to Spinyl
                    </div>

                    <h1 className="animate-fade-in-up" style={{
                        fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                        lineHeight: '1.1',
                        fontWeight: 800,
                        fontFamily: 'var(--font-display)',
                        marginBottom: '24px',
                        color: 'var(--md-sys-color-on-background)',
                        animationDelay: '0.1s',
                        letterSpacing: '-0.02em'
                    }}>
                        Discover Your <br />
                        <span style={{
                            background: 'linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--md-sys-color-tertiary) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Next Favorite Album</span>
                    </h1>

                    <p className="animate-fade-in-up" style={{
                        fontSize: '1.15rem',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        lineHeight: '1.6',
                        marginBottom: '40px',
                        maxWidth: '500px',
                        animationDelay: '0.2s'
                    }}>
                        Join a community of music lovers. Connect with your favorite tunes, share reviews, and uncover hidden gems.
                    </p>

                    <div className="animate-fade-in-up" style={{ display: 'flex', gap: '20px', animationDelay: '0.3s' }}>
                        <Link
                            href="/explore"
                            style={{
                                padding: '16px 36px',
                                background: 'var(--md-sys-color-primary)',
                                color: 'var(--md-sys-color-on-primary)',
                                borderRadius: 'var(--md-shape-corner-full)',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'var(--transition-spring)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                position: 'relative',
                                zIndex: 10,
                                textDecoration: 'none',
                                boxShadow: '0 4px 15px rgba(255, 159, 104, 0.2)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 159, 104, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 159, 104, 0.2)';
                            }}
                        >
                            Start Exploring
                        </Link>
                    </div>
                </div>

                {/* Right: Floating Visual */}
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
                        {/* Orbit Rings */}
                        <div style={{
                            position: 'absolute',
                            width: '130%',
                            height: '130%',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            opacity: 0.3,
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
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            opacity: 0.2,
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
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            opacity: 0.1,
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
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            opacity: 0.4,
                            borderRadius: '50%',
                        }} />
                        <div style={{
                            position: 'absolute',
                            width: '80%',
                            height: '80%',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            opacity: 0.2,
                            borderRadius: '50%',
                        }} />

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
                            border: '2px solid var(--md-sys-color-outline-variant)',
                            animationDuration: '4s'
                        }}>
                            {/* Record Label */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--md-sys-color-tertiary) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                                position: 'relative'
                            }}>
                                {/* Decorative Ring */}
                                <div style={{
                                    position: 'absolute',
                                    width: '85%',
                                    height: '85%',
                                    border: '1.5px dashed rgba(255,255,255,0.4)',
                                    borderRadius: '50%'
                                }} />

                                <span style={{
                                    fontSize: '3rem',
                                    fontWeight: '900',
                                    color: '#fff',
                                    fontFamily: 'var(--font-display)',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
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
                            top: '-25px',
                            left: '0px',
                            background: 'rgba(51, 42, 38, 0.85)',
                            padding: '10px 20px',
                            borderRadius: 'var(--md-shape-corner-large)',
                            color: 'var(--md-sys-color-on-surface)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            backdropFilter: 'blur(16px)',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 15px rgba(255, 159, 104, 0.1)',
                            animation: 'float 5s ease-in-out infinite',
                            animationDelay: '0s',
                            zIndex: 2,
                            pointerEvents: 'none'
                        }}>
                            ⭐⭐⭐⭐⭐ "Masterpiece"
                        </div>

                        {/* Floating Review 2 - Far Right */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            right: '-95px',
                            background: 'rgba(34, 27, 25, 0.8)',
                            padding: '10px 20px',
                            borderRadius: 'var(--md-shape-corner-large)',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            backdropFilter: 'blur(12px)',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 15px rgba(255, 159, 104, 0.05)',
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
                            left: '-35px',
                            background: 'rgba(34, 27, 25, 0.75)',
                            padding: '8px 18px',
                            borderRadius: 'var(--md-shape-corner-large)',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            fontSize: '0.8rem',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
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
                            right: '-55px',
                            background: 'rgba(34, 27, 25, 0.7)',
                            padding: '10px 20px',
                            borderRadius: 'var(--md-shape-corner-large)',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            fontSize: '0.8rem',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            animation: 'float 8s ease-in-out infinite reverse',
                            animationDelay: '1.5s',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}>
                            "On repeat 🔁"
                        </div>

                        {/* Floating Review 5 - Far Left */}
                        <div style={{
                            position: 'absolute',
                            top: '40%',
                            left: '-95px',
                            background: 'rgba(34, 27, 25, 0.65)',
                            padding: '8px 16px',
                            borderRadius: 'var(--md-shape-corner-large)',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            fontSize: '0.75rem',
                            backdropFilter: 'blur(6px)',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            animation: 'float 9s ease-in-out infinite',
                            animationDelay: '3s',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}>
                            "Underrated gem."
                        </div>

                        {/* Floating Review 6 - Bottom Center */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-65px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(34, 27, 25, 0.55)',
                            padding: '10px 18px',
                            borderRadius: 'var(--md-shape-corner-large)',
                            color: 'var(--md-sys-color-on-surface-variant)',
                            fontSize: '0.75rem',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid var(--md-sys-color-outline-variant)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            animation: 'float 7.5s ease-in-out infinite',
                            animationDelay: '4s',
                            zIndex: -1,
                            pointerEvents: 'none'
                        }}>
                            "Soundtrack of my life 🎵"
                        </div>

                        {/* Glow orb */}
                        <div style={{
                            position: 'absolute',
                            top: '10%',
                            right: '10%',
                            background: 'var(--md-sys-color-primary)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            filter: 'blur(30px)',
                            opacity: 0.4,
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
                    .vinyl-group, .tone-arm {
                        display: none !important;
                    }
                    div[style*="justify-content: center"] {
                         display: none !important;
                    }
                }
            `}</style>
        </section>
    );
}
