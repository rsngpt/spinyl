'use client';

import React, { useState } from 'react';
import { Target, Send, ChevronRight } from 'lucide-react';
import DefaultAvatar from '../../components/DefaultAvatar';
import { motion, AnimatePresence } from 'framer-motion';

const PROMPTS = [
    {
        id: '1',
        text: 'Describe your favorite album in three words.',
        mockAnswers: [
            { id: 'a1', author: 'melancholy_boy', text: 'Depressing yet gorgeous.', timeAgo: '2h ago' },
            { id: 'a2', author: 'vinyl_collector', text: 'Pure analog heaven.', timeAgo: '5h ago' }
        ]
    },
    {
        id: '2',
        text: 'Which artist never missed?',
        mockAnswers: [
            { id: 'b1', author: 'kanye_stan', text: 'Frank Ocean, easily.', timeAgo: '1h ago' },
            { id: 'b2', author: 'beatlemania', text: 'The Beatles catalog is pristine.', timeAgo: '3h ago' }
        ]
    },
    {
        id: '3',
        text: 'What album changed your taste in music?',
        mockAnswers: [
            { id: 'c1', author: 'pink_floyd_fan', text: 'The Dark Side of the Moon.', timeAgo: '4h ago' },
            { id: 'c2', author: 'shoegaze_kid', text: 'Loveless by My Bloody Valentine.', timeAgo: '6h ago' }
        ]
    }
];

export default function DailyPrompt() {
    const [promptIndex, setPromptIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [customAnswers, setCustomAnswers] = useState<Record<string, { id: string; author: string; text: string; timeAgo: string }[]>>({});

    const currentPrompt = PROMPTS[promptIndex];
    const answersList = [
        ...(customAnswers[currentPrompt.id] || []),
        ...currentPrompt.mockAnswers
    ];

    const handleNext = () => {
        setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
        setAnswer('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim()) return;

        const newAnswerObj = {
            id: `user-${Date.now()}`,
            author: 'You',
            text: answer.trim(),
            timeAgo: 'Just now'
        };

        setCustomAnswers((prev) => ({
            ...prev,
            [currentPrompt.id]: [newAnswerObj, ...(prev[currentPrompt.id] || [])]
        }));
        setAnswer('');
    };

    return (
        <div className="daily-prompt-card">
            <div className="card-header">
                <div className="title-section">
                    <Target size={18} color="#ef5350" />
                    <h4>Daily Prompt</h4>
                </div>
                <button onClick={handleNext} className="next-btn" title="Next Prompt">
                    <span>Next</span>
                    <ChevronRight size={14} />
                </button>
            </div>

            <div className="prompt-display">
                <p className="prompt-text">"{currentPrompt.text}"</p>
            </div>

            <form onSubmit={handleSubmit} className="answer-form">
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Share your answer..."
                    maxLength={100}
                />
                <button type="submit" disabled={!answer.trim()} className="send-btn">
                    <Send size={12} />
                </button>
            </form>

            <div className="answers-feed">
                <span className="feed-header">Community Answers</span>
                <div className="answers-list">
                    <AnimatePresence initial={false}>
                        {answersList.map((ans) => (
                            <motion.div
                                key={ans.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="answer-item"
                            >
                                <div className="ans-avatar">
                                    <DefaultAvatar fill={ans.author === 'You' ? '#fff' : '#666'} />
                                </div>
                                <div className="ans-content">
                                    <div className="ans-meta">
                                        <span className="ans-author">{ans.author === 'You' ? 'You' : `@${ans.author}`}</span>
                                        <span className="ans-time">{ans.timeAgo}</span>
                                    </div>
                                    <p className="ans-text">{ans.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <style jsx>{`
                .daily-prompt-card {
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
                    justify-content: space-between;
                    align-items: center;
                }

                .title-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .title-section h4 {
                    font-size: 1rem;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.01em;
                }

                .next-btn {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.5);
                    padding: 4px 10px;
                    border-radius: var(--md-shape-corner-full);
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    transition: var(--transition);
                }

                .next-btn:hover {
                    background: rgba(255, 255, 255, 0.06);
                    color: #fff;
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .prompt-display {
                    background: linear-gradient(135deg, rgba(239, 83, 80, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%);
                    border: 1px solid rgba(239, 83, 80, 0.15);
                    border-radius: var(--md-shape-corner-large);
                    padding: 16px;
                    text-align: center;
                }

                .prompt-text {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #fff;
                    line-height: 1.4;
                    font-style: italic;
                }

                .answer-form {
                    display: flex;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: var(--md-shape-corner-medium);
                    padding: 4px 6px 4px 12px;
                    align-items: center;
                    transition: var(--transition);
                }

                .answer-form:focus-within {
                    border-color: rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.03);
                }

                .answer-form input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.85rem;
                    outline: none;
                    padding: 6px 0;
                    font-family: inherit;
                }

                .send-btn {
                    background: #fff;
                    color: #000;
                    border: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: var(--transition-spring);
                }

                .send-btn:hover:not(:disabled) {
                    transform: scale(1.08);
                }

                .send-btn:disabled {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.2);
                    cursor: not-allowed;
                }

                .answers-feed {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .feed-header {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .answers-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-height: 180px;
                    overflow-y: auto;
                    padding-right: 4px;
                }

                .answers-list::-webkit-scrollbar {
                    width: 4px;
                }
                .answers-list::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 2px;
                }

                .answer-item {
                    display: flex;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    border-radius: var(--md-shape-corner-medium);
                    padding: 8px 12px;
                }

                .ans-avatar {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3px;
                    margin-top: 2px;
                }

                .ans-content {
                    flex: 1;
                }

                .ans-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2px;
                }

                .ans-author {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.7);
                }

                .ans-time {
                    font-size: 0.65rem;
                    color: rgba(255, 255, 255, 0.35);
                }

                .ans-text {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.4;
                }
            `}</style>
        </div>
    );
}
