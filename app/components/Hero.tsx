import React from 'react';

export default function Hero() {
    return (
        <div
            style={{
                padding: '160px 40px 80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
            }}
        >
            <h1
                style={{
                    fontSize: '4rem',
                    marginBottom: '24px',
                    background: 'linear-gradient(90deg, #1DB954 0%, #FFFFFF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    maxWidth: '800px',
                }}
            >
                Discover Your Next Favorite Album
            </h1>
            <p
                style={{
                    fontSize: '1.2rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    lineHeight: '1.5',
                }}
            >
                Spinyl connects with your Spotify account to bring you personalized album reviews, community ratings, and hidden gems.
            </p>
        </div>
    );
}
