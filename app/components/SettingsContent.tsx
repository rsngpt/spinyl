'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, Lock, Activity, ChevronLeft, Save, Bell, Sparkles, Mail,
    MessageSquare, AlertTriangle, Shield, FileText, Instagram, Youtube, Twitter,
    Info, ChevronRight, X, Star, AlertCircle
} from 'lucide-react';
import DefaultAvatar from './DefaultAvatar';
import { updateProfile } from '@/app/actions/profile';

// Custom SVG Icons
const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 127.14 96.36" width="18" height="18" fill="currentColor" {...props}>
        <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.4-5c.9-.66,1.76-1.37,2.58-2.1a75.52,75.52,0,0,0,72.6,0c.82.73,1.68,1.44,2.58,2.1a68.43,68.43,0,0,1-10.4,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,122.85,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
    </svg>
);

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

type SettingsContentProps = {
    user: any;
    initialProfile: any;
    initialTab?: string;
};

type FAQItem = {
    q: string;
    a: string;
};

const FAQ_DATA: FAQItem[] = [
    {
        q: "What is Profile Health?",
        a: "Profile Health is a dashboard tool designed to keep you updated on your compliance with community standards. It summarizes active warnings or flags linked to your generated contents or interactions."
    },
    {
        q: "What types of content can result in a strike?",
        a: "Any content violating our terms of service, including inappropriate language, spamming review logs, copyright violations of album artwork, harassment, or abusive tags, can trigger account warnings or strikes."
    },
    {
        q: "How does the strike system work?",
        a: "Our community team reviews reports. If a violation is confirmed, you will receive an active strike. The system enforces progressive restrictions based on the count of active strikes."
    },
    {
        q: "What happens when I receive my first strike?",
        a: "A first strike serves as a formal warning. The violating content is removed, and a lock may temporarily restrict customization privileges for up to 48 hours."
    },
    {
        q: "What are the penalties for subsequent strikes?",
        a: "A second strike restricts review publishing for 7 days. A third strike results in permanent suspension of your profile and login access."
    },
    {
        q: "Are strikes permanent?",
        a: "Yes, strikes remain logged on your account. However, clean standing for 90 consecutive days will prevent additional automated escalations."
    },
    {
        q: "Can I appeal or remove a strike from my account?",
        a: "Yes. You can file an appeal request via the 'Give Feedback' or 'Your Issues' panel. Our moderation board will re-evaluate the case within 3-5 business days."
    },
    {
        q: "How can I avoid receiving strikes?",
        a: "Ensure your bio, reviews, and track discussions adhere to standard guidelines. Avoid unauthorized uploads or scraping, and maintain friendly community conduct."
    },
    {
        q: "Where can I view my Profile Health status?",
        a: "Your status can always be accessed directly here on the Settings dashboard under the 'Profile Health' tab."
    }
];

