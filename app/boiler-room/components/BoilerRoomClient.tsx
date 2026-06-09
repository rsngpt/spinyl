'use client';

import React, { useState, useEffect } from 'react';
import BoilerRoomSidebar from './BoilerRoomSidebar';
import { getBrowserClient } from '@/src/lib/supabase-client';
import { createClient } from '@supabase/supabase-js';
import { 
    createBoilerRoom, 
    deleteBoilerRoom,
    addBoilerRoomComment,
    getBoilerRoomComments,
    deleteBoilerRoomComment,
    editBoilerRoomComment,
    toggleBoilerRoomSubscription,
    checkBoilerRoomSubscription,
    getCurrentUserProfile,
    toggleBoilerRoomCommentLike
} from '@/app/actions/boiler-room';
import { Image as ImageIcon, Music, Plus, Radio, Trash2, MessageSquare, Share2, Bell, X, Heart } from 'lucide-react';
import ThreadedComments from './ThreadedComments';

interface BoilerRoomPost {
    id: string;
    content: string;
    coverImage: string | null;
    createdAt: string;
    timeAgo: string;
    userId: string;
    author: string;
    avatarUrl: string | null;
}

function getFriendlyRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
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

    // Comment popup/drawer states
    const [selectedPost, setSelectedPost] = useState<BoilerRoomPost | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<{ username: string; avatar_url: string | null } | null>(null);

    const handleOpenComments = async (post: BoilerRoomPost) => {
        setSelectedPost(post);
        setLoadingComments(true);
        
        // Update browser URL query param without full page reload
        const newUrl = `${window.location.pathname}?post=${post.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        try {
            const commentsData = await getBoilerRoomComments(post.id);
            setComments(commentsData);
            
            const subRes = await checkBoilerRoomSubscription(post.id);
            setIsSubscribed(subRes.subscribed);
        } catch (err) {
            console.error("Error loading comments:", err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleCloseComments = () => {
        setSelectedPost(null);
        setComments([]);
        
        // Clear query param
        const newUrl = window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
    };

    // Auto-open comment modal from query parameter or popstate
    useEffect(() => {
        if (posts.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const postId = params.get('post');
            if (postId) {
                const matchedPost = posts.find(p => p.id === postId);
                if (matchedPost) {
                    handleOpenComments(matchedPost);
                }
            }
        }
    }, [posts]);

    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const postId = params.get('post');
            if (postId && posts.length > 0) {
                const matchedPost = posts.find(p => p.id === postId);
                if (matchedPost) {
                    setSelectedPost(matchedPost);
                    getBoilerRoomComments(postId).then(setComments);
                    checkBoilerRoomSubscription(postId).then(res => setIsSubscribed(res.subscribed));
                }
            } else {
                setSelectedPost(null);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [posts]);

    const handleAddComment = async (contentStr: string, parentId: string | null) => {
        if (!selectedPost) return;
        const res = await addBoilerRoomComment(selectedPost.id, contentStr, parentId);
        if (res.success && res.comment) {
            const commentsData = await getBoilerRoomComments(selectedPost.id);
            setComments(commentsData);
        } else {
            alert(res.error || 'Failed to add comment');
        }
    };

    const handleEditComment = async (commentId: string, contentStr: string) => {
        if (!selectedPost) return;
        const res = await editBoilerRoomComment(commentId, contentStr);
        if (res.success) {
            const commentsData = await getBoilerRoomComments(selectedPost.id);
            setComments(commentsData);
        } else {
            alert(res.error || 'Failed to edit comment');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!selectedPost) return;
        const res = await deleteBoilerRoomComment(commentId);
        if (res.success) {
            const commentsData = await getBoilerRoomComments(selectedPost.id);
            setComments(commentsData);
        } else {
            alert(res.error || 'Failed to delete comment');
        }
    };

    const handleLikeComment = async (commentId: string) => {
        if (!selectedPost) return;
        const res = await toggleBoilerRoomCommentLike(commentId);
        if (res.success) {
            const commentsData = await getBoilerRoomComments(selectedPost.id);
            setComments(commentsData);
        } else {
            console.error('Failed to toggle comment like:', res.error);
        }
    };

    const handleToggleSubscription = async () => {
        if (!selectedPost) return;
        if (!currentUser) {
            alert('You must be logged in to subscribe.');
            return;
        }
        const res = await toggleBoilerRoomSubscription(selectedPost.id);
        if (res.success) {
            setIsSubscribed(res.subscribed || false);
            showToast(res.subscribed ? 'Notifications turned on for this post!' : 'Notifications turned off.');
        } else {
            alert(res.error || 'Failed to update subscription');
        }
    };

    const handleSharePost = () => {
        if (!selectedPost) return;
        const shareUrl = `${window.location.origin}/boiler-room?post=${selectedPost.id}`;
        navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard!');
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    // Fetch current user and profile details via Server Action with client-side backups
    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                // 1. Try server action (most reliable as it uses http cookies)
                const profile = await getCurrentUserProfile();
                if (isMounted && profile && profile.username) {
                    setCurrentUser({ id: profile.id });
                    setUserProfile({ username: profile.username, avatar_url: profile.avatar_url });
                    return;
                }

                // 2. Client-side authentication fallback
                const { data: { user } } = await supabase.auth.getUser();
                if (isMounted && user) {
                    setCurrentUser(user);
                    // Fetch profile record from database
                    const { data: dbProfile } = await supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .eq('id', user.id)
                        .single();

                    if (isMounted) {
                        const username = dbProfile?.username || user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';
                        const avatar_url = dbProfile?.avatar_url || user.user_metadata?.avatar_url || null;
                        setUserProfile({ username, avatar_url });
                    }
                } else if (isMounted) {
                    setCurrentUser(null);
                    setUserProfile(null);
                }
            } catch (err) {
                console.warn('Failed to load current user profile:', err);
            }
        };

        loadProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;
            loadProfile();
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
                    profiles!user_id ( username, avatar_url )
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
                    }) + ' • ' + new Date(p.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                    }),
                    timeAgo: getFriendlyRelativeTime(p.created_at),
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
                                        <div key={post.id} className="post-card" onClick={() => handleOpenComments(post)}>
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
                                                </div>
                                            ) : (
                                                <div className="post-cover-fallback">
                                                    <Music size={36} />
                                                </div>
                                            )}

                                            <div className="post-content-section-new">
                                                <h3 className="post-title-link">{post.content}</h3>
                                                <div className="post-footer-row">
                                                    <span className="post-author-meta-text">{post.createdAt}</span>
                                                    {currentUser && currentUser.id === post.userId && (
                                                        <button 
                                                            className="delete-btn" 
                                                            title="Delete Room" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(post.id, post.userId);
                                                            }}
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

            {/* Comments Popup Modal */}
            {selectedPost && (
                <div className="modal-overlay" onClick={handleCloseComments}>
                    <div className="modal-content-panel" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={handleCloseComments} title="Close Comments">
                            <X size={18} />
                        </button>
                        
                        <div className="modal-header-section">
                            <div className="modal-post-info">
                                {selectedPost.coverImage && (
                                    <img src={selectedPost.coverImage} alt="Post Cover" className="modal-cover-artwork" />
                                )}
                                <h2 className="modal-post-text">{selectedPost.content}</h2>
                                <div className="modal-post-meta-row">
                                    <span className="modal-author-time">By {selectedPost.author} • {selectedPost.timeAgo}</span>
                                    <div className="modal-actions-container">
                                        <button 
                                            className={`modal-action-pill ${isSubscribed ? 'active' : ''}`}
                                            onClick={handleToggleSubscription}
                                            title="Get notified about updates to this discussion"
                                        >
                                            <Bell size={14} fill={isSubscribed ? 'currentColor' : 'none'} />
                                            <span>{isSubscribed ? 'Subscribed' : 'Notify'}</span>
                                        </button>
                                        <button 
                                            className="modal-action-pill"
                                            onClick={handleSharePost}
                                            title="Share link to this discussion"
                                        >
                                            <Share2 size={14} />
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-comments-body">
                            {loadingComments ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                    <div className="spinner" style={{ width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : (
                                <ThreadedComments
                                    comments={comments.map((c: any) => {
                                        const likesList = c.boiler_room_comment_likes || [];
                                        const likesCount = likesList.length;
                                        const liked = currentUser ? likesList.some((like: any) => like.user_id === currentUser.id) : false;
                                        return {
                                            id: c.id,
                                            author: c.profiles?.username || 'Anonymous',
                                            content: c.content,
                                            timeAgo: getFriendlyRelativeTime(c.created_at),
                                            parentId: c.parent_id,
                                            likesCount,
                                            liked,
                                            avatarUrl: c.profiles?.avatar_url || null,
                                            userId: c.user_id
                                        };
                                    })}
                                    onAddComment={handleAddComment}
                                    onEditComment={handleEditComment}
                                    onDeleteComment={handleDeleteComment}
                                    onLikeComment={handleLikeComment}
                                    userAvatarUrl={userProfile?.avatar_url || null}
                                    currentUsername={userProfile?.username || null}
                                    currentUserId={currentUser?.id || null}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Alert Notification */}
            {toastMessage && (
                <div className="toast-alert">
                    <Bell size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

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

                /* Card Premium Styling */
                .post-author-bar {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 16px;
                    background: rgba(0, 0, 0, 0.2);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                }

                .post-avatar-container {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .post-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .post-avatar-fallback {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.8);
                }

                .post-author-name {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.9);
                }

                .posts-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }

                @media (max-width: 900px) {
                    .posts-grid {
                        grid-template-columns: 1fr;
                    }
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
                    cursor: pointer;
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

                .post-slider-dots {
                    position: absolute;
                    bottom: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 6px;
                    z-index: 2;
                }

                .slider-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.4);
                    transition: all 0.3s;
                }

                .slider-dot.active {
                    background: #fff;
                    transform: scale(1.2);
                    width: 14px;
                    border-radius: 3px;
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

                .post-content-section-new {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    flex: 1;
                    justify-content: space-between;
                }

                .post-title-link {
                    font-size: 0.95rem;
                    color: rgba(255, 255, 255, 0.95);
                    line-height: 1.5;
                    word-wrap: break-word;
                    font-weight: 500;
                    margin: 0;
                }

                .post-card:hover .post-title-link {
                    text-decoration: underline;
                    color: #fff;
                }

                .post-footer-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 14px;
                }

                .post-author-meta-text {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 500;
                }

                .post-comment-trigger-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.6);
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .post-comment-trigger-btn:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.15);
                    transform: scale(1.05);
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

                /* Comments Popup Modal Premium Styling */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(20px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .modal-content-panel {
                    background: #0D0D0D;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 680px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
                    animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .modal-header-section {
                    padding: 24px 24px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    position: relative;
                }

                .modal-close-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.6);
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    z-index: 10;
                }

                .modal-close-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: #fff;
                    transform: scale(1.05);
                }

                .modal-post-info {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .modal-cover-artwork {
                    width: 100%;
                    max-height: 220px;
                    object-fit: cover;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .modal-post-text {
                    font-size: 1.15rem;
                    font-weight: 600;
                    line-height: 1.5;
                    color: #fff;
                    margin: 0;
                }

                .modal-post-meta-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 4px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .modal-author-time {
                    font-size: 0.88rem;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 500;
                }

                .modal-actions-container {
                    display: flex;
                    gap: 8px;
                }

                .modal-action-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.8);
                    padding: 8px 16px;
                    border-radius: 50px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .modal-action-pill:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                    color: #fff;
                }

                .modal-action-pill.active {
                    background: rgba(139, 92, 246, 0.15);
                    border-color: rgba(139, 92, 246, 0.3);
                    color: #c084fc;
                }

                .modal-comments-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 24px 24px;
                }

                /* Toast notification alert */
                .toast-alert {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #121212;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    padding: 12px 24px;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 0.9rem;
                    font-weight: 600;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUp {
                    from { transform: translate(-50%, 20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
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
