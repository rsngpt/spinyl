'use client';

import React, { useState, useEffect } from 'react';

export default function ChristmasLights() {
    const [activeLight, setActiveLight] = useState<number | null>(null);
    const [showLetters, setShowLetters] = useState(false);
    const [isRunSequence, setIsRunSequence] = useState(false);

    // Bulb configurations
    const bulbs = Array.from({ length: 26 }).map((_, i) => ({
        char: String.fromCharCode(65 + i), // A-Z
        color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][i % 6]
    }));

    useEffect(() => {
        if (isRunSequence) {
            // R-U-N Sequence
            const sequence = [
                { char: 'R', delay: 0 },
                { char: 'U', delay: 1000 },
                { char: 'N', delay: 2000 },
                { char: null, delay: 3000 } // Reset
            ];

            const timeouts: NodeJS.Timeout[] = [];

            sequence.forEach(({ char, delay }) => {
                const timeout = setTimeout(() => {
                    if (char) {
                        const index = bulbs.findIndex(b => b.char === char);
                        setActiveLight(index);
                    } else {
                        setActiveLight(null);
                        // Loop sequence if still hovering? Or just single run.
                        // Let's loop it.
                        // Actually, let's keep it simple: run once then random fallback or repeat.
                        // Repeater:
                        setTimeout(() => {
                            if (isRunSequence) setActiveLight(null); // Just a gap
                        }, 500);
                    }
                }, delay);
                timeouts.push(timeout);
            });

            // Repeat sequence every 4s
            const interval = setInterval(() => {
                sequence.forEach(({ char, delay }) => {
                    setTimeout(() => {
                        if (char) {
                            const index = bulbs.findIndex(b => b.char === char);
                            setActiveLight(index);
                        } else {
                            setActiveLight(null);
                        }
                    }, delay);
                });
            }, 4000);

            return () => {
                timeouts.forEach(clearTimeout);
                clearInterval(interval);
            };
        } else {
            // Random blinking mode
            const interval = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * bulbs.length);
                setActiveLight(randomIndex);
                // Turn off after short duration
                setTimeout(() => setActiveLight(null), 800);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isRunSequence]); // bulbs constant

    return (
        <div
            className="lights-container"
            onMouseEnter={() => { setIsRunSequence(true); setShowLetters(true); }}
            onMouseLeave={() => { setIsRunSequence(false); setShowLetters(false); setActiveLight(null); }}
        >
            <style jsx>{`
                .lights-container {
                    width: 100%;
                    max-width: 1000px;
                    height: 120px;
                    margin: 0 auto 40px;
                    position: relative;
                    display: flex;
                    justify-content: space-between;
                    padding: 0 40px;
                    cursor: pointer;
                }
                
                .wire {
                    position: absolute;
                    top: 10px;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: #222;
                    border-radius: 50%; /* Curve effect achieved simpler via SVG usually, but straight wire for grid alignment */
                    z-index: 1;
                    display: none; /* Using pseudo-element or just aligning bulbs on unseen wire */
                }

                .bulb-wrapper {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 2;
                }

                .wire-segment {
                     position: absolute;
                     top: -20px;
                     left: 50%;
                     width: 100%;
                     height: 30px;
                     border-bottom: 2px solid #555;
                     border-radius: 50%;
                     transform: translateX(-50%);
                     z-index: 0;
                }

                .bulb {
                    width: 20px;
                    height: 30px;
                    border-radius: 50% 50% 40% 40%;
                    background-color: #444;
                    opacity: 0.3;
                    transition: all 0.1s ease;
                    box-shadow: 0 0 5px rgba(0,0,0,0.5);
                }

                .bulb.active {
                    opacity: 1;
                    box-shadow: 0 0 40px var(--bulb-color), 0 0 10px var(--bulb-color);
                    background-color: var(--bulb-color);
                }
                
                .letter {
                    margin-top: 10px;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    font-size: 1.5rem;
                    color: #000;
                    text-stroke: 1px #fff; /* Webkit support needed typically */
                    -webkit-text-stroke: 1px rgba(255,255,255,0.5);
                    opacity: 0.2;
                    transition: opacity 0.3s;
                }
                
                .lights-container:hover .letter {
                    opacity: 0.8;
                }
                
                .bulb-wrapper.lit .letter {
                    opacity: 1;
                    color: #fff;
                    text-shadow: 0 0 20px #fff;
                }
            `}</style>

            {/* Simple Wire SVG roughly */}
            <svg
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '50px', zIndex: 0, pointerEvents: 'none' }}
                preserveAspectRatio="none"
                viewBox={`0 0 ${bulbs.length * 40} 50`}
            >
                <path
                    d={`M0,10 ${bulbs.map((_, i) => `Q${i * 40 + 20},40 ${(i + 1) * 40},10`).join(' ')}`}
                    fill="none"
                    stroke="#2a2a2a"
                    strokeWidth="3"
                />
            </svg>

            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                {bulbs.map((bulb, i) => (
                    <div key={i} className={`bulb-wrapper ${activeLight === i ? 'lit' : ''}`}>
                        <div
                            className={`bulb ${activeLight === i ? 'active' : ''}`}
                            style={{ '--bulb-color': bulb.color } as React.CSSProperties}
                        />
                        <span className="letter">{bulb.char}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
