'use client';

import Link from 'next/link';
import { formatFriendlyDate } from '../../src/lib/date-utils';
import DefaultAvatar from './DefaultAvatar';


interface NotificationListItemProps {
    notification: any; // Using any for now to match strict type union complexity in parent
    onClose?: () => void;
}

export default function NotificationListItem({ notification, onClose }: NotificationListItemProps) {
    const isReview = notification.type === 'review';

    const isComment = notification.type === 'comment' || notification.type === 'mention' || notification.type === 'boiler_room_comment';

    // Determine the HREF
    let href = '#';
    if (isReview && notification.albums?.spotify_id) {
        href = `/album/${notification.albums.spotify_id}`;
    } else if (notification.type === 'follow' && notification.follower_user_id) {
        href = `/profile/${notification.follower_user_id}`;
    } else if (notification.type === 'comment' || notification.type === 'mention') {
        const spotifyId = notification.comments?.reviews?.albums?.spotify_id || notification.resource_id;
        href = spotifyId ? `/album/${spotifyId}` : '#';
    } else if (notification.type === 'boiler_room_comment') {
        href = `/boiler-room?post=${notification.resource_id}`;
    }

    // Determine Avatar
    const avatarUrl = isReview
        ? notification.profiles?.avatar_url
        : isComment ? notification.actor?.avatar_url
            : notification.follower?.avatar_url;

    const username = isReview
        ? (notification.profiles?.username || 'Someone')
        : isComment ? (notification.actor?.username || 'Someone')
            : (notification.follower?.username || 'Someone');

    const initial = (username || '?')[0].toUpperCase();

    // Determine Message Content
    let content;
    if (isReview) {
        content = (
            <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>
                    {username}
                </span>
                <span style={{ color: '#aaa' }}> reviewed </span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {notification.albums?.name || 'an album'}
                </span>
            </p>
        );
    } else if (notification.type === 'follow') {
        content = (
            <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>
                    {username}
                </span>
                <span style={{ color: '#aaa' }}> started following you.</span>
            </p>
        );
    } else if (notification.type === 'comment' || notification.type === 'mention') {
        const actionText = notification.type === 'comment' ? ' commented on your review' : ' mentioned you in a comment';
        content = (
            <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>
                    {username}
                </span>
                <span style={{ color: '#aaa' }}>{actionText}</span>
            </p>
        );
    } else if (notification.type === 'boiler_room_comment') {
        content = (
            <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>
                    {username}
                </span>
                <span style={{ color: '#aaa' }}> {notification.message || 'commented on a boiler room'}</span>
            </p>
        );
    } else {
        content = (
            <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4', color: '#ccc' }}>
                {notification.message}
            </p>
        );
    }

    return (
        <Link
            href={href}
            style={{ textDecoration: 'none', display: 'block' }}
            onClick={onClose}
        >
            <div className="notification-item" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                transition: 'background 0.2s',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)',
                marginBottom: '8px'
            }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
                <div style={{ width: '40px', height: '40px', borderRadius: '0', overflow: 'hidden', flexShrink: 0, background: '#333' }}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <DefaultAvatar size={24} fill="currentColor" />
                        </div>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {content}
                    <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', display: 'block' }}>
                        {formatFriendlyDate(notification.created_at)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