export default function SettingsContent({ user, initialProfile, initialTab }: SettingsContentProps) {
    const router = useRouter();
    const [profile, setProfile] = useState(initialProfile);
    const [activeTab, setActiveTab] = useState(initialTab || 'edit-profile');

    // Split full_name into first and last names for editing
    const nameParts = (profile?.full_name || '').trim().split(' ');
    const initFirst = nameParts[0] || '';
    const initLast = nameParts.slice(1).join(' ') || '';

    const [firstName, setFirstName] = useState(initFirst);
    const [lastName, setLastName] = useState(initLast);
    const [dob, setDob] = useState(user?.user_metadata?.dob || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [username, setUsername] = useState(profile?.username || '');

    // Social Links
    const [instagram, setInstagram] = useState(user?.user_metadata?.instagram || '');
    const [twitter, setTwitter] = useState(user?.user_metadata?.twitter || '');
    const [youtube, setYoutube] = useState(user?.user_metadata?.youtube || '');

    // FAQ Accordion index
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    // Feedback modal states
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackStep, setFeedbackStep] = useState(1); // 1, 2, 3, 4 (success)
    
    // Step 1: App Experience
    const [ratingsStep1, setRatingsStep1] = useState<{ [key: string]: number }>({
        ease: 0,
        speed: 0,
        bugs: 0,
        visuals: 0
    });

    // Step 2: Content Quality
    const [ratingsStep2, setRatingsStep2] = useState<{ [key: string]: number }>({
        freshness: 0,
        accuracy: 0,
        writing: 0,
        images: 0
    });

    // Step 3: Additional Feedback
    const [whatLike, setWhatLike] = useState('');
    const [whatImprove, setWhatImprove] = useState('');
    const [suggestions, setSuggestions] = useState('');
    const [consent, setConsent] = useState(false);

    // Issues list (dynamically showing user submitted feedback)
    const [issues, setIssues] = useState<Array<{ id: string; title: string; type: string; status: string; date: string }>>([]);

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null);
    const [compressedFile, setCompressedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image Compression Helper
    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 500;
                const MAX_HEIGHT = 500;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const newFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        reject(new Error('Canvas to Blob failed'));
                    }
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setCompressedFile(compressed);
                const objectUrl = URL.createObjectURL(compressed);
                setPreviewUrl(objectUrl);
            } catch (err) {
                console.error("Compression failed", err);
                setCompressedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        setErrorMsg(null);

        const formData = new FormData();
        formData.append('username', username);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('dob', dob);
        formData.append('bio', bio);
        formData.append('instagram', instagram ? (instagram.startsWith('@') ? instagram : `@ ${instagram}`) : '');
        formData.append('twitter', twitter ? (twitter.startsWith('@') ? twitter : `@ ${twitter}`) : '');
        formData.append('youtube', youtube ? (youtube.startsWith('@') ? youtube : `@ ${youtube}`) : '');
        if (compressedFile) {
            formData.append('avatar', compressedFile);
        }

        try {
            const result = await updateProfile(null, formData);
            if (result.success) {
                setMessage('Changes saved successfully!');
                if (result.data) {
                    setProfile({
                        ...profile,
                        username: result.data.username,
                        full_name: result.data.full_name,
                        bio: result.data.bio,
                        avatar_url: result.data.avatar_url || profile?.avatar_url
                    });
                }
                setTimeout(() => setMessage(null), 3000);
            } else {
                setErrorMsg(result.message || 'Failed to update settings');
            }
        } catch (error) {
            setErrorMsg('An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFaqToggle = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handleStarClickStep1 = (category: string, rating: number) => {
        setRatingsStep1(prev => ({ ...prev, [category]: rating }));
    };

    const handleStarClickStep2 = (category: string, rating: number) => {
        setRatingsStep2(prev => ({ ...prev, [category]: rating }));
    };

    const submitFeedback = () => {
        const newIssue = {
            id: (issues.length + 1).toString(),
            title: `Feedback: App Experience & Content Quality (${ratingsStep1.visuals}★ Design / ${ratingsStep2.writing}★ Content)`,
            type: 'feedback',
            status: 'Pending Review',
            date: new Date().toLocaleDateString()
        };
        setIssues(prev => [newIssue, ...prev]);

        // Proceed to success step
        setFeedbackStep(4);
    };

    const closeFeedback = () => {
        setShowFeedbackModal(false);
        // Reset states
        setFeedbackStep(1);
        setRatingsStep1({ ease: 0, speed: 0, bugs: 0, visuals: 0 });
        setRatingsStep2({ freshness: 0, accuracy: 0, writing: 0, images: 0 });
        setWhatLike('');
        setWhatImprove('');
        setSuggestions('');
        setConsent(false);
    };

    return (
        <div className="settings-page-wrapper">
            <div className="settings-content-container">
                {/* Left Sidebar */}
                <div className="settings-sidebar">
                    <h2 className="sidebar-title">Settings</h2>
                    <div className="sidebar-menu">
                        <button
                            type="button"
                            className={`sidebar-menu-btn ${activeTab === 'edit-profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('edit-profile')}
                        >
                            <div className="sidebar-btn-content">
                                <User size={18} />
                                <span>Edit profile</span>
                            </div>
                            {activeTab === 'edit-profile' && <ChevronRight size={14} className="active-arrow" />}
                        </button>
                        
                        <button
                            type="button"
                            className={`sidebar-menu-btn ${activeTab === 'profile-health' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile-health')}
                        >
                            <div className="sidebar-btn-content">
                                <Activity size={18} />
                                <span>Profile Health</span>
                            </div>
                            {activeTab === 'profile-health' && <ChevronRight size={14} className="active-arrow" />}
                        </button>

                        <button
                            type="button"
                            className={`sidebar-menu-btn ${activeTab === 'change-username' ? 'active' : ''}`}
                            onClick={() => setActiveTab('change-username')}
                        >
                            <div className="sidebar-btn-content">
                                <Lock size={18} />
                                <span>Change Username</span>
                            </div>
                            {activeTab === 'change-username' && <ChevronRight size={14} className="active-arrow" />}
                        </button>

                        <div className="menu-divider">MORE</div>

                        <a href="https://discord.gg/spinyl" target="_blank" rel="noopener noreferrer" className="sidebar-menu-link">
                            <div className="sidebar-btn-content">
                                <DiscordIcon />
                                <span>Join Discord</span>
                            </div>
                        </a>
                        
                        <a href="https://wa.me/spinyl" target="_blank" rel="noopener noreferrer" className="sidebar-menu-link">
                            <div className="sidebar-btn-content">
                                <WhatsappIcon />
                                <span>Join Whatsapp</span>
                            </div>
                        </a>

                        <a href="https://instagram.com/spinyl" target="_blank" rel="noopener noreferrer" className="sidebar-menu-link">
                            <div className="sidebar-btn-content">
                                <Instagram size={18} />
                                <span>Follow on Instagram</span>
                            </div>
                        </a>

                        <button
                            type="button"
                            className={`sidebar-menu-btn ${activeTab === 'your-issues' ? 'active' : ''}`}
                            onClick={() => setActiveTab('your-issues')}
                        >
                            <div className="sidebar-btn-content">
                                <AlertTriangle size={18} />
                                <span>Your Issues</span>
                            </div>
                            {activeTab === 'your-issues' && <ChevronRight size={14} className="active-arrow" />}
                        </button>

                        <button
                            type="button"
                            className="sidebar-menu-btn"
                            onClick={() => setShowFeedbackModal(true)}
                        >
                            <div className="sidebar-btn-content">
                                <MessageSquare size={18} />
                                <span>Give Feedback</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={`sidebar-menu-btn ${activeTab === 'privacy-policy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('privacy-policy')}
                        >
                            <div className="sidebar-btn-content">
                                <Shield size={18} />
                                <span>Privacy Policy</span>
                            </div>
                            {activeTab === 'privacy-policy' && <ChevronRight size={14} className="active-arrow" />}
                        </button>

                        <button
                            type="button"
                            className={`sidebar-menu-btn ${activeTab === 'terms-service' ? 'active' : ''}`}
                            onClick={() => setActiveTab('terms-service')}
                        >
                            <div className="sidebar-btn-content">
                                <FileText size={18} />
                                <span>Terms of Service</span>
                            </div>
                            {activeTab === 'terms-service' && <ChevronRight size={14} className="active-arrow" />}
                        </button>
                    </div>
                </div>

                {/* Right Content Panel */}
                <div className="settings-main-panel">
                    {/* TAB 1: EDIT PROFILE */}
                    {activeTab === 'edit-profile' && (
                        <form onSubmit={handleSave}>
                            <h2 className="panel-title">Edit Profile</h2>

                            {/* Profile Photo Block */}
                            <div className="photo-upload-section">
                                <div className="avatar-preview-wrapper" onClick={() => fileInputRef.current?.click()}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Profile Photo" className="avatar-img" />
                                    ) : (
                                        <div className="avatar-fallback">
                                            <DefaultAvatar fill="currentColor" />
                                        </div>
                                    )}
                                </div>
                                <div className="photo-info-block">
                                    <span className="photo-label">Profile photo</span>
                                    <button type="button" className="photo-upload-link" onClick={() => fileInputRef.current?.click()}>
                                        Upload a new profile photo
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept="image/*" 
                                        hidden 
                                    />
                                </div>
                            </div>

                            {/* Form Input Fields Grid */}
                            <div className="form-fields-grid">
                                <div className="field-row">
                                    <label className="field-label">First name</label>
                                    <div className="input-container">
                                        <input 
                                            type="text" 
                                            value={firstName} 
                                            onChange={(e) => setFirstName(e.target.value)} 
                                            placeholder="First name"
                                        />
                                    </div>
                                </div>

                                <div className="field-row">
                                    <label className="field-label">Last name</label>
                                    <div className="input-container">
                                        <input 
                                            type="text" 
                                            value={lastName} 
                                            onChange={(e) => setLastName(e.target.value)} 
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>

                                <div className="field-row">
                                    <label className="field-label">Date of birth</label>
                                    <div className="input-with-subtext">
                                        <div className="input-container">
                                            <input 
                                                type="text" 
                                                value={dob} 
                                                onChange={(e) => setDob(e.target.value)} 
                                                placeholder="DD/MM/YYYY"
                                            />
                                        </div>
                                        <span className="field-subtext">This won't be shown publicly. Enter in DD/MM/YYYY format.</span>
                                    </div>
                                </div>

                                <div className="field-row align-start">
                                    <label className="field-label pt-2">Bio</label>
                                    <div className="input-with-subtext">
                                        <textarea 
                                            value={bio} 
                                            onChange={(e) => setBio(e.target.value)} 
                                            placeholder="Love to watch every kind of cinema..."
                                            rows={4}
                                        />
                                        <span className="field-subtext">Write a short bio to tell people more about yourself.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links Sub-Section */}
                            <h3 className="section-subtitle">Social Links</h3>

                            <div className="form-fields-grid">
                                <div className="field-row">
                                    <label className="field-label">Instagram</label>
                                    <div className="input-container social-input">
                                        <span className="input-prefix">@</span>
                                        <input 
                                            type="text" 
                                            value={instagram.replace(/^@\s*/, '')} 
                                            onChange={(e) => setInstagram(e.target.value)} 
                                            placeholder="username or paste Instagram profile URL"
                                        />
                                    </div>
                                </div>

                                <div className="field-row">
                                    <label className="field-label">X / Twitter</label>
                                    <div className="input-container social-input">
                                        <span className="input-prefix">@</span>
                                        <input 
                                            type="text" 
                                            value={twitter.replace(/^@\s*/, '')} 
                                            onChange={(e) => setInstagram(e.target.value)} 
                                            placeholder="username or paste X/Twitter profile URL"
                                        />
                                    </div>
                                </div>

                                <div className="field-row">
                                    <label className="field-label">YouTube</label>
                                    <div className="input-container social-input">
                                        <span className="input-prefix">@</span>
                                        <input 
                                            type="text" 
                                            value={youtube.replace(/^@\s*/, '')} 
                                            onChange={(e) => setYoutube(e.target.value)} 
                                            placeholder="username or paste YouTube channel URL"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Bar Footer */}
                            <div className="action-bar-footer">
                                {message && <div className="toast success-toast">{message}</div>}
                                {errorMsg && <div className="toast error-toast">{errorMsg}</div>}
                                <button type="submit" disabled={isSaving} className="save-btn">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 2: PROFILE HEALTH */}
                    {activeTab === 'profile-health' && (
                        <div>
                            <div className="health-header-row">
                                <h2 className="panel-title m-0">Profile Health</h2>
                                <div className="status-indicator-capsule">
                                    <div className="indicator-segment active-status" title="Account in Good Standing">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                        </svg>
                                    </div>
                                    <div className="indicator-segment warning-status" title="Warnings Active">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                        </svg>
                                    </div>
                                    <div className="indicator-segment danger-status" title="Critical Status / Banned">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5c0-1.84.89-3.56 2.4-4.64l1.41 1.41C4.7 6.13 4 7.24 4 8.5c0 2.82 2.72 5.64 7.45 9.94L12 18.94l.55-.5c4.73-4.3 7.45-7.12 7.45-9.94 0-1.26-.7-2.37-1.81-3.23l1.41-1.41C21.11 4.94 22 6.66 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zm5.83-16.1l-11.66 11.66c-.39-.39-.39-1.02 0-1.41L16.42 3.84c.39-.39 1.02-.39 1.41 0z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <p className="health-description">
                                <Info size={16} className="inline-info-icon" />
                                <span>Strikes are given when other users report your content for violating community guidelines. Strikes are permanent and remain on your account.</span>
                            </p>

                            <div className="standing-banner">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                <span>Your account is in good standing with no active strikes.</span>
                            </div>

                            <h3 className="section-subtitle">Active Strikes (0)</h3>
                            <div className="strikes-placeholder-box">
                                No active strikes.
                            </div>

                            <h3 className="section-subtitle" style={{ marginTop: '36px' }}>Frequently Asked Questions</h3>
                            <div className="faq-list">
                                {FAQ_DATA.map((faq, index) => (
                                    <div key={index} className="faq-item-card">
                                        <div className="faq-item-header" onClick={() => handleFaqToggle(index)}>
                                            <div className="faq-q-left">
                                                <div className="faq-index-circle">{index + 1}</div>
                                                <span className="faq-question-text">{faq.q}</span>
                                            </div>
                                            <span className="faq-toggle-plus">{openFaqIndex === index ? '−' : '+'}</span>
                                        </div>
                                        {openFaqIndex === index && (
                                            <div className="faq-item-body">
                                                <p>{faq.a}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: CHANGE USERNAME */}
                    {activeTab === 'change-username' && (
                        <div>
                            <h2 className="panel-title">Change Username</h2>
                            <div className="form-fields-grid" style={{ marginBottom: '24px' }}>
                                <div className="field-row">
                                    <label className="field-label">New Username</label>
                                    <div className="input-container">
                                        <input 
                                            type="text" 
                                            value={username} 
                                            onChange={(e) => setUsername(e.target.value)} 
                                            placeholder="Username"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="action-bar-footer">
                                {message && <div className="toast success-toast">{message}</div>}
                                {errorMsg && <div className="toast error-toast">{errorMsg}</div>}
                                <button type="button" onClick={handleSave} disabled={isSaving} className="save-btn">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: YOUR ISSUES */}
                    {activeTab === 'your-issues' && (
                        <div>
                            <h2 className="panel-title m-0">My Issues</h2>
                            <p className="tab-description-sub">Track the status of your submitted issues and feedback.</p>

                            {issues.length === 0 ? (
                                <div className="issues-empty-box">
                                    <AlertCircle size={48} className="empty-warning-icon" />
                                    <h3>No issues found</h3>
                                    <p>You haven't submitted any issues or feedback yet.</p>
                                </div>
                            ) : (
                                <div className="issues-submitted-list">
                                    {issues.map((issue) => (
                                        <div key={issue.id} className="submitted-issue-card">
                                            <div className="issue-details-main">
                                                <h4>{issue.title}</h4>
                                                <span className="issue-meta">Submitted on {issue.date} • Type: {issue.type}</span>
                                            </div>
                                            <div className="issue-status-badge">{issue.status}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 5: PRIVACY POLICY */}
                    {activeTab === 'privacy-policy' && (
                        <div>
                            <div className="title-with-icon-row">
                                <Shield size={26} className="title-purple-icon" />
                                <h2 className="panel-title m-0">Privacy Policy</h2>
                            </div>
                            <p className="last-updated-text">Last updated: October 24, 2025</p>

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
                    )}

                    {/* TAB 6: TERMS OF SERVICE */}
                    {activeTab === 'terms-service' && (
                        <div>
                            <div className="title-with-icon-row">
                                <FileText size={26} className="title-purple-icon" />
                                <h2 className="panel-title m-0">Terms of Service</h2>
                            </div>
                            <p className="last-updated-text">Last updated: October 24, 2025</p>

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
                    )}
                </div>
            </div>

            {/* FEEDBACK OVERLAY MODAL */}
            {showFeedbackModal && (
                <div className="modal-backdrop-overlay">
                    <div className="feedback-modal-card">
                        <button className="modal-close-x" onClick={closeFeedback}>
                            <X size={20} />
                        </button>
                        
                        {/* STEP 1: APP EXPERIENCE */}
                        {feedbackStep === 1 && (
                            <>
                                <h3 className="modal-header-title">App Experience</h3>
                                <div className="step-progress-row">
                                    <span className="step-label">Step 1 of 3</span>
                                    <span className="step-percentage">33%</span>
                                </div>
                                <div className="progress-bar-track">
                                    <div className="progress-bar-fill w-33"></div>
                                </div>

                                <div className="rating-questions-container">
                                    {/* Question 1 */}
                                    <div className="rating-question-row">
                                        <span className="question-title">How easy is it to use our app? *</span>
                                        <div className="stars-list">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${ratingsStep1.ease >= star ? 'selected' : ''}`}
                                                    onClick={() => handleStarClickStep1('ease', star)}
                                                >
                                                    <Star size={20} fill={ratingsStep1.ease >= star ? '#f43f5e' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Question 2 */}
                                    <div className="rating-question-row">
                                        <span className="question-title">How fast does our app perform? *</span>
                                        <div className="stars-list">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${ratingsStep1.speed >= star ? 'selected' : ''}`}
                                                    onClick={() => handleStarClickStep1('speed', star)}
                                                >
                                                    <Star size={20} fill={ratingsStep1.speed >= star ? '#f43f5e' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Question 3 */}
                                    <div className="rating-question-row">
                                        <span className="question-title">How bug-free is our app? *</span>
                                        <div className="stars-list">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${ratingsStep1.bugs >= star ? 'selected' : ''}`}
                                                    onClick={() => handleStarClickStep1('bugs', star)}
                                                >
                                                    <Star size={20} fill={ratingsStep1.bugs >= star ? '#f43f5e' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Question 4 */}
                                    <div className="rating-question-row">
                                        <span className="question-title">How would you rate our app's visual design? *</span>
                                        <div className="stars-list">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${ratingsStep1.visuals >= star ? 'selected' : ''}`}
                                                    onClick={() => handleStarClickStep1('visuals', star)}
                                                >
                                                    <Star size={20} fill={ratingsStep1.visuals >= star ? '#f43f5e' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer-btn-row">
                                    <button 
                                        type="button" 
                                        onClick={() => setFeedbackStep(2)} 
                                        disabled={!ratingsStep1.ease || !ratingsStep1.speed || !ratingsStep1.bugs || !ratingsStep1.visuals}
                                        className="modal-next-btn"
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP 2: CONTENT QUALITY */}
                        {feedbackStep === 2 && (
                            <>
                                <h3 className="modal-header-title">Content Quality</h3>
                                <div className="step-progress-row">
                                    <span className="step-label">Step 2 of 3</span>
                                    <span className="step-percentage">67%</span>
                                </div>
                                <div className="progress-bar-track">
                                    <div className="progress-bar-fill w-67"></div>
                                </div>

                                <div className="rating-questions-container">
                                    {/* Question 1 */}
                                    <div className="rating-question-row">
                                        <span className="question-title">How up-to-date is our content? *</span>
                                        <div className="stars-list">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${ratingsStep2.freshness >= star ? 'selected' : ''}`}
                                                    onClick={() => handleStarClickStep2('freshness', star)}
                                                >
                                                    <Star size={20} fill={ratingsStep2.freshness >= star ? '#f43f5e' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Question 2 */}
                                    <div className="rating-question-row">
                                        <span className="question-title">How accurate is our content? *</span>
                                        <div className="stars-list">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${ratingsStep2.accuracy >= star ? 'selected' : ''}`}
                                                    onClick={() => handleStarClickStep2('accuracy', star)}
                                                >
                                                    <Star size={20} fill={ratingsStep2.accuracy >= star ? '#f43f5e' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Question 3 */}
                                    <div className="rating-question-row">
                                        <span className="question-title">How would you rate our content writing? *</span>
                                        <div className="stars-list">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${ratingsStep2.writing >= star ? 'selected' : ''}`}
                                                    onClick={() => handleStarClickStep2('writing', star)}
                                                >
                                                    <Star size={20} fill={ratingsStep2.writing >= star ? '#f43f5e' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Question 4 */}
                                    <div className="rating-question-row">
                                        <span className="question-title">How would you rate our content images? *</span>
                                        <div className="stars-list">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${ratingsStep2.images >= star ? 'selected' : ''}`}
                                                    onClick={() => handleStarClickStep2('images', star)}
                                                >
                                                    <Star size={20} fill={ratingsStep2.images >= star ? '#f43f5e' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer-btn-row">
                                    <button type="button" onClick={() => setFeedbackStep(1)} className="modal-back-btn">
                                        Back
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setFeedbackStep(3)} 
                                        disabled={!ratingsStep2.freshness || !ratingsStep2.accuracy || !ratingsStep2.writing || !ratingsStep2.images}
                                        className="modal-next-btn"
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP 3: ADDITIONAL FEEDBACK */}
                        {feedbackStep === 3 && (
                            <>
                                <h3 className="modal-header-title">Additional Feedback</h3>
                                <div className="step-progress-row">
                                    <span className="step-label">Step 3 of 3</span>
                                    <span className="step-percentage">100%</span>
                                </div>
                                <div className="progress-bar-track">
                                    <div className="progress-bar-fill w-100"></div>
                                </div>

                                <div className="rating-questions-container textareas-container">
                                    <div className="feedback-textarea-row">
                                        <span className="question-title">What do you like about our app?</span>
                                        <textarea
                                            value={whatLike}
                                            onChange={(e) => setWhatLike(e.target.value)}
                                            placeholder="Optional"
                                            rows={3}
                                            className="modal-textarea"
                                        />
                                    </div>

                                    <div className="feedback-textarea-row">
                                        <span className="question-title">What could be improved?</span>
                                        <textarea
                                            value={whatImprove}
                                            onChange={(e) => setWhatImprove(e.target.value)}
                                            placeholder="Optional"
                                            rows={3}
                                            className="modal-textarea"
                                        />
                                    </div>

                                    <div className="feedback-textarea-row">
                                        <span className="question-title">Any suggestions for us?</span>
                                        <textarea
                                            value={suggestions}
                                            onChange={(e) => setSuggestions(e.target.value)}
                                            placeholder="Optional"
                                            rows={3}
                                            className="modal-textarea"
                                        />
                                    </div>

                                    <label className="consent-checkbox-row">
                                        <input 
                                            type="checkbox" 
                                            checked={consent}
                                            onChange={(e) => setConsent(e.target.checked)}
                                        />
                                        <span className="consent-label">I consent to being contacted by the team regarding this feedback</span>
                                    </label>
                                </div>

                                <div className="modal-footer-btn-row">
                                    <button type="button" onClick={() => setFeedbackStep(2)} className="modal-back-btn">
                                        Back
                                    </button>
                                    <button type="button" onClick={submitFeedback} className="modal-next-btn">
                                        Submit
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP 4: SUCCESS */}
                        {feedbackStep === 4 && (
                            <div className="feedback-success-block">
                                <div className="success-icon-circle">✓</div>
                                <h3>Thank You!</h3>
                                <p>Your feedback has been submitted successfully. You can track this under the 'Your Issues' section.</p>
                                <button type="button" onClick={closeFeedback} className="modal-next-btn" style={{ marginTop: '24px' }}>
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .settings-page-wrapper {
                    min-height: 100vh;
                    background-color: #000000 !important;
                    color: #ffffff;
                    padding: 40px 24px 80px;
                    position: relative;
                    z-index: 5;
                }

                .settings-content-container {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    gap: 24px;
                    max-width: 1040px;
                    margin: 0 auto;
                }

                /* Left Sidebar styling */
                .settings-sidebar {
                    background-color: #0d0d0d;
                    border: 1px solid #1c1c1c;
                    border-radius: 12px;
                    padding: 24px 0 12px 0;
                    height: fit-content;
                }

                .sidebar-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin: 0 0 20px 24px;
                    color: #ffffff;
                }

                .sidebar-menu {
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-menu-btn,
                .sidebar-menu-link {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid #1c1c1c;
                    color: rgba(255, 255, 255, 0.45);
                    padding: 14px 24px;
                    font-size: 0.92rem;
                    font-weight: 500;
                    text-align: left;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    width: 100%;
                }

                .sidebar-btn-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .sidebar-menu-btn:hover,
                .sidebar-menu-link:hover {
                    background-color: rgba(255, 255, 255, 0.02);
                    color: #ffffff;
                }

                .sidebar-menu-btn.active {
                    color: #ffffff;
                    background-color: transparent;
                    font-weight: 600;
                }

                .active-arrow {
                    color: #ffffff;
                }

                .sidebar-menu-btn:last-child,
                .sidebar-menu-link:last-child {
                    border-bottom: none;
                }

                .menu-divider {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.3);
                    letter-spacing: 0.08em;
                    padding: 14px 24px;
                    border-bottom: 1px solid #1c1c1c;
                    background-color: rgba(0, 0, 0, 0.1);
                }

                /* Right content panel styling */
                .settings-main-panel {
                    background-color: #0d0d0d;
                    border: 1px solid #1c1c1c;
                    border-radius: 12px;
                    padding: 32px;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
                }

                .panel-title {
                    font-size: 1.6rem;
                    font-weight: 700;
                    margin: 0 0 28px 0;
                    color: #ffffff;
                }

                .panel-title.m-0 {
                    margin: 0;
                }

                /* Tab description */
                .tab-description-sub {
                    font-size: 0.92rem;
                    color: rgba(255, 255, 255, 0.45);
                    margin: 4px 0 28px 0;
                }

                /* Photo Edit Area */
                .photo-upload-section {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .avatar-preview-wrapper {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    overflow: hidden;
                    cursor: pointer;
                    background-color: #1a1a1a;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    flex-shrink: 0;
                }

                .avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-fallback {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.35);
                    padding: 12px;
                }

                .photo-info-block {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .photo-label {
                    font-weight: 600;
                    font-size: 1rem;
                    color: #ffffff;
                }

                .photo-upload-link {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.88rem;
                    padding: 0;
                    cursor: pointer;
                    text-align: left;
                    transition: color 0.15s ease;
                }

                .photo-upload-link:hover {
                    color: #ffffff;
                }

                /* Fields & Layout grid */
                .form-fields-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .field-row {
                    display: grid;
                    grid-template-columns: 180px 1fr;
                    align-items: center;
                    gap: 16px;
                }

                .field-row.align-start {
                    align-items: start;
                }

                .pt-2 {
                    padding-top: 8px;
                }

                .field-label {
                    color: #ffffff;
                    font-weight: 500;
                    font-size: 0.95rem;
                }

                .input-container {
                    background-color: #141414;
                    border: 1px solid #242424;
                    border-radius: 6px;
                    padding: 10px 14px;
                    transition: all 0.15s ease;
                }

                .input-container:focus-within {
                    border-color: #3a3a3a;
                    background-color: #171717;
                }

                .input-container input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #ffffff;
                    font-size: 0.95rem;
                }

                .input-with-subtext {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .field-subtext {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.35);
                    line-height: 1.3;
                }

                textarea {
                    width: 100%;
                    background-color: #141414;
                    border: 1px solid #242424;
                    border-radius: 6px;
                    padding: 12px 14px;
                    color: #ffffff;
                    font-size: 0.95rem;
                    outline: none;
                    font-family: inherit;
                    resize: vertical;
                    min-height: 90px;
                    transition: all 0.15s ease;
                }

                textarea:focus {
                    border-color: #3a3a3a;
                    background-color: #171717;
                }

                .section-subtitle {
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin: 36px 0 20px 0;
                    color: #ffffff;
                }

                /* Social Inputs with prefixes */
                .social-input {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .input-prefix {
                    color: rgba(255, 255, 255, 0.3);
                    font-weight: 500;
                    user-select: none;
                }

                /* Action panel */
                .action-bar-footer {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 16px;
                    margin-top: 36px;
                }

                .save-btn {
                    background-color: #ffffff;
                    color: #000000;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }

                .save-btn:hover:not(:disabled) {
                    background-color: #e5e5e5;
                }

                .save-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .toast {
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    animation: fadeIn 0.2s ease;
                }

                .success-toast {
                    background-color: rgba(0, 200, 100, 0.1);
                    border: 1px solid rgba(0, 200, 100, 0.2);
                    color: #00e676;
                }

                .error-toast {
                    background-color: rgba(255, 68, 68, 0.1);
                    border: 1px solid rgba(255, 68, 68, 0.2);
                    color: #ff5252;
                }

                /* Profile Health tab specific styles */
                .health-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .status-indicator-capsule {
                    display: flex;
                    align-items: center;
                    background-color: #121212;
                    border: 1px solid #242424;
                    border-radius: 20px;
                    padding: 3px;
                }

                .indicator-segment {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #555555;
                    cursor: default;
                }

                .indicator-segment.active-status {
                    background-color: rgba(0, 200, 100, 0.15);
                    border: 1.5px solid #00c864;
                    color: #00c864;
                }

                .indicator-segment.warning-status:hover {
                    color: #ffb300;
                }

                .indicator-segment.danger-status:hover {
                    color: #ff5252;
                }

                .health-description {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    font-size: 0.88rem;
                    color: rgba(255, 255, 255, 0.5);
                    line-height: 1.45;
                    margin: 0 0 24px 0;
                }

                .inline-info-icon {
                    flex-shrink: 0;
                    margin-top: 2px;
                    color: rgba(255, 255, 255, 0.45);
                }

                .standing-banner {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background-color: rgba(0, 200, 100, 0.08);
                    border: 1px solid rgba(0, 200, 100, 0.15);
                    border-radius: 6px;
                    padding: 12px 16px;
                    color: #00c864;
                    font-size: 0.92rem;
                    font-weight: 500;
                    margin-bottom: 32px;
                }

                .strikes-placeholder-box {
                    background-color: #141414;
                    border: 1px solid #242424;
                    border-radius: 6px;
                    padding: 18px 24px;
                    color: rgba(255, 255, 255, 0.45);
                    font-size: 0.92rem;
                }

                /* FAQ Accordion Styling */
                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .faq-item-card {
                    background-color: #141414;
                    border: 1px solid #242424;
                    border-radius: 6px;
                    overflow: hidden;
                    transition: border-color 0.15s ease;
                }

                .faq-item-card:hover {
                    border-color: #333333;
                }

                .faq-item-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 24px;
                    cursor: pointer;
                    user-select: none;
                }

                .faq-q-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .faq-index-circle {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background-color: #242424;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.65);
                }

                .faq-question-text {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #ffffff;
                }

                .faq-toggle-plus {
                    color: rgba(255, 255, 255, 0.45);
                    font-size: 1.2rem;
                    font-weight: 500;
                }

                .faq-item-body {
                    padding: 0 24px 20px 64px;
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.5);
                    line-height: 1.5;
                    border-top: 1px solid rgba(255, 255, 255, 0.02);
                    animation: slideDown 0.2s ease-out;
                }

                /* Issues specific styles */
                .issues-empty-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 72px 24px;
                    text-align: center;
                    background-color: #141414;
                    border: 1px solid #242424;
                    border-radius: 8px;
                    margin-top: 8px;
                }

                .empty-warning-icon {
                    color: rgba(255, 255, 255, 0.3);
                    margin-bottom: 18px;
                }

                .issues-empty-box h3 {
                    font-size: 1.15rem;
                    font-weight: 600;
                    margin: 0 0 6px 0;
                    color: #ffffff;
                }

                .issues-empty-box p {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.4);
                    margin: 0;
                }

                .issues-submitted-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 8px;
                }

                .submitted-issue-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #141414;
                    border: 1px solid #242424;
                    border-radius: 8px;
                    padding: 16px 24px;
                }

                .issue-details-main h4 {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0 0 4px 0;
                }

                .issue-meta {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                }

                .issue-status-badge {
                    font-size: 0.8rem;
                    font-weight: 700;
                    background-color: rgba(0, 200, 100, 0.1);
                    border: 1px solid rgba(0, 200, 100, 0.25);
                    color: #00c864;
                    padding: 4px 10px;
                    border-radius: 20px;
                }

                /* Text Content Card for Privacy / Terms */
                .text-content-card {
                    background-color: #141414;
                    border: 1px solid #242424;
                    border-radius: 8px;
                    padding: 24px;
                    font-size: 0.92rem;
                    color: rgba(255, 255, 255, 0.55);
                    line-height: 1.6;
                }

                .title-with-icon-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 4px;
                }

                .title-purple-icon {
                    color: #8b5cf6;
                }

                .last-updated-text {
                    font-size: 0.88rem;
                    color: rgba(255, 255, 255, 0.45);
                    margin: 0 0 32px 0;
                }

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

                /* MODAL BACKDROP OVERLAY */
                .modal-backdrop-overlay {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(6px);
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    z-index: 99999;
                    padding: 90px 20px 40px 20px;
                    overflow-y: auto;
                }

                .feedback-modal-card {
                    background-color: #0c0c0c;
                    border: 1px solid #242424;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 480px;
                    padding: 32px;
                    position: relative;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
                }

                .modal-close-x {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.45);
                    cursor: pointer;
                    padding: 4px;
                    transition: color 0.15s ease;
                }

                .modal-close-x:hover {
                    color: #ffffff;
                }

                .modal-header-title {
                    font-size: 1.35rem;
                    font-weight: 700;
                    color: #ffffff;
                    margin: 0 0 20px 0;
                }

                .step-progress-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.45);
                    font-weight: 600;
                    margin-bottom: 6px;
                }

                .progress-bar-track {
                    width: 100%;
                    height: 5px;
                    background-color: #1c1c1c;
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 28px;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #ec4899, #8b5cf6);
                    border-radius: 10px;
                    transition: width 0.2s ease;
                }

                .progress-bar-fill.w-33 {
                    width: 33%;
                }

                .progress-bar-fill.w-67 {
                    width: 67%;
                }

                .progress-bar-fill.w-100 {
                    width: 100%;
                }

                .rating-questions-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .rating-question-row {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .question-title {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #ffffff;
                }

                .stars-list {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .star-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.15);
                    cursor: pointer;
                    padding: 2px;
                    transition: all 0.15s ease;
                }

                .star-btn:hover {
                    transform: scale(1.15);
                }

                .star-btn.selected {
                    color: #f43f5e;
                }

                .textareas-container {
                    gap: 12px;
                }

                .feedback-textarea-row {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .modal-textarea {
                    width: 100%;
                    background-color: #141414;
                    border: 1px solid #242424;
                    border-radius: 6px;
                    padding: 10px 14px;
                    color: #ffffff;
                    font-size: 0.95rem;
                    outline: none;
                    font-family: inherit;
                    resize: none;
                    height: 70px;
                    transition: all 0.15s ease;
                }

                .modal-textarea:focus {
                    border-color: #3a3a3a;
                }

                .consent-checkbox-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 10px;
                    cursor: pointer;
                    user-select: none;
                }

                .consent-checkbox-row input[type="checkbox"] {
                    accent-color: #f43f5e;
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    margin: 0;
                }

                .consent-label {
                    font-size: 0.82rem;
                    color: rgba(255, 255, 255, 0.55);
                    line-height: 1.35;
                }

                .modal-footer-btn-row {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 12px;
                    margin-top: 36px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 20px;
                }

                .modal-next-btn {
                    background-color: #ffffff;
                    color: #000000;
                    border: none;
                    padding: 10px 22px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.88rem;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }

                .modal-next-btn:hover:not(:disabled) {
                    background-color: #e5e5e5;
                }

                .modal-next-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .modal-back-btn {
                    background-color: #242424;
                    border: none;
                    color: #ffffff;
                    padding: 10px 22px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.88rem;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }

                .modal-back-btn:hover {
                    background-color: #2d2d2d;
                }

                /* Success Feedback Block */
                .feedback-success-block {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 16px 0;
                }

                .success-icon-circle {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background-color: rgba(0, 200, 100, 0.1);
                    border: 2px solid #00c864;
                    color: #00c864;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    font-weight: 700;
                    margin-bottom: 20px;
                }

                .feedback-success-block h3 {
                    font-size: 1.35rem;
                    font-weight: 700;
                    color: #ffffff;
                    margin: 0 0 10px 0;
                }

                .feedback-success-block p {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.45);
                    line-height: 1.45;
                    margin: 0;
                    max-width: 320px;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .settings-content-container {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                    .settings-sidebar {
                        display: flex;
                        overflow-x: auto;
                        padding: 12px;
                        gap: 8px;
                    }
                    .sidebar-title,
                    .menu-divider,
                    .sidebar-menu-link {
                        display: none;
                    }
                    .sidebar-menu {
                        flex-direction: row;
                        width: 100%;
                    }
                    .sidebar-menu-btn {
                        padding: 8px 12px;
                        white-space: nowrap;
                    }
                    .field-row {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }
                    .pt-2 {
                        padding-top: 0;
                    }
                }
            `}</style>
        </div>
    );
}
