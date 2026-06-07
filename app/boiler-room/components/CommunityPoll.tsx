'use client';

import React, { useState } from 'react';
import { Vote, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface PollOption {
    id: string;
    label: string;
    votes: number;
}

const INITIAL_OPTIONS: PollOption[] = [
    { id: 'opt-1', label: 'Rockstar', votes: 420 },
    { id: 'opt-2', label: 'Melodrama', votes: 280 },
    { id: 'opt-3', label: 'Guru', votes: 180 },
    { id: 'opt-4', label: 'Love Sick', votes: 120 }
];

export default function CommunityPoll() {
    const [options, setOptions] = useState<PollOption[]>(INITIAL_OPTIONS);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

    const handleVote = (optionId: string) => {
        if (selectedOptionId) return; // Prevent double voting

        setSelectedOptionId(optionId);
        setOptions((prevOptions) =>
            prevOptions.map((opt) =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            )
        );
    };

    const handleReset = () => {
        if (!selectedOptionId) return;
        const oldId = selectedOptionId;
        setSelectedOptionId(null);
        setOptions((prevOptions) =>
            prevOptions.map((opt) =>
                opt.id === oldId ? { ...opt, votes: opt.votes - 1 } : opt
            )
        );
    };

    return (
        <div className="community-poll-card">
            <div className="card-header">
                <Vote size={18} color="#4db6ac" />
                <h4>Community Poll</h4>
            </div>

            <div className="poll-content">
                <p className="poll-question">Album of the Week</p>

                <div className="options-container">
                    {options.map((opt) => {
                        const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                        const isSelected = selectedOptionId === opt.id;
                        const hasVoted = selectedOptionId !== null;

                        return (
                            <div key={opt.id} className="option-wrapper">
                                {!hasVoted ? (
                                    <button
                                        onClick={() => handleVote(opt.id)}
                                        className="vote-btn"
                                    >
                                        <div className="radio-circle" />
                                        <span className="option-label">{opt.label}</span>
                                    </button>
                                ) : (
                                    <div className={`result-row ${isSelected ? 'selected' : ''}`}>
                                        {/* Progress Bar background fill */}
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                            className="progress-bar-fill"
                                        />

                                        <div className="result-text-content">
                                            <div className="result-label-wrapper">
                                                {isSelected && <Check size={12} color="#000" className="check-icon" />}
                                                <span className="result-label">{opt.label}</span>
                                            </div>
                                            <div className="result-values">
                                                <span className="result-percentage">{percentage}%</span>
                                                <span className="result-votes">({opt.votes})</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedOptionId && (
                <div className="poll-footer">
                    <span className="total-votes-count">{totalVotes} votes total</span>
                    <button onClick={handleReset} className="change-vote-btn">
                        Change Vote
                    </button>
                </div>
            )}

            <style jsx>{`
                .community-poll-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    backdrop-filter: blur(12px);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .card-header h4 {
                    font-size: 1rem;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.01em;
                }

                .poll-content {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .poll-question {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.85);
                }

                .options-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .option-wrapper {
                    position: relative;
                    width: 100%;
                }

                .vote-btn {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: var(--md-shape-corner-large);
                    padding: 12px 16px;
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-align: left;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: var(--transition-spring);
                }

                .vote-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.15);
                    color: #fff;
                    transform: translateY(-1px);
                }

                .radio-circle {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    flex-shrink: 0;
                    transition: var(--transition);
                }

                .vote-btn:hover .radio-circle {
                    border-color: #fff;
                }

                .result-row {
                    position: relative;
                    width: 100%;
                    height: 44px;
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: var(--md-shape-corner-large);
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                }

                .result-row.selected {
                    border-color: rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.03);
                }

                .progress-bar-fill {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.08);
                    z-index: 0;
                }

                .result-row.selected .progress-bar-fill {
                    background: #fff;
                }

                .result-text-content {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 16px;
                }

                .result-label-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .check-icon {
                    background: #fff;
                    border-radius: 50%;
                    padding: 1px;
                }

                .result-label {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #fff;
                }

                .result-row.selected .result-label {
                    color: #000;
                }

                .result-values {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .result-percentage {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: #fff;
                }

                .result-row.selected .result-percentage {
                    color: #000;
                }

                .result-votes {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.4);
                }

                .result-row.selected .result-votes {
                    color: rgba(0, 0, 0, 0.5);
                }

                .poll-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.75rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 12px;
                }

                .total-votes-count {
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 600;
                }

                .change-vote-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-weight: 700;
                    font-family: inherit;
                    transition: var(--transition);
                }

                .change-vote-btn:hover {
                    color: #fff;
                }
            `}</style>
        </div>
    );
}
