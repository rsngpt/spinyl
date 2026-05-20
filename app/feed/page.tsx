import React, { Suspense } from 'react';
import FeedList from '../components/feed/FeedList';
import { getGlobalFeed } from '../actions/feed';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
    const initialPosts = await getGlobalFeed(0, 10);

    return (
        <main className="feed-page">
            <Suspense fallback={<div>Loading feed...</div>}>
                <FeedList initialPosts={initialPosts} />
            </Suspense>

            <style>{`
                .feed-page {
                    min-height: 100vh;
                    padding-top: 100px; /* Navbar offset */
                    background: var(--md-sys-color-background);
                    color: var(--md-sys-color-on-background);
                }
            `}</style>
        </main>
    );
}
