import React from 'react';
import Link from 'next/link';
import { Shield, ChevronLeft } from 'lucide-react';
import Footer from '../components/Footer';

export const metadata = {
    title: 'Privacy Policy | Spinyl',
    description: 'Privacy Policy for Spinyl and Moctale.in',
};

export default function PrivacyPage() {
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
                    <Shield size={32} style={{ color: '#8b5cf6' }} />
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>Privacy Policy</h1>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.45)', margin: '0 0 40px 0' }}>Last updated: October 24, 2025</p>

                <div className="policy-content">
                    <h3>Introduction</h3>
                    <p>Men of Culture Media Pvt. Ltd. ("we," "our," or "us") operates the website Moctale.in (the "Site"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Site.</p>
                    <p>Please read this Privacy Policy carefully. By accessing or using our Site, you agree to the terms of this Privacy Policy. If you do not agree with the terms, please do not access the Site.</p>

                    <h3>Information We Collect</h3>
                    
                    <h4>Personal Information</h4>
                    <p>We collect the following personal information from users:</p>
                    <ul className="purple-bullet-list">
                        <li><strong>Name:</strong> Used for account identification and personalization</li>
                        <li><strong>Phone Number:</strong> Used for account verification and communication purposes</li>
                    </ul>

                    <h4>User-Generated Content</h4>
                    <p>We collect and retain all content you create, post, or upload on our Site, including:</p>
                    <ul className="purple-bullet-list">
                        <li>Posts, comments, and other user-generated content</li>
                        <li>Content that has been deleted by users (retained for safety, legal, and platform integrity purposes)</li>
                    </ul>

                    <h4>Cookies and Authentication Data</h4>
                    <p>We use cookies to:</p>
                    <ul className="purple-bullet-list">
                        <li>Maintain user authentication sessions</li>
                        <li>Ensure secure access to your account</li>
                        <li>Improve user experience on the Site</li>
                    </ul>
                    <p>These cookies are essential for the functioning of the Site and do not track your browsing activity across other websites.</p>

                    <h3>How We Use Your Information</h3>
                    <p>We use the information we collect for the following purposes:</p>
                    <ul className="purple-bullet-list">
                        <li>To create and manage your account</li>
                        <li>To authenticate and verify your identity</li>
                        <li>To communicate with you regarding your account or services</li>
                        <li>To provide customer support</li>
                        <li>To improve our Site and services</li>
                        <li>To comply with legal obligations</li>
                        <li>To monitor and enforce our Terms of Service and Community Guidelines</li>
                        <li>To investigate potential violations of our policies, including content that has been deleted</li>
                        <li>To maintain platform safety and integrity</li>
                        <li>To take appropriate action, including account suspension or banning, for policy violations (even for deleted content)</li>
                    </ul>

                    <h3>Content Deletion and Retention</h3>
                    <p>When you delete content from our Site:</p>
                    <ul className="purple-bullet-list">
                        <li>The content is removed from public view but is retained in our systems</li>
                        <li>Deleted content may be retained indefinitely for:
                            <ul className="sub-bullet-list">
                                <li>Legal compliance and evidence preservation</li>
                                <li>Platform safety and security</li>
                                <li>Policy violation investigations</li>
                                <li>Prevention of abuse and harmful behavior</li>
                            </ul>
                        </li>
                    </ul>
                    <p><strong>Important:</strong> Users may be subject to account sanctions, including suspension or permanent banning, for content that violates our policies, regardless of whether such content has been deleted. Deletion of content does not exempt users from responsibility for policy violations.</p>

                    <h3>Data Storage and Security</h3>
                    <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
                    <p>Your personal information is stored securely and is accessible only to authorized personnel who require access to perform their duties.</p>

                    <h3>Your Rights</h3>
                    <p>Under applicable Indian data protection laws, you have the following rights:</p>
                    <ul className="purple-bullet-list">
                        <li><strong>Right to Access:</strong> You may request access to the personal information we hold about you</li>
                        <li><strong>Right to Correction:</strong> You may request correction of inaccurate or incomplete information</li>
                        <li><strong>Right to Deletion:</strong> You may request deletion of your personal information, subject to legal obligations</li>
                        <li><strong>Right to Withdraw Consent:</strong> You may withdraw your consent for data processing at any time</li>
                    </ul>
                    <p>If your account is suspended due to illegal activity, we reserve the right to retain account data and deny deletion requests for legal compliance and evidentiary purposes.</p>
                    <p><strong>Please note:</strong> The right to deletion does not extend to user-generated content that has been removed from public view but is retained for the purposes outlined in this policy. Such content may be retained even after account deletion for legal and safety purposes.</p>

                    <h3>Third-Party Disclosure</h3>
                    <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:</p>
                    <ul className="purple-bullet-list">
                        <li>When required by law or legal process</li>
                        <li>To protect our rights, property, or safety, or that of our users</li>
                        <li>With service providers who assist us in operating our Site, subject to confidentiality obligations</li>
                    </ul>

                    <h3>Contact Information</h3>
                    <div className="policy-highlight-box">
                        <p>If you have any questions about this Privacy Policy, please contact us:</p>
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
