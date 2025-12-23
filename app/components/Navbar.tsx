'use client';

import Link from 'next/link';
import LoginButton from './LoginButton';
import SearchBar from './SearchBar';

export default function Navbar() {
    return (
        <nav
            className="navbar-container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                // height and padding handled by class
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(12px)',
                zIndex: 1000,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >

            <div style={{ flex: 1 }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
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
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <LoginButton />
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <SearchBar />
            </div>
        </nav>
    );
}
