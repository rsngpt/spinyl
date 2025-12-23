'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} style={{ position: 'relative', width: '300px' }}>
            <input
                type="text"
                placeholder="Search albums..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px 16px',
                    paddingLeft: '40px', // Space for icon
                    borderRadius: '500px',
                    border: '1px solid transparent',
                    background: '#242424',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'background 0.2s, border-color 0.2s',
                }}
                onFocus={(e) => {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#fff';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.background = '#242424';
                    e.currentTarget.style.borderColor = 'transparent';
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
                }}
            >
                🔍
            </span>
        </form>
    );
}
