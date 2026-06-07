'use client';

import React, { useState } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import DefaultAvatar from '../../components/DefaultAvatar';

interface ComposerProps {
    onPost: (title: string, categoryTag: string) => void;
}

const CATEGORIES = [
    { name: 'Hot Take', label: 'Hot Take', color: '#ff8a65' },
    { name: 'Discussion', label: 'Discussion', color: '#4db6ac' },
    { name: 'Debate', label: 'Debate', color: '#ffb74d' },
    { name: 'Question', label: 'Question', color: '#64b5f6' }
];

export default function Composer({ onPost }: ComposerProps) {
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Discussion');
    const charLimit = 300;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        onPost(content.trim(), selectedCategory);
        setContent('');
    };

    const isNearLimit = content.length >= charLimit - 30;

    return (
        <div className="composer-container">
            <div className="composer-header">
                <div className="user-info">
                    <div className="avatar-wrapper">
                        <DefaultAvatar fill="#ffffff" />
                    </div>
                    <div>
                        <span className="username">You</span>
                        <span className="user-badge">Listener</span>
                    </div>
                </div>
                
                <div className="composer-meta">
                    <Sparkles size={14} color="#ffd54f" />
                    <span>Spin a new thread</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="composer-form">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, charLimit))}
                    placeholder="Drop a hot take, ask a question, or start a music debate..."
                    maxLength={charLimit}
                    rows={3}
                />

                <div className="composer-options">
                    <div className="category-select">
                        <span className="label">Category:</span>
                        <div className="categories-list">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.name}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                                    style={{
                                        '--accent-color': cat.color,
                                        borderColor: selectedCategory === cat.name ? cat.color : 'rgba(255, 255, 255, 0.08)'
                                    } as React.CSSProperties}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="footer-row">
                        <span className={`char-counter ${isNearLimit ? 'limit-warning' : ''}`}>
                            {content.length} / {charLimit}
                        </span>
                        
                        <button
                            type="submit"
                            disabled={!content.trim()}
                            className="submit-btn"
                        >
                            <MessageSquare size={16} />
                            <span>Post</span>
                        </button>
                    </div>
                </div>
            </form>

            <style jsx>{`
                .composer-container {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                }

                .composer-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .avatar-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 6px;
                }

                .username {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #fff;
                    display: block;
                }

                .user-badge {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.45);
                    font-weight: 600;
                }

                .composer-meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 600;
                }

                .composer-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                textarea {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: var(--md-shape-corner-medium);
                    resize: none;
                    color: #fff;
                    font-size: 1.05rem;
                    outline: none;
                    padding: 16px;
                    font-family: inherit;
                    line-height: 1.6;
                    transition: var(--transition-spring);
                }

                textarea:focus {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.25);
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
                }

                .composer-options {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .category-select {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .category-select .label {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .categories-list {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .category-btn {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                    padding: 6px 14px;
                    border-radius: var(--md-shape-corner-full);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .category-btn:hover {
                    color: var(--accent-color, #fff);
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--accent-color, rgba(255, 255, 255, 0.15));
                }

                .category-btn.active {
                    color: #000;
                    background: var(--accent-color, #fff);
                    font-weight: 700;
                }

                .footer-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 12px;
                }

                .char-counter {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 600;
                }

                .char-counter.limit-warning {
                    color: #ef5350;
                }

                .submit-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 10px 22px;
                    border-radius: var(--md-shape-corner-full);
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--transition-spring);
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
                }

                .submit-btn:disabled {
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.3);
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}
