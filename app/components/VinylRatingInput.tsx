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

const VinylDisc = ({ state, value }: { state: VinylState; value: number }) => {
    const isGold = state === 'GOLD';
    const isSilver = state === 'SILVER';
    const isShiny = isGold || isSilver || state === 'BLACK';

    const getFill = () => {
        if (isGold) return 'url(#goldGrooves)';
        if (isSilver) return 'url(#silverGrooves)';
        return 'url(#blackGrooves)';
    };

    const getStroke = () => {
        if (isGold) return '#ff9f68';
        if (isSilver) return '#ffa776';
        if (state === 'BLACK') return 'var(--md-sys-color-outline-variant)';
        return 'var(--md-sys-color-error)';
    };

    return (
        <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.65))' }}>
            <defs>
                {/* Gold Gradient */}
                <radialGradient id="goldGrooves" cx="50%" cy="50%" r="50%">
                    <stop offset="30%" stopColor="#8d4a1f" />
                    <stop offset="45%" stopColor="#ff9f68" />
                    <stop offset="60%" stopColor="#daa520" />
                    <stop offset="75%" stopColor="#ff9f68" />
                    <stop offset="90%" stopColor="#b8860b" />
                    <stop offset="100%" stopColor="#ff9f68" />
                </radialGradient>

                {/* Silver Gradient */}
                <radialGradient id="silverGrooves" cx="50%" cy="50%" r="50%">
                    <stop offset="30%" stopColor="#4a4440" />
                    <stop offset="45%" stopColor="#ffa776" />
                    <stop offset="60%" stopColor="#a3968e" />
                    <stop offset="75%" stopColor="#ffa776" />
                    <stop offset="90%" stopColor="#8c7e75" />
                    <stop offset="100%" stopColor="#ffa776" />
                </radialGradient>

                {/* Black/Charcoal M3 Expressive Gradient */}
                <radialGradient id="blackGrooves" cx="50%" cy="50%" r="50%">
                    <stop offset="30%" stopColor="#1e1815" />
                    <stop offset="40%" stopColor="#2e2520" />
                    <stop offset="50%" stopColor="#1e1815" />
                    <stop offset="60%" stopColor="#ff9f68" stopOpacity="0.25" /> {/* Subtle orange groove glow */}
                    <stop offset="70%" stopColor="#1e1815" />
                    <stop offset="85%" stopColor="#2e2520" />
                    <stop offset="100%" stopColor="#130f0d" />
                </radialGradient>

                {/* Sheen/Reflection */}
                <linearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="40%" stopColor="white" stopOpacity="0" />
                    <stop offset="50%" stopColor="white" stopOpacity={isShiny ? 0.35 : 0.08} />
                    <stop offset="60%" stopColor="white" stopOpacity="0" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>

                <clipPath id="vinylClip">
                    <circle cx="100" cy="100" r="99" />
                </clipPath>

                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g clipPath="url(#vinylClip)">
                {/* Main Disc */}
                <circle cx="100" cy="100" r="99" fill={getFill()} stroke="none" className="transition-all duration-500 ease-in-out" />

                {/* Outer Ring */}
                <circle cx="100" cy="100" r="98" fill="none" stroke={getStroke()} strokeWidth="1.5" />

                {/* Reflections */}
                <rect x="-50" y="-50" width="300" height="300" fill="url(#sheen)" style={{ mixBlendMode: 'overlay' }} transform="rotate(25, 100, 100)" />
                <rect x="-50" y="-50" width="300" height="300" fill="url(#sheen)" style={{ mixBlendMode: 'overlay' }} transform="rotate(-25, 100, 100)" />

                {/* Micro-grooves */}
                <g stroke="rgba(255,159,104,0.15)" strokeWidth="0.5" fill="none">
                    <circle cx="100" cy="100" r="90" />
                    <circle cx="100" cy="100" r="78" />
                    <circle cx="100" cy="100" r="64" />
                    <circle cx="100" cy="100" r="50" />
                </g>

                {/* Broken/Cracked State */}
                {state === 'BROKEN' && (
                    <g opacity="0.9">
                        <path d="M95 0 L 90 70 L 108 115 L 85 200" stroke="#000" strokeWidth="5" fill="none" filter="blur(2px)" />
                        <path d="M95 0 L 90 70 L 108 115 L 85 200" stroke="var(--md-sys-color-primary)" strokeWidth="2.5" fill="none" />
                        <path d="M35 155 Q 100 100 165 35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                    </g>
                )}
            </g>

            {/* Sparkles */}
            {isShiny && (
                <g fill="white" filter="url(#glow)">
                    <circle cx="145" cy="45" r={isGold ? 2.5 : 1.5} opacity="0.7">
                        <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
                    </circle>
                    {isGold && (
                        <path d="M152 148 L154 143 L156 148 L161 150 L156 152 L154 157 L152 152 L147 150 Z" fill="#ff9f68" opacity="0.9">
                            <animateTransform attributeName="transform" type="rotate" from="0 154 150" to="360 154 150" dur="6s" repeatCount="indefinite" />
                        </path>
                    )}
                </g>
            )}

            {/* Center Label Group */}
            <g>
                <circle cx="100" cy="100" r="32"
                    fill={isGold ? 'var(--md-sys-color-primary)' : isSilver ? 'var(--md-sys-color-secondary-container)' : state === 'BLACK' ? 'var(--md-sys-color-surface-container-high)' : 'var(--md-sys-color-error-container)'}
                    stroke="rgba(0,0,0,0.4)" strokeWidth="1.5"
                    className="transition-colors duration-500"
                />
                
                {/* Decorative Inner Ring */}
                <circle cx="100" cy="100" r="28" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 2" />

                {/* Large M3 Display rating number in the center label */}
                <text x="100" y="106" 
                      textAnchor="middle" 
                      fill={isGold ? 'var(--md-sys-color-on-primary)' : isSilver ? 'var(--md-sys-color-on-secondary-container)' : state === 'BLACK' ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-error-container)'}
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', letterSpacing: '-1px' }}>
                    {value}
                </text>
            </g>

            {/* Spindle hole */}
            <circle cx="100" cy="100" r="3.5" fill="#130f0d" />
            <circle cx="100" cy="100" r="3.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
        </svg>
    );
};

