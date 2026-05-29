'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import SearchOverlay from './SearchOverlay';
import { Search } from 'lucide-react';

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
            className={`search-wrapper ${isExpanded || query ? 'expanded' : ''}`}
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
            style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}
        >
            <form
                onSubmit={handleSearch}
                className={`search-bar-container ${isExpanded || query ? 'expanded' : ''}`}
                style={{
                    position: 'relative',
                    height: '38px',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    borderRadius: '19px',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden'
                }}
            >
                <div
                    className="search-icon-wrapper"
                    onClick={handleIconClick}
                >
                    <Search size={18} />
                    <span className="search-label">Search</span>
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
                .search-wrapper {
                    position: relative;
                    display: flex;
                    justify-content: flex-end;
                    width: 110px;
                    max-width: 110px;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .search-wrapper.expanded {
                    flex: 1;
                    width: 100%;
                    max-width: 600px;
                }

                /* Default State (Mobile & Desktop): Collapsed and Styled like Action/Nav link */
                .search-bar-container {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.7);
                    max-width: 100%;
                    cursor: pointer;
                }

                .search-bar-container:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    border-color: rgba(255, 255, 255, 0.15);
                }

                /* Expanded State (Triggered by React State via Hover/Click) */
                .search-bar-container.expanded {
                    width: 100%;
                    max-width: 100%; /* Grow to fill parent */
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #fff;
                    cursor: default;
                }

                .search-icon-wrapper {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    padding-left: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    z-index: 2;
                    cursor: pointer;
                    height: 100%;
                }

                .search-label {
                    font-size: 0.92rem;
                    font-weight: 600;
                    opacity: 1;
                    transition: opacity 0.2s ease, width 0.2s ease;
                    white-space: nowrap;
                }

                .search-bar-container.expanded .search-label {
                    opacity: 0;
                    width: 0;
                    pointer-events: none;
                    margin: 0;
                    overflow: hidden;
                }

                .search-input {
                    width: 100%;
                    height: 100%;
                    padding: 0 16px 0 44px; /* Space for search icon on left */
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.92rem;
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
                        background: rgba(255, 255, 255, 0.08);
                        border-color: rgba(255, 255, 255, 0.25);
                    }
                    .search-bar-container.expanded:focus-within {
                         background: rgba(255, 255, 255, 0.08);
                         border-color: var(--md-sys-color-primary);
                    }
                }
            `}</style>
        </div>
    );
}
