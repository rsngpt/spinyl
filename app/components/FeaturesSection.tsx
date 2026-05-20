'use client';

import React from 'react';
import { Disc, MessageCircle, Search, User } from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section className="features-section">
            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 className="section-title">
                    Beyond The Needle
                </h2>
                <p className="section-subtitle">
                    Curate your collection, connect with fellow audiophiles, and uncover hidden gems.
                </p>
            </div>

            {/* Bento Grid */}
            <div className="features-grid">

                {/* Feature 1: Catalog (Large) */}
                <div className="feature-card span-2 large-card">
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ marginBottom: '16px' }}>
                            <Disc size={40} color="var(--md-sys-color-primary)" />
                        </div>
                        <h3 className="card-title" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Track Your Collection</h3>
                        <p className="card-desc" style={{ fontSize: '1rem', maxWidth: '80%' }}>
                            Build your digital library. Rate albums, write reviews, and keep track of your spinning history.
                        </p>
                    </div>
                    {/* Visual Decor */}
                    <div className="card-decor" />
                </div>

                {/* Feature 2: Community */}
                <div className="feature-card">
                    <div className="icon-box">
                        <MessageCircle size={24} color="var(--md-sys-color-primary)" />
                    </div>
                    <div>
                        <h3 className="card-title">Join the Talk</h3>
                        <p className="card-desc">
                            Connect with other audiophiles. Discuss the nuances of your favorite presses.
                        </p>
                    </div>
                </div>

                {/* Feature 3: Discovery */}
                <div className="feature-card">
                    <div className="icon-box discovery-icon">
                        <Search size={24} color="var(--md-sys-color-on-primary)" />
                    </div>
                    <div>
                        <h3 className="card-title">Discover Gems</h3>
                        <p className="card-desc">
                            Find your next obsession. Our curated "Fresh Drops" help you stay ahead.
                        </p>
                    </div>
                </div>

                {/* Feature 4: Profile (Wide) */}
                <div className="feature-card span-2 profile-card">
                    <div style={{ maxWidth: '60%' }}>
                        <h3 className="card-title">Show off your taste</h3>
                        <p className="card-desc">
                            Create a stunning profile that reflects your unique sonic identity.
                        </p>
                    </div>
                    {/* Mini Profile Mockup */}
                    <div className="mini-profile">
                        <User size={32} color="var(--md-sys-color-primary)" />
                    </div>
                </div>

            </div>

            <style jsx>{`
                .features-section {
                    padding: 80px 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 2;
                }
                .section-title {
                    font-family: var(--font-display);
                    font-size: 3rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    margin-bottom: 16px;
                    background: linear-gradient(135deg, var(--md-sys-color-primary) 0%, var(--md-sys-color-tertiary) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .section-subtitle {
                    color: var(--md-sys-color-on-surface-variant);
                    font-size: 1.2rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    grid-auto-rows: minmax(250px, auto);
                }

                .feature-card {
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    background: var(--md-sys-color-surface-container-low);
                    border: 1px solid var(--md-sys-color-outline-variant);
                    border-radius: var(--md-shape-corner-extra-large);
                    min-height: 300px;
                    position: relative;
                    overflow: hidden;
                    transition: var(--transition-spring);
                }
                .feature-card:hover {
                    transform: scale(1.03) translateY(-4px);
                    background: var(--md-sys-color-surface-container);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.3), 0 0 20px rgba(255, 159, 104, 0.15);
                }

                .large-card {
                    justify-content: flex-end;
                    background: linear-gradient(135deg, var(--md-sys-color-primary-container) 0%, var(--md-sys-color-surface-container-low) 100%);
                }
                .profile-card {
                    flex-direction: row;
                    align-items: center;
                    min-height: 200px;
                    background: linear-gradient(to right, var(--md-sys-color-surface-container-low), var(--md-sys-color-surface-container-highest));
                }

                .card-title {
                    color: var(--md-sys-color-on-surface);
                    font-family: var(--font-display);
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }

                .card-desc {
                    color: var(--md-sys-color-on-surface-variant);
                    font-size: 0.95rem;
                }

                .card-decor {
                    position: absolute;
                    top: -20%;
                    right: -10%;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, var(--md-sys-color-primary-container) 0%, rgba(0,0,0,0) 70%);
                    filter: blur(60px);
                    z-index: 1;
                    opacity: 0.6;
                }

                .icon-box {
                    width: 50px;
                    height: 50px;
                    border-radius: var(--md-shape-corner-medium);
                    background: var(--md-sys-color-surface-container-high);
                    border: 1px solid var(--md-sys-color-outline-variant);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .discovery-icon {
                    border-radius: var(--md-shape-corner-full);
                    background: linear-gradient(45deg, var(--md-sys-color-primary), var(--md-sys-color-tertiary));
                    box-shadow: 0 4px 15px rgba(255, 159, 104, 0.3);
                    border: none;
                }
                .mini-profile {
                    width: 80px;
                    height: 80px;
                    border-radius: var(--md-shape-corner-full);
                    background: var(--md-sys-color-surface-container-highest);
                    border: 4px solid var(--md-sys-color-outline-variant);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }

                /* Desktop specific */
                @media (min-width: 900px) {
                    .span-2 {
                        grid-column: span 2;
                    }
                }

                /* MOBILE OPTIMIZATIONS */
                @media (max-width: 899px) {
                    .features-section {
                        padding: 40px 16px;
                    }
                    .section-title {
                        font-size: 2.2rem;
                    }
                    .features-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                        grid-auto-rows: auto;
                    }
                    .span-2 {
                        grid-column: auto;
                    }
                    
                    .feature-card {
                        min-height: auto;
                        padding: 24px;
                    }
                    .large-card {
                        min-height: 250px;
                    }
                    .profile-card {
                        min-height: auto;
                        flex-direction: column;
                        align-items: flex-start;
                        text-align: left;
                        gap: 16px;
                    }
                    .profile-card > div:first-child {
                        max-width: 100%;
                    }
                    .mini-profile {
                        align-self: flex-start;
                    }
                }
            `}</style>
        </section>
    );
}
