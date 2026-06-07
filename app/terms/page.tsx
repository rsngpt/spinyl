import React from 'react';
import Link from 'next/link';
import { FileText, ChevronLeft } from 'lucide-react';
import Footer from '../components/Footer';

export const metadata = {
    title: 'Terms of Service | Spinyl',
    description: 'Terms of Service for Spinyl and Moctale.in',
};

export default function TermsPage() {
    return (
        <div style={{ backgroundColor: '#000000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, padding: '120px 20px 80px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'rgba(255, 255, 255, 0.45)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    marginBottom: '32px',
                    transition: 'color 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)'}
                >
                    <ChevronLeft size={16} />
                    Back to Home
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <FileText size={32} style={{ color: '#8b5cf6' }} />
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>Terms of Service</h1>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.45)', margin: '0 0 40px 0' }}>Last updated: October 24, 2025</p>

                <div className="policy-content">
                    <h3>1. Acceptance of Terms</h3>
                    <p>Welcome to Moctale.in ("Site"), operated by Men of Culture Media Pvt. Ltd. ("Company," "we," "us," or "our"). By accessing or using our Site, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Site.</p>

                    <h3>2. Description of Service</h3>
                    <p>Moctale.in is a movie database platform that provides information, reviews, and discussions about films and entertainment content. Our Site serves as an informational resource for movie enthusiasts to explore, discover, and discuss cinema.</p>

                    <h3>3. Use of Content and Intellectual Property</h3>
                    
                    <h4>3.1 Fair Use and Information Purpose</h4>
                    <p>The images, names, titles, and other content related to movies and entertainment displayed on our Site are used solely for informational, educational, and discussion purposes. Such use falls under the fair use provisions of Indian copyright law, specifically:</p>
                    <ul className="purple-bullet-list">
                        <li>Content is used for commentary, criticism, and review purposes</li>
                        <li>Usage is transformative and adds value through our database, reviews, and discussions</li>
                        <li>Content is used to identify and discuss the subject matter</li>
                        <li>No commercial exploitation of the original works is intended</li>
                    </ul>

                    <h4>3.2 Copyright Disclaimer</h4>
                    <p>All movie titles, images, artwork, logos, and related materials displayed on this Site are the property of their respective copyright owners. We do not claim ownership of any such content. These materials are used under the principles of fair dealing as provided under Section 52 of the Indian Copyright Act, 1957, for purposes of:</p>
                    <ul className="purple-bullet-list">
                        <li>Providing information about films and entertainment</li>
                        <li>Facilitating discussion and criticism</li>
                        <li>Educational purposes</li>
                        <li>News reporting and commentary</li>
                    </ul>

                    <h4>3.3 Anti-Piracy Statement</h4>
                    <p><strong>IMPORTANT: We Do Not Promote or Support Piracy</strong></p>
                    <p>Moctale.in strictly opposes piracy and copyright infringement. Our Site does not:</p>
                    <ul className="purple-bullet-list">
                        <li>Host, store, or provide access to pirated content</li>
                        <li>Provide links to download or stream copyrighted content illegally</li>
                        <li>Encourage or facilitate copyright infringement in any manner</li>
                        <li>Provide tools or methods to access pirated content</li>
                    </ul>
                    <p>We respect intellectual property rights and encourage all users to consume content through legitimate, authorized channels such as theaters, official streaming platforms, and legal distributors.</p>

                    <h3>4. User Conduct</h3>
                    <p>By using our Site, you agree to:</p>
                    <ul className="purple-bullet-list">
                        <li>Use the Site only for lawful purposes and in accordance with these Terms</li>
                        <li>Not engage in any activity that infringes upon the rights of others</li>
                        <li>Not upload, post, or share any content that promotes piracy or copyright infringement</li>
                        <li>Not use the Site to distribute or link to pirated content</li>
                        <li>Not attempt to circumvent any security features of the Site</li>
                        <li>Not engage in harassment, hate speech, or abusive behavior</li>
                        <li>Respect the intellectual property rights of content creators and copyright holders</li>
                        <li>Comply with all Club rules and community guidelines established by the Site</li>
                    </ul>

                    <h3>5. User-Generated Content</h3>
                    
                    <h4>5.1 User Responsibilities</h4>
                    <p>If you submit reviews, comments, or other content to our Site, you agree that:</p>
                    <ul className="purple-bullet-list">
                        <li>You own or have the right to share such content</li>
                        <li>Your content does not infringe upon any third-party rights</li>
                        <li>Your content does not promote or facilitate piracy</li>
                        <li>Your content complies with all applicable laws and regulations</li>
                    </ul>

                    <h4>5.2 Content Moderation and User Bans</h4>
                    <p>We reserve the right to remove any content and ban users who:</p>
                    <ul className="purple-bullet-list">
                        <li>Post illegal content, including but not limited to content promoting piracy, violence, hate speech, or obscenity</li>
                        <li>Violate these Terms of Service</li>
                        <li>Engage in harassment, abuse, or threatening behavior</li>
                        <li>Post spam or engage in fraudulent activities</li>
                    </ul>
                    <p>User bans may be temporary or permanent, at our sole discretion. We are not obligated to provide warnings before banning a user.</p>

                    <h4>5.3 Account Management Rights</h4>
                    <div className="policy-highlight-box">
                        <h5>Account Update and Deletion Rights</h5>
                        <p>You can only request updates or deletion of your account as long as you are an active user. Once your account is blocked for illegal activity, your account will be blocked and not changed for legal proof purposes.</p>
                        <p>We reserve the right to maintain account records and data for legal compliance, security purposes, and to prevent fraudulent activities.</p>
                    </div>

                    <h3>6. Age Requirements</h3>
                    <p>You must be at least 18 years old to use this Site, or have obtained consent from your parent or legal guardian. By using this Site, you represent and warrant that you meet this age requirement or have obtained such consent.</p>

                    <h3>7. Changes to Terms and Service Updates</h3>
                    <p>We reserve the right to update, modify, or change these Terms of Service at any time without prior notice. Any changes will be effective immediately upon posting on our Site.</p>
                    <div className="policy-highlight-box">
                        <h5>Right to Update Terms</h5>
                        <p>We have the right to update our terms and conditions as needed to reflect changes in our services, legal requirements, or business practices.</p>
                    </div>

                    <h3>8. Governing Law and Dispute Resolution</h3>
                    <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Delhi, India.</p>

                    <h3>9. Contact Information</h3>
                    <div className="policy-highlight-box">
                        <p>If you have any questions about these Terms of Service, please contact us:</p>
                        <p><strong>Spinyl Pvt. Ltd.</strong></p>
                        <p>Email: spinylchord@gmail.com</p>
                    </div>
                </div>
            </div>
            
            <Footer />

            <style>{`
                .policy-content {
                    font-size: 0.95rem;
                    color: rgba(255, 255, 255, 0.65);
                    line-height: 1.6;
                }

                .policy-content h3 {
                    color: #ffffff;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 32px 0 16px 0;
                }

                .policy-content h4 {
                    color: #ffffff;
                    font-size: 1.05rem;
                    font-weight: 600;
                    margin: 24px 0 12px 0;
                }

                .policy-content p {
                    margin-bottom: 16px;
                }

                .purple-bullet-list {
                    list-style: none;
                    padding-left: 0;
                    margin: 0 0 20px 0;
                }

                .purple-bullet-list li {
                    position: relative;
                    padding-left: 20px;
                    margin-bottom: 8px;
                }

                .purple-bullet-list li::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #8b5cf6;
                    font-weight: bold;
                    font-size: 1.2rem;
                    line-height: 1;
                    top: -1px;
                }

                .purple-bullet-list li strong {
                    color: #8b5cf6;
                    font-weight: 600;
                }

                .policy-highlight-box {
                    background-color: #121212;
                    border: 1px solid #242424;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 24px 0;
                }

                .policy-highlight-box h5 {
                    color: #ffffff;
                    font-size: 1rem;
                    font-weight: 700;
                    margin: 0 0 12px 0;
                }

                .policy-highlight-box p {
                    color: rgba(255, 255, 255, 0.65);
                    font-size: 0.92rem;
                    margin: 0 0 8px 0;
                    line-height: 1.5;
                }

                .policy-highlight-box p strong {
                    color: #ffffff;
                }

                .policy-highlight-box p:last-child {
                    margin-bottom: 0;
                }

                .sub-bullet-list {
                    list-style: none;
                    padding-left: 0;
                    margin: 8px 0 0 0;
                }

                .sub-bullet-list li {
                    position: relative;
                    padding-left: 16px;
                    margin-bottom: 6px;
                }

                .sub-bullet-list li::before {
                    content: "-";
                    position: absolute;
                    left: 0;
                    color: rgba(255, 255, 255, 0.4);
                }
            `}</style>
        </div>
    );
}
