'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import SearchOverlay from './SearchOverlay';

export default function SearchBar({ user }: { user: any }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Overlay visibility logic
    const showOverlay = query.length > 0; // Keep overlay logic simple: if query exists, show it (as long as we are "interactive")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleIconClick = () => {
        setIsExpanded(true);
        // Force focus after expansion
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    };

    // Event Listener for External Triggers ("Start Exploring" button)
    useEffect(() => {
        const handleOpenSearch = () => {
            setIsExpanded(true);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        };

        window.addEventListener('spinyl:open-search', handleOpenSearch);
        return () => window.removeEventListener('spinyl:open-search', handleOpenSearch);
    }, []);

    return (
        <div
            className="search-wrapper"
            onMouseEnter={() => {
                // Desktop: Expand on Hover
                if (window.matchMedia('(min-width: 768px)').matches) {
                    setIsExpanded(true);
                }
            }}
            onMouseLeave={() => {
                // Desktop: Collapse on Leave (unless focused)
                if (document.activeElement !== inputRef.current && query.length === 0) {
                    setIsExpanded(false);
                }
            }}
            style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%' }}
        >
            <form
                onSubmit={handleSearch}
                className={`search-bar-container ${isExpanded || query ? 'expanded' : ''}`}
                // We use a CSS class for responsive width now instead of inline styles for width.
                style={{
                    position: 'relative',
                    height: '44px',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    borderRadius: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    // Background and Border managed by CSS to handle override
                    overflow: 'hidden'
                }}
            >
                <div
                    className="search-icon-wrapper"
                    onClick={handleIconClick}
                >
                    <svg className="search-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    placeholder="What do you want to listen to?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => {
                        setTimeout(() => {
                            if (query.length === 0) setIsExpanded(false);
                        }, 200);
                    }}
                    onFocus={() => {
                        setIsExpanded(true);
                    }}
                    className="search-input"
                />
            </form>

            <SearchOverlay
                query={query}
                isVisible={showOverlay && (isExpanded || query.length > 0)}
                onClose={() => {
                    setQuery('');
                    setIsExpanded(false);
                }}
                user={user}
            />

            <style jsx>{`
                /* Default State (Mobile & Desktop): Collapsed */
                .search-bar-container {
                    width: 44px;
                    background: transparent;
                    border: none;
                    max-width: 44px;
                }

                /* Expanded State (Triggered by React State via Hover/Click) */
                .search-bar-container.expanded {
                    width: 100%;
                    max-width: 500px; /* Max width for desktop aesthetics */
                    background: #242424;
                    border: 1px solid #333;
                }

                .search-icon-wrapper {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    cursor: pointer;
                }

                .search-input {
                    width: 100%;
                    height: 100%;
                    padding: 0 16px 0 48px;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 1rem;
                    outline: none;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                }

                .search-bar-container.expanded .search-input {
                    opacity: 1;
                    pointer-events: all;
                }

                /* Desktop Hover Polish */
                @media (min-width: 768px) {
                    .search-bar-container.expanded:hover {
                        background: #2a2a2a;
                        border-color: #444;
                    }
                    .search-bar-container.expanded:focus-within {
                         background: #2a2a2a;
                         border-color: #fff;
                    }
                }
            `}</style>
        </div>
    );
}
