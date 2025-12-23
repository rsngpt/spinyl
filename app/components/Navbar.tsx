'use client';

import Link from 'next/link';
import LoginButton from './LoginButton';
import SearchBar from './SearchBar';

export default function Navbar() {
    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
                backgroundColor: 'rgba(0, 0, 0, 0.85)', // Slightly darker for better contrast
                backdropFilter: 'blur(12px)',
                zIndex: 1000,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <Link href="/" style={{ textDecoration: 'none' }}>
                <h1
                    style={{
                        fontSize: '1.5rem',
                        color: 'var(--text-main)',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>💿</span> Spinyl
                </h1>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <SearchBar />
                <LoginButton />
            </div>
        </nav>
    );
}
