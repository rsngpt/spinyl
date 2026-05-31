'use client';

import { useState } from 'react';
import SearchOverlay from './SearchOverlay';
import { Search } from 'lucide-react';

export default function SearchBar({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
                onClick={() => setIsOpen(true)}
                className="nav-action-btn"
                title="Search"
            >
                <Search size={18} />
            </button>

            <SearchOverlay
                isVisible={isOpen}
                onClose={() => setIsOpen(false)}
                user={user}
            />

            <style jsx>{`
                .nav-action-btn {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .nav-action-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                }

                .nav-action-btn:active {
                    transform: scale(0.95);
                }
            `}</style>
        </div>
    );
}
