'use client';

import React, { useState } from 'react';
import { X, Share2, AlertTriangle, RefreshCcw } from 'lucide-react';

interface RoastModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function RoastModal({ isOpen, onClose, userId }: RoastModalProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [roastData, setRoastData] = useState<any>(null);
    const [loadingText, setLoadingText] = useState('Initiating Judgement Protocol...');
    const [errorMessage, setErrorMessage] = useState('');

    // Mock Loading Sequence
    const startRoast = async () => {
        setStatus('loading');

        const messages = [
            "Scanning your questionable listening history...",
            "Judging your obsession with the same 5 songs...",
            "Calculating your pretentiousness score...",
            "Consulting the Council of Cool...",
            "Finalizing the roast..."
        ];

        let msgIndex = 0;
        const interval = setInterval(() => {
            setLoadingText(messages[msgIndex % messages.length]);
            msgIndex++;
        }, 1500);

        try {
            const res = await fetch('/api/roast', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                if (data.error) setErrorMessage(data.error);
                setStatus('error');
                return;
            }

            setRoastData(data);
            setStatus('success');
        } catch (e: any) {
            setErrorMessage(e.message || 'Something went wrong');
            setStatus('error');
        } finally {
            clearInterval(interval);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                {status === 'idle' && (
                    <div className="state-idle">
                        <div className="icon-pulse">🔥</div>
                        <h2>Ready to get Roasted?</h2>
                        <p>Our AI will analyze your reviews and listening habits to give you a brutally honest diagnosis.</p>
                        <p className="warning"><AlertTriangle size={16} /> Warning: Feelings may be hurt.</p>
                        <button className="action-btn" onClick={startRoast}>Roast My Taste</button>
                    </div>
                )}

                {status === 'loading' && (
                    <div className="state-loading">
                        <div className="spinner"></div>
                        <p className="loading-text">{loadingText}</p>
                    </div>
                )}

                {status === 'success' && roastData && (
                    <div className="state-success">
                        {/* New Landscape Grid Layout Container */}
                        <div className="roast-grid">
                            <div className="roast-left">
                                <div className="roast-header">
                                    <h3>The Verdict</h3>
                                    <div className="rating-badge">{roastData.rating}</div>
                                </div>
                                <h1 className="diagnosis">{roastData.diagnosis}</h1>
                                <div className="hashtag-pill">{roastData.hashtag}</div>
                            </div>

                            <div className="roast-right">
                                <div className="text-wrapper">
                                    <p className="roast-text">"{roastData.roast_text}"</p>
                                </div>
                                <button className="share-btn"><Share2 size={18} /> Share My Shame</button>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="state-loading">
                        <AlertTriangle size={48} color="#ff4500" style={{ marginBottom: 20 }} />
                        <h3 style={{ color: '#fff', marginBottom: 10 }}>Roast Failed</h3>
                        <p style={{ color: '#aaa', marginBottom: 20, textAlign: 'center' }}>{errorMessage || 'The AI refused to roast you. You might need more reviews.'}</p>
                        <button className="action-btn" onClick={() => setStatus('idle')}>Try Again</button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                    backdrop-filter: blur(8px);
                }

                .modal-content {
                    background: #111;
                    width: 100%;
                    /* Mobile (Portrait) Styles - Compact */
                    max-width: 340px; 
                    border-radius: 20px;
                    padding: 20px;
                    position: relative;
                    color: white;
                    border: 1px solid #333;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7);
                    animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* Mobile-First Grid (Stacked) */
                .roast-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                /* Desktop Landscape Styles */
                @media (min-width: 768px) {
                    .modal-content {
                        max-width: 600px; /* Much smaller desktop width */
                        padding: 30px;
                    }

                    .roast-grid {
                        display: grid;
                        grid-template-columns: 0.8fr 1.2fr;
                        gap: 25px; /* Tighter gap */
                        align-items: center;
                    }
                    
                    .roast-left {
                        text-align: right;
                        border-right: 1px solid #333;
                        padding-right: 25px; /* Tighter padding */
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        justify-content: center;
                        height: 100%;
                    }
                    
                    .roast-header {
                        justify-content: flex-end;
                    }

                    .roast-right {
                        text-align: left;
                    }
                }

                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: #222;
                    border: 1px solid #333;
                    color: #fff;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 50%;
                    transition: all 0.2s;
                    z-index: 10;
                }
                .close-btn:hover { background: #333; transform: rotate(90deg); }

                /* Idle State */
                .state-idle { text-align: center; }
                .icon-pulse { font-size: 2.5rem; margin-bottom: 15px; animation: pulse 2s infinite; }
                
                .warning { 
                    color: #ff8800; 
                    margin: 15px 0; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 6px; 
                    font-size: 0.8rem;
                    background: rgba(255, 136, 0, 0.1);
                    padding: 8px;
                    border-radius: 8px;
                }
                .action-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #ff4500, #ff8700);
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s;
                    box-shadow: 0 4px 15px rgba(255, 69, 0, 0.3);
                }
                .action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 69, 0, 0.4); }

                /* Loading State */
                .state-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    text-align: center;
                }
                .spinner {
                    width: 35px;
                    height: 35px;
                    border: 3px solid #333;
                    border-top-color: #ff4500;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 15px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .loading-text { font-family: sans-serif; color: #888; letter-spacing: 0.5px; font-size: 0.85rem; }

                /* Elements */
                .roast-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }
                .roast-header h3 {
                    margin: 0;
                    font-size: 0.75rem;
                    color: #666;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .rating-badge {
                    background: #222;
                    color: #ff4500;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-weight: 800;
                    font-size: 0.8rem;
                    border: 1px solid #333;
                    white-space: nowrap;
                }

                .diagnosis {
                    font-size: 1.4rem;
                    line-height: 1.1;
                    font-weight: 900;
                    background: linear-gradient(to right, #fff, #999);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0 0 10px 0;
                }

                .hashtag-pill {
                    display: inline-block;
                    background: rgba(255, 69, 0, 0.1);
                    color: #ff4500;
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-weight: 600;
                    font-size: 0.75rem;
                }

                .roast-text {
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: #ddd;
                    margin-bottom: 20px;
                    font-style: italic;
                }
                
                .text-wrapper {
                     min-height: 60px;
                }

                .share-btn {
                    width: 100%;
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 10px;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: background 0.2s;
                    font-size: 0.85rem;
                }
                .share-btn:hover { background: #eee; }

            `}</style>
        </div>
    );
}
