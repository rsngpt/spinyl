'use client';

import React from 'react';
import Link from 'next/link';
import { Twitter, Instagram, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="footer" style={{
            background: '#000',
            padding: '80px 0 40px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
            zIndex: 10,
            width: '100%'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>

                {/* Main Content Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '60px',
                    marginBottom: '80px'
                }}>

                    {/* Column 1: Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <div style={{ width: '32px', height: '32px', background: '#ff9f68', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4e260f' }}>S</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>Spinyl</h2>
                        </div>
                        <p style={{ color: '#B3B3B3', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '32px', maxWidth: '300px' }}>
                            Your ultimate companion for discovering, reviewing, and tracking music. Join the community of vinyl enthusiasts today.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <SocialIcon href="https://twitter.com" icon={<Twitter size={20} />} />
                            <SocialIcon href="https://instagram.com" icon={<Instagram size={20} />} />
                            <SocialIcon href="https://github.com" icon={<Github size={20} />} />
                            <SocialIcon href="https://linkedin.com" icon={<Linkedin size={20} />} />
                        </div>
                    </div>

                    {/* Column 2: Platform */}
                    <div>
                        <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '24px', fontWeight: '700' }}>Platform</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <FooterLink href="/shelf">Shelf</FooterLink>
                            <FooterLink href="/reviews">Latest Reviews</FooterLink>
                            <FooterLink href="/profile">My Collection</FooterLink>
                            <FooterLink href="/features">Features</FooterLink>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div>
                        <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '24px', fontWeight: '700' }}>Company</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <FooterLink href="/about">About Us</FooterLink>
                            <FooterLink href="/careers">Careers</FooterLink>
                            <FooterLink href="/privacy">Privacy Policy</FooterLink>
                            <FooterLink href="/terms">Terms of Service</FooterLink>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '24px', fontWeight: '700' }}>Get in Touch</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#B3B3B3' }}>
                                <Mail size={18} color="#ff9f68" />
                                <span style={{ fontSize: '0.95rem' }}>spinylchord@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '40px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '20px',
                    color: '#555',
                    fontSize: '0.9rem'
                }}>
                    <p>&copy; {new Date().getFullYear()} Spinyl. All rights reserved.</p>
                    <p>Made with 🧡 by Roshan Gupta</p>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = '#ff9f68';
                e.currentTarget.style.color = '#4e260f';
                e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {icon}
        </a>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li style={{ marginBottom: '12px' }}>
            <Link href={href} style={{
                color: '#B3B3B3',
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'color 0.2s ease'
            }}
                className="hover:text-white"
                onMouseOver={(e) => e.currentTarget.style.color = '#ff9f68'}
                onMouseOut={(e) => e.currentTarget.style.color = '#B3B3B3'}
            >
                {children}
            </Link>
        </li>
    );
}
