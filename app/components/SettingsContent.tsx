'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Bell, Sparkles, ChevronLeft, Save, Lock, Edit2 } from 'lucide-react';
import DefaultAvatar from './DefaultAvatar';
import { updateProfile } from '@/app/actions/profile';

type SettingsContentProps = {
    user: any;
    initialProfile: any;
};

export default function SettingsContent({ user, initialProfile }: SettingsContentProps) {
    const router = useRouter();
    const [profile, setProfile] = useState(initialProfile);
    const [username, setUsername] = useState(profile?.username || '');
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [email, setEmail] = useState(user?.email || '');
    
    // Toggles state
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [highFidelity, setHighFidelity] = useState(true);
    const [autoPlay, setAutoPlay] = useState(true);

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
        formData.append('full_name', fullName);
        formData.append('bio', bio);
        if (compressedFile) {
            formData.append('avatar', compressedFile);
        }

        try {
            const result = await updateProfile(null, formData);
            if (result.success) {
                setMessage('Settings successfully saved!');
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

    return (
        <div className="settings-container">
            {/* Header with back navigation */}
            <div className="settings-header">
                <button className="back-btn" onClick={() => router.back()}>
                    <ChevronLeft size={20} />
                    <span>Back</span>
                </button>
                <h1 className="settings-title">Settings</h1>
            </div>

            <form onSubmit={handleSave} className="settings-content-grid">
                {/* Left Column: Navigation Quick Links */}
                <div className="settings-nav-sidebar">
                    <div className="sidebar-group">
                        <div className="sidebar-group-title">Preferences</div>
                        <a href="#profile-section" className="sidebar-item active">
                            <User size={18} />
                            <span>Edit Profile</span>
                        </a>
                        <a href="#notifications-section" className="sidebar-item">
                            <Bell size={18} />
                            <span>Notifications</span>
                        </a>
                        <a href="#playback-section" className="sidebar-item">
                            <Sparkles size={18} />
                            <span>App Experience</span>
                        </a>
                    </div>
                </div>

                {/* Right Column: Settings Panels */}
                <div className="settings-panels">
                    {/* Section 1: Profile */}
                    <div id="profile-section" className="settings-card">
                        <h2 className="section-title">
                            <User size={20} className="title-icon" />
                            Profile Settings
                        </h2>
                        
                        <div className="avatar-edit-row">
                            <div className="avatar-preview-container" onClick={() => fileInputRef.current?.click()}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Avatar" className="avatar-image" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        <DefaultAvatar fill="currentColor" />
                                    </div>
                                )}
                                <div className="avatar-hover-overlay">
                                    <Edit2 size={16} />
                                </div>
                            </div>
                            <div className="avatar-upload-info">
                                <h3>Profile Picture</h3>
                                <p>Compressed automatically. PNG, JPG or GIF up to 5MB.</p>
                                <button type="button" className="upload-trigger-btn" onClick={() => fileInputRef.current?.click()}>
                                    Choose Image
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

                        <div className="input-group-grid">
                            <div className="input-wrapper">
                                <label>Username</label>
                                <div className="input-inner">
                                    <User size={16} className="input-icon" />
                                    <input 
                                        type="text" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                        required 
                                        placeholder="Username"
                                    />
                                </div>
                            </div>

                            <div className="input-wrapper">
                                <label>Full Name</label>
                                <div className="input-inner">
                                    <User size={16} className="input-icon" />
                                    <input 
                                        type="text" 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)} 
                                        placeholder="Full name (optional)"
                                    />
                                </div>
                            </div>

                            <div className="input-wrapper full-width">
                                <label>Email Address</label>
                                <div className="input-inner disabled">
                                    <Mail size={16} className="input-icon" />
                                    <input 
                                        type="email" 
                                        value={email} 
                                        disabled 
                                        placeholder="Email Address"
                                    />
                                    <Lock size={14} className="lock-icon" />
                                </div>
                                <span className="input-helper-text">Managed by Supabase Authentication</span>
                            </div>

                            <div className="input-wrapper full-width">
                                <label>Bio</label>
                                <textarea 
                                    value={bio} 
                                    onChange={(e) => setBio(e.target.value)} 
                                    placeholder="Tell us about your musical taste..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Notifications */}
                    <div id="notifications-section" className="settings-card">
                        <h2 className="section-title">
                            <Bell size={20} className="title-icon" />
                            Notifications
                        </h2>
                        <div className="toggle-list">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <h3>Email Notifications</h3>
                                    <p>Receive weekly music roundups, activity logs, and digest updates.</p>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={emailNotifications} 
                                        onChange={(e) => setEmailNotifications(e.target.checked)} 
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <h3>New Review Alerts</h3>
                                    <p>Get notified when followed critics post review updates.</p>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={pushNotifications} 
                                        onChange={(e) => setPushNotifications(e.target.checked)} 
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: App Experience */}
                    <div id="playback-section" className="settings-card">
                        <h2 className="section-title">
                            <Sparkles size={20} className="title-icon" />
                            App Experience
                        </h2>
                        <div className="toggle-list">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <h3>High Fidelity Visualizer</h3>
                                    <p>Enable premium GPU-accelerated rendering inside the Boiler Room visual deck.</p>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={highFidelity} 
                                        onChange={(e) => setHighFidelity(e.target.checked)} 
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <h3>Autoplay Previews</h3>
                                    <p>Start playing album preview cuts automatically when loading catalog cards.</p>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={autoPlay} 
                                        onChange={(e) => setAutoPlay(e.target.checked)} 
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="submit-footer">
                        {message && <div className="toast success-toast">{message}</div>}
                        {errorMsg && <div className="toast error-toast">{errorMsg}</div>}
                        
                        <button type="submit" disabled={isSaving} className="save-settings-btn">
                            <Save size={18} />
                            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                        </button>
                    </div>
                </div>
            </form>

            <style jsx>{`
                .settings-container {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 0 24px 80px;
                    font-family: inherit;
                    color: #fff;
                }

                .settings-header {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    width: fit-content;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .back-btn:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.05);
                }

                .settings-title {
                    font-size: 2.2rem;
                    font-weight: 800;
                    margin: 0;
                    font-family: var(--font-display), Georgia, serif;
                    letter-spacing: -0.03em;
                }

                .settings-content-grid {
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    gap: 40px;
                }

                /* Sidebar */
                .settings-nav-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .sidebar-group-title {
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.3);
                    letter-spacing: 0.1em;
                    margin-bottom: 12px;
                    padding-left: 12px;
                }
                .sidebar-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.92rem;
                    transition: all 0.2s ease;
                }
                .sidebar-item:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.03);
                }
                .sidebar-item.active {
                    color: var(--md-sys-color-primary);
                    background: rgba(255, 159, 104, 0.08);
                    border: 1px solid rgba(255, 159, 104, 0.15);
                }

                /* Panels */
                .settings-panels {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .settings-card {
                    background: rgba(18, 12, 10, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    padding: 32px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin: 0 0 28px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-family: var(--font-display);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    padding-bottom: 16px;
                }

                .title-icon {
                    color: var(--md-sys-color-primary);
                }

                /* Avatar Upload Row */
                .avatar-edit-row {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .avatar-preview-container {
                    width: 80px;
                    height: 80px;
                    border-radius: 0;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    position: relative;
                    cursor: pointer;
                    overflow: hidden;
                    flex-shrink: 0;
                    transition: border-color 0.2s;
                }
                .avatar-preview-container:hover {
                    border-color: var(--md-sys-color-primary);
                }
                .avatar-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.04);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.4);
                    padding: 14px;
                }
                .avatar-hover-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .avatar-preview-container:hover .avatar-hover-overlay {
                    opacity: 1;
                }
                .avatar-upload-info h3 {
                    font-size: 1rem;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                }
                .avatar-upload-info p {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                    margin: 0 0 12px 0;
                }
                .upload-trigger-btn {
                    padding: 8px 16px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .upload-trigger-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                /* Form Inputs */
                .input-group-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .input-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .input-wrapper.full-width {
                    grid-column: 1 / -1;
                }
                .input-wrapper label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 0.05em;
                }
                .input-inner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    padding: 12px 16px;
                    transition: all 0.2s;
                }
                .input-inner:focus-within {
                    background: rgba(255, 255, 255, 0.07);
                    border-color: var(--md-sys-color-primary);
                }
                .input-inner.disabled {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.03);
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                .input-icon {
                    color: rgba(255, 255, 255, 0.3);
                }
                .input-inner input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #fff;
                    font-size: 0.95rem;
                    font-family: inherit;
                }
                .input-inner input:disabled {
                    cursor: not-allowed;
                }
                .lock-icon {
                    color: rgba(255, 255, 255, 0.25);
                }
                .input-helper-text {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.3);
                    margin-top: 2px;
                }
                textarea {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    padding: 12px 16px;
                    color: #fff;
                    font-size: 0.95rem;
                    outline: none;
                    font-family: inherit;
                    resize: vertical;
                    transition: all 0.2s;
                }
                textarea:focus {
                    background: rgba(255, 255, 255, 0.07);
                    border-color: var(--md-sys-color-primary);
                }

                /* Toggle Toggles */
                .toggle-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .toggle-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .toggle-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .toggle-info h3 {
                    font-size: 0.95rem;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                }
                .toggle-info p {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                    margin: 0;
                    line-height: 1.4;
                }

                /* Slider Switch styling */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                    flex-shrink: 0;
                }
                .switch input { 
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(255, 255, 255, 0.1);
                    transition: .3s;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 3px;
                    bottom: 3px;
                    background-color: rgba(255, 255, 255, 0.6);
                    transition: .3s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: rgba(255, 159, 104, 0.2);
                    border-color: var(--md-sys-color-primary);
                }
                input:checked + .slider:before {
                    transform: translateX(20px);
                    background-color: var(--md-sys-color-primary);
                }

                /* Toast & Submit Panel */
                .submit-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 16px;
                    margin-top: 16px;
                }
                .toast {
                    padding: 10px 16px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    animation: slideIn 0.25s ease-out;
                }
                .success-toast {
                    background: rgba(0, 200, 100, 0.15);
                    border: 1px solid rgb(0, 200, 100);
                    color: rgb(0, 230, 120);
                }
                .error-toast {
                    background: rgba(255, 68, 68, 0.15);
                    border: 1px solid rgb(255, 68, 68);
                    color: rgb(255, 100, 100);
                }
                .save-settings-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--md-sys-color-primary);
                    border: none;
                    color: var(--md-sys-color-on-primary);
                    padding: 12px 28px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .save-settings-btn:hover:not(:disabled) {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                }
                .save-settings-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @keyframes slideIn {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @media (max-width: 768px) {
                    .settings-content-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                    .settings-nav-sidebar {
                        display: none;
                    }
                    .input-group-grid {
                        grid-template-columns: 1fr;
                    }
                    .settings-card {
                        padding: 24px;
                    }
                }
            `}</style>
        </div>
    );
}
