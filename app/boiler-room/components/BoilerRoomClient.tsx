'use client';

import React, { useState } from 'react';
import Footer from '../../components/Footer';
import BoilerRoomSidebar from './BoilerRoomSidebar';
import ListeningRoomView from './ListeningRoomView';
import ClubsView from './ClubsView';

export default function BoilerRoomClient() {
    const [activeTab, setActiveTab] = useState<'listening-room' | 'clubs'>('listening-room');

    return (
        <main className="boiler-room-page">
            {/* Animated Ambient background */}
            <div className="live-gradient-bg" />

            <div className="content-container">
                <div className="boiler-room-grid">
                    {/* Sticky Sidebar */}
                    <div className="sidebar-col">
                        <BoilerRoomSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>

                    {/* Main Content Area */}
                    <div className="content-col">
                        {activeTab === 'listening-room' ? (
                            <ListeningRoomView />
                        ) : (
                            <ClubsView />
                        )}
                    </div>
                </div>
            </div>

            <Footer />

            <style jsx>{`
                .boiler-room-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    padding-top: 80px;
                    background-color: #000;
                    color: #fff;
                }

                .content-container {
                    flex: 1;
                    z-index: 1;
                    max-width: 1300px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 32px 24px 80px;
                }

                .boiler-room-grid {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 40px;
                    align-items: start;
                }

                .sidebar-col {
                    position: sticky;
                    top: 100px;
                }

                .content-col {
                    min-width: 0;
                }

                @media (max-width: 768px) {
                    .content-container {
                        padding: 16px 16px 100px;
                    }

                    .boiler-room-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }

                    .sidebar-col {
                        position: relative;
                        top: 0;
                    }
                }
            `}</style>
        </main>
    );
}
