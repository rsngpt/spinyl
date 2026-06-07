'use client';

import React from 'react';
import { Plus } from 'lucide-react';

function BoilerRoomIcon({ size = 18 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            viewBox="0 -960 960 960"
            width={size}
            fill="currentColor"
            style={{ display: 'block' }}
        >
            <path d="M240-400q0 52 21 98.5t60 81.5q-1-5-1-9v-9q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60v9q0 4-1 9 39-35 60-81.5t21-98.5q0-50-18.5-94.5T648-574q-20 13-42 19.5t-45 6.5q-62 0-107.5-41T401-690q-39 33-69 68.5t-50.5 72Q261-513 250.5-475T240-400Zm240 52-57 56q-11 11-17 25t-6 29q0 32 23.5 55t56.5 23q33 0 56.5-23t23.5-55q0-16-6-29.5T537-292l-57-56Zm0-492v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-129 86.5-245T480-840Z" />
        </svg>
    );
}

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
                    <BoilerRoomIcon size={18} />
                    <span>Your Boiler Room</span>
                </button>
                <button
                    onClick={() => setActiveTab('clubs')}
                    className={`nav-item ${activeTab === 'clubs' ? 'active' : ''}`}
                >
                    <Plus size={18} />
                    <span>Create a Boiler Room</span>
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
