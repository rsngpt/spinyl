'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface ClubSearchProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function ClubSearch({ searchQuery, setSearchQuery }: ClubSearchProps) {
    return (
        <div className="search-container">
            <div className="search-bar-wrapper">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search music clubs (e.g. Indie, Hip-Hop, Vinyl...)"
                    maxLength={100}
                />
            </div>

            <style jsx>{`
                .search-container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .search-bar-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 12px 20px;
                    transition: var(--transition-spring);
                }

                .search-bar-wrapper:focus-within {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.25);
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
                }

                .search-icon {
                    color: rgba(255, 255, 255, 0.4);
                    flex-shrink: 0;
                    transition: var(--transition);
                }

                .search-bar-wrapper:focus-within .search-icon {
                    color: #fff;
                }

                input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 1rem;
                    font-weight: 600;
                    outline: none;
                    font-family: inherit;
                }

                input::placeholder {
                    color: rgba(255, 255, 255, 0.35);
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}
