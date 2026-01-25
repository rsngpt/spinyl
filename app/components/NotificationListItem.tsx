'use client';

import Link from 'next/link';

interface NotificationListItemProps {
    notification: any; // Using any for now to match strict type union complexity in parent
    onClose?: () => void;
}

export default function NotificationListItem({ notification, onClose }: NotificationListItemProps) {
    const isReview = notification.type === 'review';

    // Determine the HREF
    let href = '#';
    if (isReview && notification.albums?.spotify_id) {
        href = `/album/${notification.albums.spotify_id}`;
    } else if (notification.type === 'follow' && notification.follower_user_id) {
        href = `/profile/${notification.follower_user_id}`;
    }

    // Determine Avatar
    const avatarUrl = isReview
        ? notification.profiles?.avatar_url
        : (notification.type === 'comment' || notification.type === 'mention') ? notification.actor?.avatar_url
            : notification.follower?.avatar_url;

    const username = isReview
        ? (notification.profiles?.username || 'Someone')
        : (notification.type === 'comment' || notification.type === 'mention') ? (notification.actor?.username || 'Someone')
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
    } else {
        content = (
            <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4', color: '#ccc' }}>
                {notification.message}
            </p>
        );
    }

    if (notification.type === 'comment') {
        const spotifyId = notification.comments?.reviews?.albums?.spotify_id;
        href = spotifyId ? `/album/${spotifyId}` : '#';
        if (!spotifyId && notification.comments?.review_id) {
            // Fallback if we somehow have review_id but not spotify_id (shouldn't happen with new query)
            // But actually we need spotify_id for the route.
            href = '#';
        }
        // Actually review_id might be the ID of the REVIEW, but the route is likely /album/[id]?review_id=... 
        // Wait, Navbar says: review_id: n.comments?.review_id. 
        // But we need the ALBUM ID to construct a proper link /album/[album_id]. 
        // Navbar doesn't seem to fetch ALBUM ID for comments... handling this might be tricky without it.
        // Let's check Navbar again. Navbar fetches `comments` table which has `review_id`. 
        // It does NOT fetch the album associated with that review in the comments query.
        // However, `resource_id` in notifications usually points to something. 

        // Let's look at how we can route. If we only have review_id, we can't easily go to /album/[id].
        // Maybe we can route to /profile/me?tab=reviews or just use the resource_id if it IS the album id?
        // Typically `resource_id` in `notifications` table for a comment should probably point to the Review or Album.

        // Assuming for now we might not have perfect routing, but let's at least fix the display.
        // If we don't have album ID, maybe we just use '#' or a safe fallback.
        // Ideally `resource_id` or `notification.comments?.review_id` is useful.
        // Actually, if we look at Navbar.tsx, `reviewsPromise` brings in album data. 
        // `realNotificationsPromise` brings in raw notification rows.

        // Let's just use what we have. If `notification.resource_id` is the album_id, that's great. 
        // If not, we might need to adjust Navbar.
        // For now, let's fix the Visuals first.

        const actorName = notification.actor?.username || 'Someone';
        content = (
            <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>
                    {actorName}
                </span>
                <span style={{ color: '#aaa' }}> commented on your review</span>
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
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#333' }}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                            {initial}
                        </div>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {content}
                    <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', display: 'block' }}>
                        {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </Link>
    );
}
