'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type VinylState = 'GOLD' | 'SILVER' | 'BLACK' | 'BROKEN';

interface VinylRatingInputProps {
    value: number; // 1-10
    onChange: (val: number) => void;
    readonly?: boolean;
}

const getVinylState = (score: number): VinylState => {
    if (score === 10) return 'GOLD';
    if (score >= 7) return 'SILVER';
    if (score >= 4) return 'BLACK';
    return 'BROKEN';
};

const getLabel = (score: number) => {
    if (score === 10) return "Masterpiece (Gold)";
    if (score >= 7) return "Platinum Hit (Silver)";
    if (score >= 4) return "Standard Pressing";
    return "Damaged Goods (Broken)";
};

const VinylDisc = ({ state }: { state: VinylState }) => {
    // ROBUST SVG IMPLEMENTATION

    // Determine gradient/colors based on state
    // We keep the logic simple to prevent DOM thrashing
    const isGold = state === 'GOLD';
    const isSilver = state === 'SILVER';
    const isShiny = isGold || isSilver || state === 'BLACK'; // Black is also shiny now

    const getFill = () => {
        if (isGold) return 'url(#goldGrooves)';
        if (isSilver) return 'url(#silverGrooves)';
        return 'url(#blackGrooves)';
    };

    const getStroke = () => {
        if (isGold) return '#ffd700';
        if (isSilver) return '#cccccc';
        if (state === 'BLACK') return '#444';
        return '#ef4444'; // Red for broken
    };

    return (
        <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}>
            <defs>
                {/* 1. GROOVE GRADIENTS - Stable IDs */}

                {/* Gold Gradient */}
                <radialGradient id="goldGrooves" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="30%" stopColor="#b8860b" />
                    <stop offset="35%" stopColor="#daa520" />
                    <stop offset="40%" stopColor="#b8860b" />
                    <stop offset="45%" stopColor="#ffd700" />
                    <stop offset="50%" stopColor="#b8860b" />
                    <stop offset="55%" stopColor="#daa520" />
                    <stop offset="60%" stopColor="#b8860b" />
                    <stop offset="65%" stopColor="#ffd700" />
                    <stop offset="70%" stopColor="#b8860b" />
                    <stop offset="75%" stopColor="#daa520" />
                    <stop offset="80%" stopColor="#b8860b" />
                    <stop offset="85%" stopColor="#daa520" />
                    <stop offset="90%" stopColor="#b8860b" />
                    <stop offset="95%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#b8860b" />
                </radialGradient>

                {/* Silver Gradient */}
                <radialGradient id="silverGrooves" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="30%" stopColor="#666" />
                    <stop offset="35%" stopColor="#999" />
                    <stop offset="40%" stopColor="#777" />
                    <stop offset="45%" stopColor="#ccc" />
                    <stop offset="50%" stopColor="#888" />
                    <stop offset="55%" stopColor="#bbb" />
                    <stop offset="60%" stopColor="#999" />
                    <stop offset="65%" stopColor="#666" />
                    <stop offset="70%" stopColor="#999" />
                    <stop offset="75%" stopColor="#888" />
                    <stop offset="80%" stopColor="#aaa" />
                    <stop offset="85%" stopColor="#777" />
                    <stop offset="90%" stopColor="#ccc" />
                    <stop offset="95%" stopColor="#999" />
                    <stop offset="100%" stopColor="#666" />
                </radialGradient>

                {/* Black Gradient */}
                <radialGradient id="blackGrooves" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="30%" stopColor="#111" />
                    <stop offset="35%" stopColor="#222" />
                    <stop offset="40%" stopColor="#111" />
                    <stop offset="45%" stopColor="#333" />
                    <stop offset="50%" stopColor="#1a1a1a" />
                    <stop offset="55%" stopColor="#222" />
                    <stop offset="60%" stopColor="#111" />
                    <stop offset="65%" stopColor="#333" />
                    <stop offset="70%" stopColor="#1a1a1a" />
                    <stop offset="80%" stopColor="#222" />
                    <stop offset="90%" stopColor="#111" />
                    <stop offset="100%" stopColor="#000" />
                </radialGradient>

                {/* Sheen/Reflection */}
                <linearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="40%" stopColor="white" stopOpacity="0" />
                    <stop offset="50%" stopColor="white" stopOpacity={isShiny ? 0.4 : 0.1} />
                    <stop offset="60%" stopColor="white" stopOpacity="0" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>

                <clipPath id="vinylClip">
                    <circle cx="100" cy="100" r="99" />
                </clipPath>

                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g clipPath="url(#vinylClip)">
                {/* Main Disc */}
                <circle cx="100" cy="100" r="99" fill={getFill()} stroke="none"
                    className="transition-all duration-500 ease-in-out" // Added class for smooth fill transition
                />

                {/* Ring */}
                <circle cx="100" cy="100" r="98" fill="none" stroke={getStroke()} strokeWidth="2" />

                {/* Reflections */}
                <rect x="-50" y="-50" width="300" height="300" fill="url(#sheen)" style={{ mixBlendMode: 'overlay' }} transform="rotate(20, 100, 100)" />
                <rect x="-50" y="-50" width="300" height="300" fill="url(#sheen)" style={{ mixBlendMode: 'overlay' }} transform="rotate(-20, 100, 100)" />

                {/* Micro-grooves */}
                <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none">
                    <circle cx="100" cy="100" r="90" />
                    <circle cx="100" cy="100" r="75" />
                    <circle cx="100" cy="100" r="60" />
                    <circle cx="100" cy="100" r="45" />
                </g>

                {/* Broken/Cracked State */}
                {state === 'BROKEN' && (
                    <g opacity="0.8">
                        {/* Shadow */}
                        <path d="M90 0 L 85 80 L 105 120 L 80 200" stroke="black" strokeWidth="4" fill="none" filter="blur(2px)" />
                        {/* Crack */}
                        <path d="M90 0 L 85 80 L 105 120 L 80 200" stroke="#ff0000" strokeWidth="2" fill="none" />
                        {/* Scratches */}
                        <path d="M40 160 Q 100 100 160 40" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
                    </g>
                )}
            </g>

            {/* Sparkles (Gold/Silver/Shiny Black) */}
            {isShiny && (
                <g fill="white" filter="url(#glow)">
                    <circle cx="150" cy="50" r={isGold ? 3 : 2} opacity="0.6">
                        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    {isGold && (
                        <path d="M150 150 L152 145 L154 150 L159 152 L154 154 L152 159 L150 154 L145 152 Z" fill="#fff" opacity="0.8">
                            <animateTransform attributeName="transform" type="rotate" from="0 152 152" to="360 152 152" dur="8s" repeatCount="indefinite" />
                        </path>
                    )}
                </g>
            )}

            {/* Label - Color Matches State */}
            <circle cx="100" cy="100" r="32"
                fill={isGold ? '#d4af37' : isSilver ? '#b0b0b0' : state === 'BLACK' ? '#333' : '#b91c1c'}
                stroke="rgba(0,0,0,0.3)" strokeWidth="1"
                className="transition-colors duration-500"
            />
            {/* Spindle */}
            <circle cx="100" cy="100" r="4" fill="#000" />
            <circle cx="100" cy="100" r="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        </svg>
    );
};

