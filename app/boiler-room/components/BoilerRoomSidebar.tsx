'use client';

import React from 'react';
import { Mic, Users } from 'lucide-react';

interface BoilerRoomSidebarProps {
    activeTab: 'listening-room' | 'clubs';
    setActiveTab: (tab: 'listening-room' | 'clubs') => void;
}

export default function BoilerRoomSidebar({ activeTab, setActiveTab }: BoilerRoomSidebarProps) {
    return (
        <aside className="boiler-room-sidebar">
            <div className="sidebar-header">
                <h2>Boiler Room</h2>
                <span className="subtitle">Music Community</span>
            </div>
            
            <nav className="sidebar-nav">
                <button
                    onClick={() => setActiveTab('listening-room')}
                    className={`nav-item ${activeTab === 'listening-room' ? 'active' : ''}`}
                >
                    <Mic size={18} />
                    <span>Listening Room</span>
                </button>
                <button
                    onClick={() => setActiveTab('clubs')}
                    className={`nav-item ${activeTab === 'clubs' ? 'active' : ''}`}
                >
                    <Users size={18} />
                    <span>Clubs</span>
                </button>
            </nav>

            <style jsx>{`
                .boiler-room-sidebar {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--md-shape-corner-extra-large);
                    padding: 24px;
                    height: fit-content;
                    position: sticky;
                    top: 100px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    backdrop-filter: blur(12px);
                }

                .sidebar-header h2 {
                    font-size: 1.4rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    background: linear-gradient(90deg, #fff 0%, #aaa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .sidebar-header .subtitle {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 4px;
                    display: block;
                }

                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: transparent;
                    border: 1px solid transparent;
                    color: rgba(255, 255, 255, 0.6);
                    padding: 12px 16px;
                    border-radius: var(--md-shape-corner-large);
                    font-size: 0.95rem;
                    font-weight: 600;
                    text-align: left;
                    cursor: pointer;
                    transition: var(--transition-spring);
                    width: 100%;
                }

                .nav-item:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.04);
                    transform: translateX(4px);
                }

                .nav-item.active {
                    color: #000;
                    background: #fff;
                    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
                }

                @media (max-width: 768px) {
                    .boiler-room-sidebar {
                        position: relative;
                        top: 0;
                        padding: 16px;
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                        gap: 16px;
                        border-radius: var(--md-shape-corner-large);
                    }

                    .sidebar-header {
                        display: none;
                    }

                    .sidebar-nav {
                        flex-direction: row;
                        width: 100%;
                        gap: 12px;
                    }

                    .nav-item {
                        flex: 1;
                        justify-content: center;
                        padding: 10px 12px;
                        font-size: 0.85rem;
                        white-space: nowrap;
                    }

                    .nav-item:hover {
                        transform: none;
                    }
                }
            `}</style>
        </aside>
    );
}
