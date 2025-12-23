'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            // Optional: collapse on search?
            // setIsExpanded(false); 
        }
    };

    return (
        <form
            onSubmit={handleSearch}
            className={`search-bar-container ${isExpanded || query ? 'expanded' : ''}`}
        >
            <input
                type="text"
                placeholder={isExpanded ? "Search albums..." : ""}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={(e) => {
                    setIsExpanded(true);
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#fff';
                }}
                onBlur={(e) => {
                    if (!query) setIsExpanded(false);
                    e.currentTarget.style.background = '#242424';
                    e.currentTarget.style.borderColor = 'transparent';
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
                }}
            />
            <span
                style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.2rem',
                    color: '#B3B3B3',
                    pointerEvents: 'none',
                    transition: 'color 0.3s',
                }}
            >
                🔍
            </span>
        </form>
    );
}
