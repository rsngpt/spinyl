'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Lock } from 'lucide-react';
import { getBrowserClient } from '@/src/lib/supabase-client';

interface SearchResult {
    id: string;
    name: string;
    image?: string;
    artist?: string;
    subtext?: string;
    type: 'album' | 'track' | 'artist' | 'user';
}

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [user, setUser] = useState<any>(null);
    const [results, setResults] = useState<{
        albums: SearchResult[];
        tracks: SearchResult[];
        artists: SearchResult[];
        users: SearchResult[];
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'albums' | 'songs' | 'artists' | 'people'>('all');
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch user session on load
    useEffect(() => {
        const supabase = getBrowserClient()!;
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    // Sync URL when query changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (query) {
            params.set('q', query);
        } else {
            params.delete('q');
        }
        const newUrl = `${pathname}?${params.toString()}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }, [query, pathname]);

    // Fetch search results on query change
    useEffect(() => {
        if (!query) {
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
    }, [query]);

    // Auto-focus search input on page mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sections = [
        { key: 'albums', label: 'Albums' },
        { key: 'tracks', label: 'Songs' },
        { key: 'artists', label: 'Artists' },
        { key: 'users', label: 'People' }
    ];

    const getFilteredResults = () => {
        if (!results) return [];
        if (activeTab === 'all') return [];
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
        }
    };

    return (
        <main className="search-page-container">
            <div className="live-gradient-bg" />

            <div className="search-page-content">
                <h1 className="search-title">Search</h1>

                {/* Modern Large Search Bar Input */}
                <div className="search-input-wrapper">
                    <Search className="search-icon-large" size={24} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for albums, songs, artists, people..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="search-input-field"
                    />
                    {query.length > 0 && (
                        <button className="clear-btn" onClick={() => setQuery('')} title="Clear search">
                            <X size={20} />
                        </button>
                    )}
                </div>

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
                            className={`tab-btn ${activeTab === s.label.toLowerCase() ? 'active' : ''}`}
                            onClick={() => setActiveTab(s.label.toLowerCase() as any)}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Results Section */}
                <div className="results-container">
                    {activeTab === 'people' && !user ? (
                        <div className="auth-restriction">
                            <Lock className="lock-icon" size={40} />
                            <h3>Login Required</h3>
                            <p>You should be logged in to search other users on Spinyl.</p>
                            <Link href="/login" className="login-btn">Log In</Link>
                        </div>
                    ) : loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                        </div>
                    ) : !query ? (
                        <div className="empty-state">Start typing to search...</div>
                    ) : results && (
                        <>
                            {activeTab === 'all' ? (
                                sections.map(section => {
                                    // @ts-ignore
                                    const items = results[section.key === 'people' ? 'users' : section.key] || [];
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
                            
                            {/* No results fallback */}
                            {results.albums.length === 0 && results.tracks.length === 0 && results.artists.length === 0 && (!user || results.users.length === 0) && (
                                <div className="empty-state">No results found for "{query}".</div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                .search-page-container {
                    min-height: 100vh;
                    padding-bottom: 120px;
                    color: #fff;
                    position: relative;
                }

                .search-page-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 120px 24px 40px;
                }

                .search-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 32px;
                    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .search-input-wrapper {
                    display: flex;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    padding: 14px 22px;
                    gap: 16px;
                    margin-bottom: 40px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .search-input-wrapper:focus-within {
                    background: rgba(255, 255, 255, 0.07);
                    border-color: var(--md-sys-color-primary);
                    box-shadow: 0 0 20px rgba(255, 159, 104, 0.15);
                }

                .search-icon-large {
                    color: rgba(255, 255, 255, 0.45);
                }

                .search-input-field {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 1.25rem;
                    font-weight: 500;
                    outline: none;
                }

                .search-input-field::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .clear-btn {
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

                .clear-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                }

                .search-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 40px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    padding-bottom: 16px;
                }

                .tab-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 8px 18px;
                    border-radius: 20px;
                    transition: all 0.2s;
                }

                .tab-btn.active {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                }

                .tab-btn:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.04);
                }

                .result-section {
                    margin-bottom: 48px;
                }

                .result-section h3 {
                    margin-bottom: 24px;
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.9);
                }

                .grid-row, .grid-full {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 24px;
                }

                .result-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    padding: 16px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .result-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.08);
                    transform: translateY(-2px);
                }

                .card-img {
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #242424;
                }

                .card-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .placeholder {
                    width: 100%;
                    height: 100%;
                    background: #242424;
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
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                }

                .spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    border-top-color: var(--md-sys-color-primary);
                    animation: spin 1s linear infinite;
                    margin: 80px auto;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .empty-state {
                    font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.4);
                    text-align: center;
                    margin: 80px 0;
                }

                .auth-restriction {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 24px;
                    text-align: center;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: 16px;
                }

                .lock-icon {
                    color: var(--md-sys-color-primary);
                    margin-bottom: 20px;
                }

                .auth-restriction h3 {
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin-bottom: 12px;
                }

                .auth-restriction p {
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 28px;
                    max-width: 380px;
                }

                .login-btn {
                    padding: 10px 28px;
                    background: #fff;
                    color: #000;
                    font-weight: 700;
                    border-radius: 20px;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .login-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.25);
                }
            `}</style>
        </main>
    );
}
