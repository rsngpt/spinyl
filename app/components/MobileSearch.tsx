'use client';

import { useState, useEffect, useRef } from 'react';
import SearchOverlay from './SearchOverlay';
import { X, Search } from 'lucide-react';

interface MobileSearchProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function MobileSearch({ isOpen, onClose, user }: MobileSearchProps) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus when opened
    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure render
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* The Overlay - Full Screen (handled by SearchOverlay CSS overrides + props) */}
            {/* We pass isVisible=true because if MobileSearch is open, we want the overlay logic active if query exists, 
                BUT user might want to see overlay immediately or just suggestions. 
                SearchOverlay usually waits for query > 0. 
                Let's check SearchOverlay logic: "if (!isVisible) return null;" and "if (!query || !isVisible) { setResults(null); }"
                So we need to make sure SearchOverlay handles "no query" state gracefully if we want valid visuals, 
                but standard behavior is "type to search".
             */}
            <SearchOverlay
                query={query}
                isVisible={isOpen}
                onClose={onClose}
                user={user}
            />

            {/* The Floating Input Bar */}
            <div className="mobile-search-bar-container">
                <div className="input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="What do you want to listen to?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="search-input"
                    />
                    {query.length > 0 ? (
                        <button onClick={() => setQuery('')} className="clear-btn">
                            <X size={18} />
                        </button>
                    ) : (
                        <button onClick={onClose} className="close-btn">
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .mobile-search-bar-container {
                    position: fixed;
                    bottom: 80px; /* Above the bottom nav (approx 70px + safe area) */
                    left: 0;
                    right: 0;
                    padding: 12px 16px;
                    z-index: 1002; /* Above Navbar (1000) and potentially Overlay (999) */
                    background: transparent; /* Overlay provides background, or we add gradient? */
                    /* Actually, if Overlay is full screen, this sits ON TOP of it. */
                }

                .input-wrapper {
                    display: flex;
                    align-items: center;
                    background: #242424;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 12px 16px;
                    gap: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }

                .search-icon {
                    color: #888;
                }

                .search-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 16px; /* 16px prevents iOS zoom on focus */
                    outline: none;
                }

                .search-input::placeholder {
                    color: #666;
                }

                .clear-btn, .close-btn {
                    background: transparent;
                    border: none;
                    color: #888;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                }

                .close-btn {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #fff;
                }
            `}</style>
        </>
    );
}
