'use client';

import React, { useState, useEffect } from 'react';
import BoilerRoomSidebar from './BoilerRoomSidebar';
import { getBrowserClient } from '@/src/lib/supabase-client';
import { createClient } from '@supabase/supabase-js';
import { createBoilerRoom, deleteBoilerRoom } from '@/app/actions/boiler-room';
import { Image as ImageIcon, Music, Plus, Radio, Trash2 } from 'lucide-react';

interface BoilerRoomPost {
    id: string;
    content: string;
    coverImage: string | null;
    createdAt: string;
    userId: string;
    author: string;
    avatarUrl: string | null;
}

// Memory-only public client to prevent client-side hydration deadlocks
const publicClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            persistSession: false
        }
    }
);

export default function BoilerRoomClient() {
    const supabase = getBrowserClient()!;
    const [activeTab, setActiveTab] = useState<'listening-room' | 'clubs'>('listening-room');
    const [posts, setPosts] = useState<BoilerRoomPost[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form states
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);

    // Fetch current user via onAuthStateChange + non-blocking getUser to avoid deadlocks
    useEffect(() => {
        let isMounted = true;
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;
            if (session?.user) {
                setCurrentUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
            }
        });

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (isMounted && user) {
                setCurrentUser(user);
            }
        }).catch((e) => {
            console.warn("Non-blocking user fetch catch:", e);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    const fetchPosts = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const { data, error } = await publicClient
                .from('boiler_rooms')
                .select(`
                    id,
                    content,
                    cover_image,
                    created_at,
                    user_id,
                    profiles ( username, avatar_url )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching boiler rooms:', error.message);
                setFetchError(error.message);
            } else if (data) {
                setPosts(data.map((p: any) => ({
                    id: p.id,
                    content: p.content,
                    coverImage: p.cover_image,
                    createdAt: new Date(p.created_at).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }) + ' · ' + new Date(p.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                    }),
                    userId: p.user_id,
                    author: p.profiles?.username || 'Anonymous',
                    avatarUrl: p.profiles?.avatar_url || null
                })));
            }
        } catch (err: any) {
            console.error('Exception in fetchPosts:', err);
            setFetchError(err.message || 'An unexpected error occurred while fetching posts.');
        } finally {
            setIsLoading(false);
        }
    };

    // Subscriptions and initial fetch using publicClient
    useEffect(() => {
        fetchPosts();

        const channel = publicClient
            .channel('public:boiler_rooms')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'boiler_rooms'
            }, () => {
                fetchPosts();
            })
            .subscribe();

        return () => {
            publicClient.removeChannel(channel);
        };
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        if (!currentUser) {
            alert('You must be logged in to create a boiler room.');
            return;
        }

        setIsPosting(true);
        const res = await createBoilerRoom(content, coverImage);
        setIsPosting(false);

        if (!res.success) {
            alert(`Error creating boiler room: ${res.error}`);
        } else {
            setContent('');
            setCoverImage(null);
            setActiveTab('listening-room'); // Navigate back to "Your Boiler Room"
            fetchPosts();
        }
    };

    const handleDelete = async (id: string, postUserId: string) => {
        if (!currentUser || currentUser.id !== postUserId) {
            alert('You can only delete your own boiler rooms.');
            return;
        }

        if (confirm('Are you sure you want to delete this boiler room?')) {
            const res = await deleteBoilerRoom(id);
            if (!res.success) {
                alert(`Error deleting boiler room: ${res.error}`);
            } else {
                fetchPosts();
            }
        }
    };

    return (
        <main className="boiler-room-page">
            {/* Animated Ambient background */}
            <div className="live-gradient-bg" />

            <div className="content-container">
                <div className="boiler-room-grid">
                    {/* Sticky Sidebar */}
                    <div className="sidebar-col">
                        <BoilerRoomSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>

                    {/* Main Content Area (Middle Section) */}
                    <div className="content-col">
                        {activeTab === 'listening-room' ? (
                            isLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
                                    <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>loading boiler rooms...</span>
                                    <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
                                </div>
                            ) : fetchError ? (
                                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ color: '#ef4444', marginBottom: '16px' }}>Failed to load boiler rooms: {fetchError}</p>
                                    <button onClick={fetchPosts} style={{ padding: '8px 16px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Retry
                                    </button>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon-wrapper">
                                        <Radio size={40} className="pulse-icon" />
                                    </div>
                                    <h3>no boiler rooms present</h3>
                                    <p>Create a boiler room to share what you're spinning right now.</p>
                                    <button className="create-btn-empty" onClick={() => setActiveTab('clubs')}>
                                        <Plus size={16} />
                                        <span>Create a Boiler Room</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="posts-grid">
                                    {posts.map((post) => (
                                        <div key={post.id} className="post-card">
                                            <div className="post-author-bar">
                                                <div className="post-avatar-container">
                                                    {post.avatarUrl ? (
                                                        <img src={post.avatarUrl} alt="Avatar" className="post-avatar-img" />
                                                    ) : (
                                                        <div className="post-avatar-fallback">{post.author[0]?.toUpperCase()}</div>
                                                    )}
                                                </div>
                                                <span className="post-author-name">{post.author}</span>
                                            </div>

                                            {post.coverImage ? (
                                                <div className="post-cover-wrapper">
                                                    <img src={post.coverImage} alt="Cover" className="post-cover" />
                                                    <div className="post-cover-overlay" />
                                                </div>
                                            ) : (
                                                <div className="post-cover-fallback">
                                                    <Music size={36} />
                                                </div>
                                            )}

                                            <div className="post-content-section">
                                                <p className="post-text">{post.content}</p>
                                                <div className="post-meta">
                                                    <span className="post-time">{post.createdAt}</span>
                                                    {currentUser && currentUser.id === post.userId && (
                                                        <button 
                                                            className="delete-btn" 
                                                            title="Delete Room" 
                                                            onClick={() => handleDelete(post.id, post.userId)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="create-form-container">
                                <h2>Create a Boiler Room</h2>
                                <p className="form-subtitle">Design your listening space. Let the community know what's spinning.</p>
                                
                                <form onSubmit={handleSubmit} className="boiler-form">
                                    <div className="form-group">
                                        <label>What's on your mind?</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Write a description, share your current tracks, or vibe check..."
                                            maxLength={500}
                                            required
                                        />
                                        <span className="char-count">{content.length}/500</span>
                                    </div>

                                    <div className="form-group">
                                        <label>Cover Image</label>
                                        <div className="image-uploader-wrapper">
                                            {coverImage ? (
                                                <div className="preview-container">
                                                    <img src={coverImage} alt="Preview" className="image-preview" />
                                                    <button type="button" className="remove-image-btn" onClick={() => setCoverImage(null)}>
                                                        <Trash2 size={15} />
                                                        <span>Change Cover</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="upload-dropzone">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <ImageIcon size={28} className="upload-icon" />
                                                    <span className="upload-text">Upload Cover Artwork</span>
                                                    <span className="upload-hint">Drag & drop or browse your local files</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <button type="submit" className="submit-form-btn" disabled={isPosting}>
                                        <Plus size={18} />
                                        <span>{isPosting ? 'Posting...' : 'Post Boiler Room'}</span>
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .boiler-room-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    padding-top: 80px;
                    background-color: #000;
                    color: #fff;
                }

                .content-container {
                    flex: 1;
                    z-index: 1;
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 32px 24px 80px;
                }

                .boiler-room-grid {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 40px;
                    align-items: start;
                }

                .sidebar-col {
                    position: sticky;
                    top: 100px;
                }

                .content-col {
                    min-width: 0;
                }

                /* Empty State Premium Styling */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 80px 24px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                    border-radius: var(--md-shape-corner-extra-large);
                    backdrop-filter: blur(12px);
                }

                .empty-icon-wrapper {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: rgba(139, 92, 246, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: #fff;
                    margin-bottom: 12px;
                    text-transform: lowercase;
                }

                .empty-state p {
                    font-size: 0.95rem;
                    color: rgba(255, 255, 255, 0.5);
                    max-width: 380px;
                    margin-bottom: 28px;
                    line-height: 1.5;
                }

                .create-btn-empty {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                    color: #fff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: var(--md-shape-corner-large);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.25);
                }

                .create-btn-empty:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 24px rgba(139, 92, 246, 0.4);
                }

                /* Author Bar styling */
                .post-author-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    background: rgba(255, 255, 255, 0.01);
                }

                .post-avatar-container {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                }

                .post-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .post-avatar-fallback {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.8);
                }

                .post-author-name {
                    font-size: 0.92rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.85);
                }

                /* Grid of posted Boiler Rooms */
                .posts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }

                .post-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: var(--md-shape-corner-extra-large);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s;
                    backdrop-filter: blur(12px);
                }

                .post-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15);
                }

                .post-cover-wrapper {
                    position: relative;
                    width: 100%;
                    padding-top: 60%;
                    overflow: hidden;
                    background: #111;
                }

                .post-cover {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s;
                }

                .post-card:hover .post-cover {
                    transform: scale(1.05);
                }

                .post-cover-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4) 100%);
                }

                .post-cover-fallback {
                    width: 100%;
                    height: 140px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.25);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .post-content-section {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    justify-content: space-between;
                    gap: 16px;
                }

                .post-text {
                    font-size: 0.95rem;
                    color: rgba(255, 255, 255, 0.95);
                    line-height: 1.5;
                    word-wrap: break-word;
                    font-weight: 500;
                }

                .post-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 14px;
                }

                .post-time {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 500;
                }

                .delete-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s, color 0.2s;
                }

                .delete-btn:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                /* Create Form Container Premium Styling */
                .create-form-container {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 40px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                    max-width: 680px;
                    margin: 0 auto;
                }

                .create-form-container h2 {
                    font-size: 1.8rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    margin-bottom: 8px;
                    background: linear-gradient(90deg, #fff 0%, #aaa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .form-subtitle {
                    font-size: 0.92rem;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 32px;
                    line-height: 1.5;
                }

                .boiler-form {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    position: relative;
                }

                .form-group label {
                    font-size: 0.88rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: rgba(255, 255, 255, 0.85);
                }

                .form-group textarea {
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--md-shape-corner-large);
                    color: #fff;
                    padding: 16px;
                    font-size: 0.98rem;
                    min-height: 120px;
                    resize: vertical;
                    font-family: inherit;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .form-group textarea:focus {
                    outline: none;
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
                }

                .char-count {
                    align-self: flex-end;
                    font-size: 0.78rem;
                    color: rgba(255, 255, 255, 0.3);
                    font-weight: 500;
                    margin-top: 4px;
                }

                .image-uploader-wrapper {
                    position: relative;
                    width: 100%;
                }

                .upload-dropzone {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 36px 20px;
                    border: 2px dashed rgba(255, 255, 255, 0.12);
                    border-radius: var(--md-shape-corner-large);
                    cursor: pointer;
                    background: rgba(255, 255, 255, 0.01);
                    transition: border-color 0.2s, background-color 0.2s;
                }

                .upload-dropzone:hover {
                    border-color: #8b5cf6;
                    background: rgba(139, 92, 246, 0.02);
                }

                .upload-icon {
                    color: rgba(255, 255, 255, 0.35);
                    margin-bottom: 12px;
                    transition: color 0.2s;
                }

                .upload-dropzone:hover .upload-icon {
                    color: #8b5cf6;
                }

                .upload-text {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 4px;
                }

                .upload-hint {
                    font-size: 0.78rem;
                    color: rgba(255, 255, 255, 0.35);
                }

                .preview-container {
                    position: relative;
                    border-radius: var(--md-shape-corner-large);
                    overflow: hidden;
                    width: 100%;
                    max-height: 240px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #111;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .image-preview {
                    width: 100%;
                    max-height: 240px;
                    object-fit: cover;
                }

                .remove-image-btn {
                    position: absolute;
                    bottom: 16px;
                    right: 16px;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #fff;
                    padding: 8px 14px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: background-color 0.2s, transform 0.2s;
                }

                .remove-image-btn:hover {
                    background: rgba(239, 68, 68, 0.85);
                    transform: translateY(-1px);
                }

                .submit-form-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                    color: #fff;
                    border: none;
                    padding: 14px 28px;
                    border-radius: var(--md-shape-corner-large);
                    font-size: 0.98rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 12px;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.25);
                }

                .submit-form-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 24px rgba(139, 92, 246, 0.4);
                }

                .submit-form-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @keyframes pulse {
                    0% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 1;
                        color: #8b5cf6;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                }

                :global(.pulse-icon) {
                    animation: pulse 2.5s infinite ease-in-out;
                }

                @media (max-width: 768px) {
                    .content-container {
                        padding: 16px 16px 100px;
                    }

                    .boiler-room-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }

                    .sidebar-col {
                        position: relative;
                        top: 0;
                    }

                    .create-form-container {
                        padding: 24px;
                    }
                }
            `}</style>
        </main>
    );
}
