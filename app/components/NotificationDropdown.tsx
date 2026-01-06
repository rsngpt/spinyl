'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { SupabaseClient } from '@supabase/supabase-js';



interface NotificationDropdownProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    supabase: SupabaseClient;
    notifications: any[];
    loading: boolean;
    onRefresh: () => void;
}

export default function NotificationDropdown({ userId, isOpen, onClose, supabase, notifications, loading, onRefresh }: NotificationDropdownProps) {
    // Union type for reviews and follows (kept for reference or better typing if we pass typed props)
    type NotificationItem =
        | { type: 'review'; id: string; created_at: string; profiles: { username: string; avatar_url: string | null } | null; albums: { id: string; spotify_id: string; name: string; cover_image: string } | null; }
        | { type: 'follow'; id: string; created_at: string; follower: { username: string; avatar_url: string | null } | null; follower_user_id?: string; }
        | { type: 'system'; id: string; created_at: string; message: string; };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop to close on click outside */}
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            width: '320px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            background: 'rgba(24, 24, 24, 0.95)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            padding: '12px',
                            zIndex: 999,
                            marginTop: '12px'
                        }}
                        className="notification-dropdown"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Updates</h3>
                            <button onClick={onRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem' }}>Refresh</button>
                        </div>

                        {loading ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>No new updates.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {notifications.map((notif) => {
                                    if (notif.type === 'review') {
                                        return (
                                            <Link
                                                key={notif.id}
                                                href={notif.albums?.spotify_id ? `/album/${notif.albums.spotify_id}` : '#'}
                                                style={{ textDecoration: 'none' }}
                                                onClick={onClose}
                                            >
                                                <div className="notification-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', transition: 'background 0.2s', cursor: 'pointer' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#333' }}>
                                                        {notif.profiles?.avatar_url ? (
                                                            <img src={notif.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{(notif.profiles?.username || '?')[0].toUpperCase()}</div>
                                                        )}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
                                                            <span style={{ fontWeight: 600, color: '#fff' }}>
                                                                {notif.profiles?.username || 'Someone'}
                                                            </span>
                                                            <span style={{ color: '#aaa' }}> reviewed </span>
                                                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                                                {notif.albums?.name || 'an album'}
                                                            </span>
                                                        </p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                            <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                                                {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(notif.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Album Data (Tiny) */}
                                                    {notif.albums?.cover_image && (
                                                        <img
                                                            src={notif.albums.cover_image}
                                                            alt=""
                                                            style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                                                        />
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    } else if (notif.type === 'follow') {
                                        // Follow Notification
                                        return (
                                            <Link
                                                key={notif.id}
                                                href={`/profile/${notif.follower_user_id}`}
                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                                onClick={onClose}
                                            >
                                                <div className="notification-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', transition: 'background 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#333' }}>
                                                        {notif.follower?.avatar_url ? (
                                                            <img src={notif.follower.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{(notif.follower?.username || '?')[0].toUpperCase()}</div>
                                                        )}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
                                                            <span style={{ fontWeight: 600, color: '#fff' }}>{notif.follower?.username || 'Someone'}</span>
                                                            <span style={{ color: '#aaa' }}> started following you</span>
                                                        </p>
                                                        <p style={{ fontSize: '0.75rem', color: '#666', margin: '4px 0 0' }}>
                                                            {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(notif.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    } else {
                                        // System Notification
                                        return (
                                            <div key={notif.id} className="notification-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', transition: 'background 0.2s', borderLeft: '3px solid var(--primary)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(29, 185, 84, 0.2)', color: 'var(--primary)' }}>
                                                    {/* Bell icon SVG directly or simple text */}
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4', fontWeight: 500, color: '#fff' }}>
                                                        {notif.message}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: '#666', margin: '4px 0 0' }}>
                                                        {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        )}
                        {/* Debug footer removed for production */}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
