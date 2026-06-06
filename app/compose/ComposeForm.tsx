'use client';

import { useState, useTransition } from 'react';
import { createHotTake } from '../actions/hot_takes';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DefaultAvatar from '../components/DefaultAvatar';

interface ComposeFormProps {
    userAvatar: string | null;
    username: string | null;
}

export default function ComposeForm({ userAvatar, username }: ComposeFormProps) {
    const [content, setContent] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const maxLength = 280;

    const handleSubmit = () => {
        if (!content.trim()) return;

        startTransition(async () => {
            try {
                await createHotTake(content);
                // Redirect happens in server action, but just in case
                window.dispatchEvent(new CustomEvent('spinyl:nav-start', { detail: { href: '/feed' } }));
                router.push('/feed');
            } catch (error) {
                alert('Failed to post. Please try again.');
            }
        });
    };

    const isPostable = content.trim().length > 0 && content.length <= maxLength;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000000',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Fixed Header */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60px',
                paddingTop: 'env(safe-area-inset-top)',
                boxSizing: 'content-box'
            }}>
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    style={{
                        position: 'absolute',
                        left: '16px',
                        bottom: '10px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    <X size={20} />
                </button>

                {/* Title */}
                <h1 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: 'white',
                    letterSpacing: '-0.02em'
                }}>
                    New Hot Take
                </h1>
            </div>

            {/* Spacer for Fixed Header */}
            <div style={{ height: 'calc(60px + env(safe-area-inset-top))', width: '100%', flexShrink: 0 }} />

            {/* Content Area */}
            <div style={{ padding: '24px 20px', flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {/* User Avatar */}
                    <div style={{
                        flexShrink: 0,
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#2a2a2a',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        {userAvatar ? (
                            <img src={userAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                <DefaultAvatar fill="currentColor" />
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's your music hot take?"
                            autoFocus
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.25rem',
                                resize: 'none',
                                outline: 'none',
                                fontFamily: 'inherit',
                                lineHeight: '1.5',
                                fontWeight: '500'
                            }}
                        />

                        {/* Interactive Footer (Divider + Char Count + Button) */}
                        <div style={{
                            marginTop: '20px',
                            paddingTop: '16px',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                            }}>
                                {/* Char Count */}
                                <div style={{
                                    color: content.length > maxLength ? '#E91429' : 'rgba(255,255,255,0.5)',
                                    fontSize: '0.9rem',
                                    fontWeight: content.length > maxLength ? 'bold' : 'normal',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {content.length > maxLength && <X size={14} />}
                                    {maxLength - content.length}
                                </div>
                            </div>

                            {/* Post Button - MOVED TO BOTTOM RIGHT */}
                            <button
                                onClick={handleSubmit}
                                disabled={isPending || !isPostable}
                                style={{
                                    backgroundColor: isPostable ? 'var(--md-sys-color-primary)' : 'rgba(255, 255, 255, 0.1)',
                                    color: isPostable ? 'var(--md-sys-color-on-primary)' : 'rgba(255, 255, 255, 0.4)',
                                    border: 'none',
                                    padding: '10px 24px',
                                    borderRadius: '24px',
                                    fontWeight: '700',
                                    fontSize: '0.95rem',
                                    cursor: isPending || !isPostable ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    opacity: isPending ? 0.8 : 1,
                                    transform: isPostable && !isPending ? 'scale(1)' : 'scale(1)',
                                }}
                                onMouseOver={(e) => {
                                    if (isPostable && !isPending) {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (isPostable && !isPending) {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.backgroundColor = 'var(--md-sys-color-primary)';
                                    }
                                }}
                            >
                                {isPending && <Loader2 size={16} className="animate-spin" />}
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Toast */}
            {content.length > maxLength && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '12px 24px',
                    background: '#E91429',
                    color: 'white',
                    borderRadius: '30px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 32px rgba(233, 20, 41, 0.4)',
                    animation: 'fadeInUp 0.3s ease-out',
                    zIndex: 100
                }}>
                    Your take is too hot! Shorten it to {maxLength} characters.
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>
        </div>
    );
}
