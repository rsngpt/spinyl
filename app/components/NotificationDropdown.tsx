'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import NotificationListItem from './NotificationListItem';

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
                                {notifications.map((notif) => (
                                    <NotificationListItem
                                        key={notif.id}
                                        notification={notif}
                                        onClose={onClose}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