export default function VinylRatingInput({ value, onChange, readonly = false }: VinylRatingInputProps) {
    const currentState = getVinylState(value);

    // Dynamic accent color
    const accentColor =
        currentState === 'GOLD' ? 'var(--md-sys-color-primary)' :
            currentState === 'SILVER' ? 'var(--md-sys-color-secondary)' :
                currentState === 'BLACK' ? 'var(--md-sys-color-on-surface)' :
                    'var(--md-sys-color-error)'; 

    const disc = (
        <motion.div
            className="relative flex-shrink-0"
            animate={{ rotate: value * 36 }}
            whileHover={readonly ? {} : { scale: 1.05 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            style={{
                width: readonly ? '100%' : '160px',
                height: readonly ? '100%' : '160px',
                cursor: readonly ? 'default' : 'grab'
            }}
        >
            <div className="w-full h-full">
                <VinylDisc state={currentState} value={value} />
            </div>
        </motion.div>
    );

    if (readonly) {
        return disc;
    }

    return (
        <div className="m3-vinyl-rating-container">
            {/* LEFT: Vinyl Graphic */}
            <div className="flex-shrink-0" style={{ width: '160px', height: '160px' }}>
                {disc}
            </div>

            {/* RIGHT: Glass Tuner Panel */}
            <div
                className="relative overflow-hidden rounded-[20px] bg-white/[0.03] border border-white/5 p-5 flex flex-col justify-center min-h-[160px]"
                style={{ flex: 1, width: '100%' }}
            >
                <div className="relative z-10 flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                        <div>
                            <div className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1">
                                Spinyl's Vinyl
                            </div>
                            <motion.div
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
                    <div className="relative w-full h-8 flex items-center group">
                        {/* Background Track */}
                        <div className="absolute left-0 right-0 h-2 bg-white/10 rounded-full" />
                        
                        {/* Active Fill Track */}
                        <motion.div 
                            className="absolute left-0 h-2 rounded-full"
                            animate={{
                                width: `calc(${((value - 1) / 9) * 100}%)`
                            }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            style={{
                                background: 'var(--md-sys-color-primary)',
                                boxShadow: '0 0 10px rgba(255, 159, 104, 0.4)'
                            }}
                        />

                        {/* Ticks */}
                        <div className="absolute left-0 right-0 h-full flex justify-between items-center pointer-events-none px-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <div key={num} 
                                     className="w-1.5 h-1.5 rounded-full" 
                                     style={{ 
                                         backgroundColor: num <= value ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)',
                                         zIndex: 5
                                     }} 
                                />
                            ))}
                        </div>

                        {/* Thumb */}
                        <motion.div
                            className="absolute h-6 w-6 rounded-full bg-white border-4 flex items-center justify-center cursor-pointer z-10"
                            animate={{
                                left: `calc(${((value - 1) / 9) * 100}% - 12px)`
                            }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            style={{
                                borderColor: 'var(--md-sys-color-primary)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                            }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--md-sys-color-primary)' }} />
                        </motion.div>

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
