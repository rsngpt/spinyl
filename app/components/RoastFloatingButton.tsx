'use client';

import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import RoastModal from './RoastModal';

interface RoastFloatingButtonProps {
    reviewsCount: number;
    userId: string;
}

export default function RoastFloatingButton({ reviewsCount, userId }: RoastFloatingButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial simple logic: If < 5 reviews, we don't even show the button (or we show it disabled)
    // For now, let's show it but disabled with a tooltip if count < 5
    const isEligible = reviewsCount >= 5;

    if (!isEligible) {
        // Option: Don't render at all if not eligible to keep UI clean
        // Or render a greyed out one. Let's render nothing for now to avoid clutter, 
        // as per "happen after 5 reviews only" request.
        return null;
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="roast-fab"
                aria-label="Roast My Taste"
            >
                <Flame size={28} fill="#fff" strokeWidth={1.5} />
                <span className="roast-text">Roast My Taste</span>
            </button>

            <RoastModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={userId}
            />

            <style jsx>{`
                .roast-fab {
                    position: fixed;
                    bottom: 40px;
                    right: 40px;
                    background: linear-gradient(135deg, #FF4500 0%, #FF8C00 100%);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    padding: 16px 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(255, 69, 0, 0.4);
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
                    z-index: 100;
                    overflow: hidden;
                    font-family: inherit;
                }

                .roast-fab:hover {
                    transform: scale(1.05) translateY(-2px);
                    box-shadow: 0 8px 30px rgba(255, 69, 0, 0.6);
                }

                .roast-fab:active {
                    transform: scale(0.95);
                }

                /* Text is hidden on small screens, icon only */
                .roast-text {
                    font-size: 1.1rem;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .roast-fab::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.2),
                        transparent
                    );
                    transform: skewX(-20deg);
                    animation: shine 3s infinite;
                }

                @keyframes shine {
                    0% { left: -100%; }
                    20% { left: 200%; }
                    100% { left: 200%; }
                }

                @media (max-width: 768px) {
                    .roast-fab {
                        bottom: 20px;
                        right: 20px;
                        padding: 16px;
                        border-radius: 50%;
                    }
                    .roast-text {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}
