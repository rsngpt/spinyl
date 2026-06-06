'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchResult {
    id: string;
    name: string;
    image?: string;
    artist?: string;
    subtext?: string;
    type: 'album' | 'track' | 'artist' | 'user';
}

interface SearchOverlayProps {
    query?: string;
    isVisible: boolean;
    onClose: () => void;
    user: any;
}

export default function SearchOverlay({ query: propQuery, isVisible, onClose, user }: SearchOverlayProps) {
    const [internalQuery, setInternalQuery] = useState('');
    const query = propQuery !== undefined ? propQuery : internalQuery;
    const setQuery = propQuery !== undefined ? (_val: string) => {} : setInternalQuery;

    const inputRef = useRef<HTMLInputElement>(null);

    const [results, setResults] = useState<{
        albums: SearchResult[];
        tracks: SearchResult[];
        artists: SearchResult[];
        users: SearchResult[];
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'albums' | 'songs' | 'artists' | 'people'>('all');
    const router = useRouter();

    // Auto-focus when opened on desktop
    useEffect(() => {
        if (isVisible && propQuery === undefined) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isVisible, propQuery]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isVisible) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible]);

    const handleClose = () => {
        setInternalQuery('');
        onClose();
    };

    // Debounce Search
    useEffect(() => {
        if (!query || !isVisible) {
            setResults(null);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, isVisible]);

    if (!isVisible) return null;

    const sections = [
        { key: 'albums', label: 'Albums' },
        { key: 'tracks', label: 'Songs' },
        { key: 'artists', label: 'Artists' },
        { key: 'users', label: 'People' }
    ];

    const getFilteredResults = () => {
        if (!results) return [];
        if (activeTab === 'all') return []; // Handled separately
        // @ts-ignore
        return results[activeTab === 'songs' ? 'tracks' : activeTab === 'people' ? 'users' : activeTab] || [];
    };

    const handleItemClick = (item: SearchResult) => {
        let targetUrl = '';
        if (item.type === 'user') targetUrl = `/profile/${item.id}`;
        else if (item.type === 'album') targetUrl = `/album/${item.id}`;
        else if (item.type === 'track') targetUrl = `/track/${item.id}`;

        if (targetUrl) {
            window.dispatchEvent(new CustomEvent('spinyl:nav-start', { detail: { href: targetUrl } }));
            router.push(targetUrl);
        } else {
            console.log('Clicked', item);
        }
        handleClose();
    };

    return (
        <div
            className="search-overlay"
        >
            <div className="search-content">
                {/* Search Input for Desktop */}
                {propQuery === undefined && (
                    <div className="search-input-wrapper-desktop">
                        <Search className="search-icon-large" size={24} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search for albums, songs, artists, people..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="search-input-desktop"
                        />
                        {query.length > 0 ? (
                            <button className="clear-btn-desktop" onClick={() => setQuery('')} title="Clear search">
                                <X size={18} />
                            </button>
                        ) : (
                            <button className="close-btn-desktop" onClick={handleClose} title="Close search">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}
                {/* Tabs */}
                <div className="search-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </button>
                    {sections.map(s => (
                        <button
                            key={s.key}
                            className={`tab-btn ${activeTab === s.label.toLowerCase() ? 'active' : ''}`} // Simple match
                            onClick={() => setActiveTab(s.label.toLowerCase() as any)}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Auth Check for People Tab */}
                {activeTab === 'people' && !user ? (
                    <div className="auth-restriction">
                        <div className="lock-icon">🔒</div>
                        <h3>Login Required</h3>
                        <p>You should be logged in to search other users on Spinyl.</p>
                        <Link href="/login" className="login-btn">Log In</Link>
                    </div>
                ) : loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                    </div>
                ) : !results ? (
                    <div className="empty-state">Start typing to search...</div>
                ) : (
                    <div className="results-container">
                        {activeTab === 'all' ? (
                            sections.map(section => {
                                // @ts-ignore
                                const items = results[section.key === 'people' ? 'users' : section.key] || [];
                                // If People section and not logged in, maybe skip it in "All" view or show minimal?
                                // Let's skip it in "All" view if not logged in to be clean.
                                if (section.key === 'users' && !user) return null;

                                if (items.length === 0) return null;
                                return (
                                    <div key={section.key} className="result-section">
                                        <h3>{section.label}</h3>
                                        <div className="grid-row">
                                            {items.slice(0, 4).map((item: any) => (
                                                <div key={item.id} className="result-card" onClick={() => handleItemClick(item)}>
                                                    <div className="card-img">
                                                        {item.image ? <img src={item.image} alt={item.name} /> : <div className="placeholder" />}
                                                    </div>
                                                    <div className="card-info">
                                                        <p className="name">{item.name}</p>
                                                        <p className="sub">{item.artist || item.subtext || section.label.slice(0, -1)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="grid-full">
                                {getFilteredResults().map((item: any) => (
                                    <div key={item.id} className="result-card large" onClick={() => handleItemClick(item)}>
                                        <div className="card-img">
                                            {item.image ? <img src={item.image} alt={item.name} /> : <div className="placeholder" />}
                                        </div>
                                        <div className="card-info">
                                            <p className="name">{item.name}</p>
                                            <p className="sub">{item.artist || item.subtext}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                /* ... existing styles ... */
                .search-overlay {
                    position: fixed;
                    top: 70px; /* Below Navbar */
                    left: 0;
                    width: 100%;
                    height: calc(100vh - 70px);
                    background: rgba(19, 15, 13, 0.96);
                    backdrop-filter: blur(20px);
                    WebkitBackdropFilter: blur(20px);
                    z-index: 999;
                    overflow-y: auto;
                    padding: 40px;
                    animation: fadeIn 0.3s ease;
                }

                .search-input-wrapper-desktop {
                    display: flex;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 12px 18px;
                    gap: 14px;
                    margin-bottom: 32px;
                    transition: all 0.25s ease;
                }

                .search-input-wrapper-desktop:focus-within {
                    background: rgba(255, 255, 255, 0.07);
                    border-color: var(--md-sys-color-primary);
                    box-shadow: 0 0 15px rgba(255, 159, 104, 0.15);
                }

                .search-icon-large {
                    color: rgba(255, 255, 255, 0.45);
                }

                .search-input-desktop {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 1.15rem;
                    font-weight: 500;
                    outline: none;
                }

                .search-input-desktop::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .clear-btn-desktop, .close-btn-desktop {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.55);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .clear-btn-desktop:hover, .close-btn-desktop:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                }

                @media (max-width: 768px) {
                    .search-input-wrapper-desktop {
                        display: none !important;
                    }
                    .search-overlay {
                        top: 0;
                        height: 100vh;
                        padding: 20px;
                        padding-bottom: 140px; /* Space for floating search bar */
                        z-index: 1001; /* Above Navbar (1000) */
                    }
                    .search-tabs {
                        margin-top: 60px; /* Push down content below safe area/status bar if needed */
                        padding-bottom: 8px;
                        margin-bottom: 24px;
                    }
                    .tab-btn {
                        padding: 6px 12px;
                        font-size: 0.9rem;
                    }
                    .result-card.large {
                         /* Stack full width on mobile */
                         grid-column: span 1;
                    }
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .search-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .search-tabs {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 40px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 16px;
                }

                .tab-btn {
                    background: none;
                    border: none;
                    color: #888;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 8px 16px;
                    border-radius: 20px;
                    transition: all 0.2s;
                }

                .tab-btn.active {
                    background: #333;
                    color: #fff;
                }

                .tab-btn:hover {
                    color: #fff;
                }

                .result-section {
                    margin-bottom: 40px;
                }

                .result-section h3 {
                    margin-bottom: 20px;
                    font-size: 1.2rem;
                    color: #fff;
                }

                .grid-row, .grid-full {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 24px;
                }

                .result-card {
                    background: #181818;
                    padding: 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .result-card:hover {
                    background: #282828;
                }

                .card-img {
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: 4px;
                    overflow: hidden;
                    background: #333;
                }
                
                .card-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .name {
                    font-weight: 600;
                    color: #fff;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .sub {
                    font-size: 0.85rem;
                    color: #888;
                    margin: 0;
                }
                
                .spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: var(--primary);
                    animation: spin 1s linear infinite;
                    margin: 40px auto;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                /* Auth Restriction Styles */
                .auth-restriction {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    color: #fff;
                }
                .lock-icon {
                    font-size: 3rem;
                    margin-bottom: 24px;
                }
                .auth-restriction h3 {
                    font-size: 1.5rem;
                    margin-bottom: 12px;
                }
                .auth-restriction p {
                    color: #b3b3b3;
                    margin-bottom: 24px;
                }
                .login-btn {
                    padding: 12px 32px;
                    background: var(--primary);
                    color: #000;
                    font-weight: 700;
                    border-radius: 500px;
                    text-decoration: none;
                    transition: transform 0.2s;
                }
                .login-btn:hover {
                    transform: scale(1.05);
                    background: var(--primary-hover);
                }
            `}</style>
        </div>
    );
}
