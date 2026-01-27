import React, { Suspense } from 'react';
import FeedList from '../components/feed/FeedList';
import { getGlobalFeed } from '../actions/feed';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
    const initialPosts = await getGlobalFeed(0, 10);

    return (
        <main className="feed-page">
            <div className="feed-header">
                <h1>Social Feed</h1>
                <p>Discover what the world is listening to.</p>
            </div>

            <Suspense fallback={<div>Loading feed...</div>}>
                <FeedList initialPosts={initialPosts} />
            </Suspense>

            <style>{`
                .feed-page {
                    min-height: 100vh;
                    padding-top: 100px; /* Navbar offset */
                    background: #121212;
                    color: white;
                }

                .feed-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .feed-header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 8px;
                    background: linear-gradient(90deg, #1DB954 0%, #FFFFFF 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .feed-header p {
                    color: #888;
                }
            `}</style>
        </main>
    );
}
