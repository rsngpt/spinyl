'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import SearchOverlay from './SearchOverlay';

export default function SearchBar({ user }: { user: any }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Overlay visibility logic
    // Visible if expanded and query exists? Or just if expanded?
    // User said "Start typing... whole page turned". So query needed.
    // Also "hover back to navbar away... collapse".
    // We'll trust onMouseLeave of the CONTAINER to handle closing.
    const showOverlay = isExpanded && query.length > 0;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            // If they hit enter, maybe go to a dedicated page? 
            // For now, let's just keep the overlay or maybe close it?
            // "Sort from the top boxes" implies the overlay IS the search page.
        }
    };

    return (
        // The container now wraps both Input AND Overlay to manage "Hover context"
        <div
            className="search-wrapper"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => {
                // Determine if we should close
                // If input has focus, maybe don't close immediately?
                // User said "hover back to navbar away from searchbox... collapse".
                // So if mouse leaves this wrapper, we collapse.
                if (document.activeElement !== inputRef.current) {
                    setIsExpanded(false);
                }
            }}
            style={{ position: 'relative' }} // For positioning context if needed, though overlay is fixed
        >
            <form
                onSubmit={handleSearch}
                className={`search-bar-container ${isExpanded || query ? 'expanded' : ''}`}
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={isExpanded ? "Search albums, songs, people..." : ""}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={(e) => {
                        // handled by wrapper mouseleave
                        e.currentTarget.style.background = '#242424';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onFocus={(e) => {
                        setIsExpanded(true);
                        e.currentTarget.style.background = '#2a2a2a';
                        e.currentTarget.style.borderColor = '#fff';
                    }}
                    style={{
                        width: '100%',
                        padding: '10px 16px',
                        paddingLeft: '40px', // Space for icon
                        borderRadius: '500px',
                        border: '1px solid transparent',
                        background: '#242424', // Default background
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        cursor: isExpanded ? 'text' : 'pointer',
                        opacity: isExpanded ? 1 : 0, // Hide text when collapsed
                    }}
                />
                <button
                    type="button"
                    onClick={() => {
                        if (!isExpanded) setIsExpanded(true);
                    }}
                    className="search-icon-btn"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translate(0, -50%)',
                        left: '12px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        transition: 'transform 0.3s ease'
                    }}
                >
                    <svg className="search-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B3B3B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.3s ease' }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
                <style jsx>{`
                    .search-bar-container {
                        background: rgba(255, 255, 255, 0.1); 
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        transition: all 0.3s ease;
                    }
                    .search-bar-container:hover {
                        transform: scale(1.02);
                    }
                    .search-bar-container:hover .search-svg {
                        stroke: var(--primary) !important;
                    }
                    .search-bar-container.expanded {
                        background: rgba(255, 255, 255, 0.15);
                    }
                 `}</style>
            </form>

            {/* Overlay is rendered here, but positioned Fixed via CSS */}
            <SearchOverlay
                query={query}
                isVisible={showOverlay}
                onClose={() => setIsExpanded(false)}
                user={user}
            />
        </div>
    );
}
