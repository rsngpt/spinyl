'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, Share2 } from 'lucide-react';
import VinylRatingInput from './VinylRatingInput';

interface SpinylCardProps {
    albumName: string;
    artistName: string;
    coverUrl: string;
    rating: number;
    reviewText: string;
    username: string;
    onClose: () => void;
}

export default function SpinylCard({
    albumName,
    artistName,
    coverUrl,
    rating,
    reviewText,
    username,
    onClose
}: SpinylCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            // Wait for images to load? distinct crossOrigin might be needed for Spotify images
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2, // Retina quality
                backgroundColor: null,
            });

            const link = document.createElement('a');
            link.download = `spinyl-review-${albumName.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to generate image", err);
            alert("Failed to generate image. Try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md flex flex-col gap-4">
                {/* Controls */}
                <div className="flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg">Share Your Verdict</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* The CARD Container (This is what gets captured) */}
                <div
                    ref={cardRef}
                    className="aspect-[9/16] w-full bg-[#111] overflow-hidden relative flex flex-col items-center shadow-2xl"
                    style={{ borderRadius: '24px' }}
                >
                    {/* 1. Background (Glassmorphism) */}
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60 blur-xl scale-110"
                        style={{ backgroundImage: `url(${coverUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90" />

                    {/* 2. Content */}
                    <div className="relative z-10 w-full h-full flex flex-col p-8 pt-12">

                        {/* Header: User Info */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg">
                                {username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm tracking-wide">@{username}</span>
                                <span className="text-white/60 text-xs uppercase tracking-wider">Spinyl Verdict</span>
                            </div>
                        </div>

                        {/* Main Visual: Album + Vinyl Slide-out */}
                        <div className="relative w-full aspect-square mb-8">
                            {/* The Vinyl Record (Slid out to the right) */}
                            <div className="absolute top-2 right-[-20%] w-[95%] h-[95%] rounded-full animate-spin-slow shadow-2xl"
                                style={{ animationDuration: '10s' }}>
                                {/* Start reusing VinylRatingInput visual by stripping interactive parts? 
                                    Or just place standard VinylRatingInput in readonly mode. 
                                    Let's manually recreate a cleaner SVG for the Card to accept scaling perfectly */}
                                <div className="w-full h-full transform scale-110">
                                    <VinylRatingInput value={rating} onChange={() => { }} readonly />
                                </div>
                            </div>

                            {/* The Album Cover (Sleeve) */}
                            <div className="absolute top-0 left-0 w-[95%] h-[95%] shadow-[0_10px_40px_rgba(0,0,0,0.7)] rounded-md overflow-hidden bg-black border border-white/10 z-20">
                                <img
                                    src={coverUrl}
                                    alt={albumName}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous" // Important for html2canvas
                                />
                                {/* Gloss overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                            </div>
                        </div>

                        {/* Album Details */}
                        <div className="flex flex-col gap-1 mb-6 text-center z-20">
                            <h1 className="text-3xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
                                {albumName}
                            </h1>
                            <p className="text-white/70 font-medium text-lg">{artistName}</p>
                        </div>

                        {/* Divider */}
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                        {/* Review Text */}
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-white/90 text-lg font-serif italic text-center leading-relaxed drop-shadow-sm px-2">
                                "{reviewText.length > 180 ? reviewText.substring(0, 180) + '...' : reviewText}"
                            </p>
                        </div>

                        {/* Footer Branding */}
                        <div className="mt-auto pt-8 flex justify-center items-center gap-2 opacity-50">
                            <span className="text-[10px] tracking-[0.3em] font-bold text-white uppercase">
                                REVIEWED ON SPINYL
                            </span>
                        </div>

                    </div>

                    {/* Watermark / Noise Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                </div>

                {/* Actions */}
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 transform"
                >
                    {isGenerating ? (
                        <span>Simulating Vinyl Press...</span>
                    ) : (
                        <>
                            <Download size={20} />
                            <span>Download Spinyl Card</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
