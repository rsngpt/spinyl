'use client';

import React from 'react';
import { Disc, MessageCircle, Search, User } from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section className="features-section">
            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 className="text-gradient section-title">
                    Beyond The Needle
                </h2>
                <p className="section-subtitle">
                    Curate your collection, connect with fellow audiophiles, and uncover hidden gems.
                </p>
            </div>

            {/* Bento Grid */}
            <div className="features-grid">

                {/* Feature 1: Catalog (Large) */}
                <div className="glass-panel feature-card span-2 large-card">
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ marginBottom: '16px' }}>
                            <Disc size={40} color="#ff9f68" />
                        </div>
                        <h3 className="card-title">Track Your Collection</h3>
                        <p className="card-desc">
                            Build your digital library. Rate albums, write reviews, and keep track of your spinning history.
                        </p>
                    </div>
                    {/* Visual Decor */}
                    <div className="card-decor" />
                </div>

                {/* Feature 2: Community */}
                <div className="glass-panel feature-card">
                    <div className="icon-box">
                        <MessageCircle size={24} color="#fff" />
                    </div>
                    <div>
                        <h3 className="card-title">Join the Talk</h3>
                        <p className="card-desc">
                            Connect with other audiophiles. Discuss the nuances of your favorite presses.
                        </p>
                    </div>
                </div>

                {/* Feature 3: Discovery */}
                <div className="glass-panel feature-card">
                    <div className="icon-box discovery-icon">
                        <Search size={24} color="#fff" />
                    </div>
                    <div>
                        <h3 className="card-title">Discover Gems</h3>
                        <p className="card-desc">
                            Find your next obsession. Our curated "Fresh Drops" help you stay ahead.
                        </p>
                    </div>
                </div>

                {/* Feature 4: Profile (Wide) */}
                <div className="glass-panel feature-card span-2 profile-card">
                    <div style={{ maxWidth: '60%' }}>
                        <h3 className="card-title">Show off your taste</h3>
                        <p className="card-desc">
                            Create a stunning profile that reflects your unique sonic identity.
                        </p>
                    </div>
                    {/* Mini Profile Mockup */}
                    <div className="mini-profile">
                        <User size={32} color="#fff" />
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
                    fontSize: 3rem;
                    fontWeight: 800;
                    letterSpacing: -0.02em;
                    marginBottom: 16px;
                }
                .section-subtitle {
                    color: rgba(255,255,255,0.6);
                    fontSize: 1.2rem;
                    maxWidth: 600px;
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
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 24px;
                    min-height: 300px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .feature-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.2);
                }

                .large-card {
                    justify-content: flex-end;
                    background: linear-gradient(135deg, rgba(29, 185, 84, 0.1), rgba(255,255,255,0.05));
                }
                .profile-card {
                    flex-direction: row;
                    align-items: center;
                    min-height: 200px;
                    background: linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.05));
                }

                .card-title {
                    color: #fff;
                    fontSize: 1.5rem; /* Reduced slightly */
                    fontWeight: 600;
                    marginBottom: 8px;
                }
                .large-card .card-title {
                    fontSize: 1.8rem;
                    fontWeight: 700;
                    marginBottom: 12px;
                }

                .card-desc {
                    color: rgba(255,255,255,0.6);
                    fontSize: 0.95rem;
                }
                .large-card .card-desc {
                    color: rgba(255,255,255,0.7);
                    fontSize: 1rem;
                    maxWidth: 80%;
                }

                .card-decor {
                    position: absolute;
                    top: -20%;
                    right: -10%;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(29,185,84,0.4) 0%, rgba(0,0,0,0) 70%);
                    filter: blur(60px);
                    z-index: 1;
                }

                .icon-box {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .discovery-icon {
                    border-radius: 50%;
                    background: linear-gradient(45deg, #ff3366, #ff6b6b);
                    box-shadow: 0 4px 15px rgba(255, 51, 102, 0.4);
                }
                .mini-profile {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: #333;
                    border: 4px solid rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
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
                        padding: 40px 16px; /* Reduced padding */
                    }
                    .section-title {
                        font-size: 2rem; /* Smaller header */
                    }
                    .features-grid {
                        grid-template-columns: 1fr; /* Single column */
                        gap: 16px; /* Smaller gap */
                        grid-auto-rows: auto;
                    }
                    .span-2 {
                        grid-column: auto; /* Stack everything */
                    }
                    
                    .feature-card {
                        min-height: auto; /* Allow auto height */
                        padding: 24px;
                    }
                    .large-card {
                        min-height: 250px; /* Keep some height for the big one */
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
                        align-self: flex-start; /* Left align profile icon on mobile */
                    }
                    
                    /* Adjust font sizes */
                    .large-card .card-title {
                        font-size: 1.5rem;
                    }
                    .card-title {
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </section>
    );
}
