'use client';

import React from 'react';
import { Disc, MessageCircle, Search, User } from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section style={{
            padding: '80px 20px',
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2
        }}>
            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 className="text-gradient" style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    letterSpacing: '-0.02em',
                    marginBottom: '16px'
                }}>
                    Beyond The Needle
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Curate your collection, connect with fellow audiophiles, and uncover hidden gems.
                </p>
            </div>

            {/* Bento Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                gridAutoRows: 'minmax(250px, auto)'
            }}>

                {/* Feature 1: Catalog (Large - Spans 2 cols if space allows) */}
                <div className="glass-panel" style={{
                    gridColumn: 'span 2', // Responsive adjustment handled by auto-fit/media queries usually, but this is a rough "Bento" shape
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.1), rgba(255,255,255,0.05))',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '300px'
                }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ marginBottom: '16px' }}>
                            <Disc size={48} color="#1DB954" />
                        </div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>Track Your Collection</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: '80%' }}>
                            Build your digital library. Rate albums, write reviews, and keep track of your spinning history.
                        </p>
                    </div>
                    {/* Visual Decor: Abstract Stack */}
                    <div style={{
                        position: 'absolute',
                        top: '-20%',
                        right: '-10%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(29,185,84,0.4) 0%, rgba(0,0,0,0) 70%)',
                        filter: 'blur(60px)',
                        zIndex: 1
                    }} />
                </div>

                {/* Feature 2: Community (Tall or Regular) */}
                <div className="glass-panel" style={{
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    minHeight: '300px'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}>
                        <MessageCircle size={24} color="#fff" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Join the Talk</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                            Connect with other audiophiles. Discuss the nuances of your favorite presses.
                        </p>
                    </div>
                </div>

                {/* Feature 3: Discovery */}
                <div className="glass-panel" style={{
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    minHeight: '300px'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #ff3366, #ff6b6b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        boxShadow: '0 4px 15px rgba(255, 51, 102, 0.4)'
                    }}>
                        <Search size={24} color="#fff" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Discover Gems</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                            Find your next obsession. Our curated "Fresh Drops" help you stay ahead.
                        </p>
                    </div>
                </div>

                {/* Feature 4: Profile (Wide) */}
                <div className="glass-panel" style={{
                    gridColumn: 'span 2', // Attempt to span responsive
                    padding: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.05))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    minHeight: '200px'
                }}>
                    <div style={{ maxWidth: '60%' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '12px', color: '#fff' }}>Show off your taste</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
                            Create a stunning profile that reflects your unique sonic identity.
                        </p>
                    </div>
                    {/* Mini Profile Mockup */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: '#333',
                        border: '4px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={40} color="#fff" />
                    </div>
                </div>

            </div>

            <style jsx>{`
                @media (min-width: 900px) {
                    div[style*="grid-column: 'span 2'"] {
                        grid-column: span 2;
                    }
                }
                @media (max-width: 899px) {
                    div[style*="grid-column: 'span 2'"] {
                         grid-column: span 1 !important;
                    }
                }
                .glass-panel {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .glass-panel:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.2);
                }
            `}</style>
        </section>
    );
}
