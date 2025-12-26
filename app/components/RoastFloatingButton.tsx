'use client';

import React, { useState } from 'react';
import { Flame, Lock } from 'lucide-react';
import RoastModal from '@/app/components/RoastModal';

interface RoastFloatingButtonProps {
    reviewsCount: number;
    userId: string;
}

export default function RoastFloatingButton({ reviewsCount, userId }: RoastFloatingButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const isEligible = reviewsCount >= 5;

    const handleClick = () => {
        if (isEligible) {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                className={`roast-fab ${!isEligible ? 'locked' : ''}`}
                aria-label={isEligible ? "Roast My Taste" : "Need 5 Reviews to Roast"}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Logic: 
                    - If Eligible: Always Flame
                    - If Locked: 
                        - Normal: Flame
                        - Hover: Lock 
                */}
                {!isEligible && isHovered ? (
                    <Lock size={28} fill="#fff" />
                ) : (
                    <Flame size={28} fill="#fff" strokeWidth={1.5} />
                )}

                <span className="roast-text">
                    {!isEligible && isHovered ? "Unlock at 5 Reviews" : "Roast My Taste"}
                </span>
            </button>

            {isEligible && (
                <RoastModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userId={userId}
                />
            )}

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
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 100;
                    overflow: hidden;
                    font-family: inherit;
                    min-width: 60px; /* Prevent total collapse */
                }

                .roast-fab:hover {
                    transform: scale(1.05) translateY(-2px);
                    box-shadow: 0 8px 30px rgba(255, 69, 0, 0.6);
                }

                .roast-fab:active {
                    transform: scale(0.95);
                }

                /* Locked State Styles */
                .roast-fab.locked {
                    background: linear-gradient(135deg, #444 0%, #666 100%);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                    opacity: 0.9;
                }
                
                .roast-fab.locked:hover {
                    cursor: not-allowed;
                    background: #333;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
                    transform: none; /* No bounce interaction */
                }

                /* Text is hidden on small screens, icon only */
                .roast-text {
                    font-size: 1.1rem;
                    font-weight: 700;
                    white-space: nowrap;
                    transition: opacity 0.2s;
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
                        border-radius: 50px; /* Keep pill shape for text if needed, or revert */
                    }
                    /* On mobile, we might want to show text if locked to explain why? 
                       Or keep generic behaviour. Responsive styling says hide text. 
                       If text is hidden, user just sees lock icon on tap/hover which is fine.
                    */
                    .roast-text {
                        display: none;
                    }
                    
                    /* If locked and hovered on mobile, maybe show a toast? 
                       For now, standard CSS handles icon swap */
                }
            `}</style>
        </>
    );
}