export default function VinylRatingInput({ value, onChange, readonly = false }: VinylRatingInputProps) {
    const currentState = getVinylState(value);

    // Dynamic accent color
    const accentColor =
        currentState === 'GOLD' ? '#ffd700' :
            currentState === 'SILVER' ? '#e2e8f0' :
                currentState === 'BLACK' ? '#fff' :
                    '#ef4444'; // Red for Broken

    const disc = (
        <div
            className="relative transition-transform duration-100 linear flex-shrink-0 drop-shadow-2xl filter" // Faster, linear rotation check
            style={{
                width: readonly ? '100%' : '160px',
                height: readonly ? '100%' : '160px',
                transform: `rotate(${value * 36}deg)`,
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'
            }}
        >
            <div className="w-full h-full">
                <VinylDisc state={currentState} />
            </div>
        </div>
    );

    if (readonly) {
        return disc;
    }

    return (
        <div
            className="w-full max-w-2xl mx-auto p-4 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-sm"
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '32px'
            }}
        >
            {/* LEFT: Vinyl Graphic */}
            <div className="flex-shrink-0" style={{ width: '160px', height: '160px' }}>
                {disc}
            </div>

            {/* RIGHT: Glass Tuner Panel */}
            <div
                className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl p-6 flex flex-col justify-center min-h-[160px]"
                style={{ flex: 1 }}
            >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                        <div>
                            <div className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1">
                                Spinyl's Vinyl
                            </div>
                            <motion.div
                                // REMOVED key={value} to prevent flickering text re-mounts
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-bold text-sm tracking-widest uppercase transition-colors duration-300"
                                style={{ color: accentColor, textShadow: `0 0 10px ${accentColor}40` }}
                            >
                                {getLabel(value)}
                            </motion.div>
                        </div>
                        <div className="text-4xl font-black italic text-white/90">
                            {value}<span className="text-sm text-white/30 not-italic font-normal ml-1">/10</span>
                        </div>
                    </div>

                    {/* SLIDER TRACK */}
                    <div className="relative w-full h-12 bg-black/40 rounded-full border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex items-center px-4 group">
                        {/* Ticks */}
                        <div className="absolute inset-x-4 h-full flex justify-between items-center pointer-events-none opacity-40">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <div key={num} className={`w-0.5 rounded-full bg-white ${num % 5 === 0 ? 'h-5 opacity-80' : 'h-2 opacity-30'}`} />
                            ))}
                        </div>

                        {/* Needle */}
                        <motion.div
                            className="absolute h-8 w-1 rounded-full z-10 pointer-events-none"
                            animate={{
                                left: `calc(${((value - 1) / 9) * 100}% + 16px - ${(value - 1) * (32 / 9)}px)`
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }} // Smooth spring
                            style={{
                                left: `${((value - 1) / 9) * 85 + 7.5}%`,
                                backgroundColor: accentColor,
                                boxShadow: `0 0 15px ${accentColor}`
                            }}
                        />

                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={value}
                            onChange={(e) => onChange(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
