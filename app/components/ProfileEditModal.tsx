'use client';

import { useState, useRef } from 'react';
import { updateProfile } from '@/app/actions/profile';
import DefaultAvatar from './DefaultAvatar';

type ProfileData = {
    username: string | null;
    full_name: string | null;
    bio: string | null;
    avatar_url: string | null;
};

type Props = {
    profile: ProfileData;
    onUpdate: (updated: Partial<ProfileData>) => void;
};

export default function ProfileEditModal({ profile, onUpdate }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url);
    const [isUploading, setIsUploading] = useState(false);
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
                }, 'image/jpeg', 0.8); // 0.8 Quality
            };
            img.onerror = (error) => reject(error);
        });
    };

    // Handle file selection preview
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Show loading/optimistic preview immediately? 
                // Better to wait for compression so we see exactly what we get.
                const compressed = await compressImage(file);
                setCompressedFile(compressed);
                const objectUrl = URL.createObjectURL(compressed);
                setPreviewUrl(objectUrl);
            } catch (err) {
                console.error("Compression failed", err);
                // Fallback to original
                setCompressedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    async function handleSubmit(formData: FormData) {
        setIsUploading(true);
        setMessage(null);

        // Inject compressed file if available
        if (compressedFile) {
            formData.set('avatar', compressedFile);
        }

        // Optimistic UI Update data preparation
        const updates: Partial<ProfileData> = {
            username: formData.get('username') as string,
            full_name: formData.get('full_name') as string,
            bio: formData.get('bio') as string,
        };

        if (previewUrl && previewUrl !== profile.avatar_url) {
            // Preview is trusted
        }

        const result = await updateProfile(null, formData);
        setIsUploading(false);

        if (result.success) {
            // Update parent state instantly with confirmed data from server
            onUpdate({
                username: result.data?.username || updates.username,
                full_name: result.data?.full_name || updates.full_name,
                bio: result.data?.bio || updates.bio,
                avatar_url: result.data?.avatar_url || profile.avatar_url
            });

            setIsOpen(false);
            // No reload needed now!
        } else {
            setMessage(result.message || 'Failed to update');
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="edit-profile-btn"
            >
                Edit Profile
                <style jsx>{`
                .edit-profile-btn {
                    padding: 8px 0;
                    width: 100%;
                    min-width: 120px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .edit-profile-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--md-sys-color-primary);
                    color: var(--md-sys-color-primary);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 159, 104, 0.15);
                }
                `}</style>
            </button>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
                </div>

                <form action={handleSubmit} className="modal-form">

                    {/* Top Row: Avatar Left, Inputs Right */}
                    <div className="top-section">
                        {/* Avatar */}
                        <div className="avatar-upload-section">
                            <div
                                className="avatar-preview"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" />
                                ) : (
                                    <div className="avatar-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '12px' }}>
                                        <DefaultAvatar fill="currentColor" />
                                    </div>
                                )}
                                <div className="avatar-overlay">CHANGE</div>
                            </div>
                            <input
                                type="file"
                                name="avatar"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                hidden
                            />
                        </div>

                        {/* User/Name Inputs */}
                        <div className="user-inputs">
                            <input
                                name="username"
                                defaultValue={profile.username || ''}
                                placeholder="Username"
                                required
                            />
                            <input
                                name="full_name"
                                defaultValue={profile.full_name || ''}
                                placeholder="Full Name (Optional)"
                            />
                        </div>
                    </div>

                    {/* Bio Below */}
                    <div className="bio-section">
                        <span className="bio-label">BIO</span>
                        <textarea
                            name="bio"
                            defaultValue={profile.bio || ''}
                            placeholder="Tell us about your vibe..."
                        />
                    </div>

                    {message && <div className="error-msg">{message}</div>}

                    <div className="action-buttons">
                        <button type="button" onClick={() => setIsOpen(false)} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" disabled={isUploading} className="save-btn">
                            {isUploading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .edit-profile-btn {
                    padding: 8px 0;
                    width: 100%;
                    min-width: 120px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .edit-profile-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--md-sys-color-primary);
                    color: var(--md-sys-color-primary);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 159, 104, 0.15);
                }

                .modal-overlay {
                    position: absolute; inset: 0;
                    background: rgba(10, 10, 10, 0.98);
                    backdrop-filter: blur(20px);
                    z-index: 100;
                    display: flex; flex-direction: column;
                    animation: fadeIn 0.2s ease-out;
                }
                
                .modal-content {
                    width: 100%; height: 100%;
                    display: flex; flex-direction: column;
                    background: transparent;
                }

                .modal-header {
                    padding: 16px 20px;
                    display: flex; justify-content: space-between; align-items: center;
                    flex-shrink: 0;
                    margin-bottom: 0;
                }
                .modal-header h2 {
                    margin: 0; font-size: 1.1rem; color: #fff; font-weight: 800; letter-spacing: -0.5px;
                    text-transform: uppercase;
                }
                .close-btn {
                    background: rgba(255,255,255,0.1); 
                    border: none; color: #fff; 
                    width: 28px; height: 28px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.2rem; cursor: pointer; transition: all 0.2s;
                }
                .close-btn:hover { background: #ff4444; transform: rotate(90deg); }
                
                .modal-form { 
                    padding: 0 20px 20px; 
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden; 
                }

                .top-section {
                    display: flex; align-items: center; gap: 16px; 
                    margin-bottom: 20px;
                    flex-shrink: 0;
                }

                .avatar-upload-section {
                    margin: 0; flex-shrink: 0;
                }
                .avatar-preview {
                    width: 70px; height: 70px; border-radius: 0;
                    overflow: hidden; position: relative; cursor: pointer;
                    border: 2px solid #333;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .avatar-preview:hover { border-color: var(--md-sys-color-primary); }
                .avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
                .avatar-placeholder { width: 100%; height: 100%; background: #222; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                .avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.6rem; font-weight: 700; opacity: 0; transition: opacity 0.2s; }
                .avatar-preview:hover .avatar-overlay { opacity: 1; }
                .upload-hint { display: none; }

                .user-inputs {
                    flex: 1; display: flex; flex-direction: column; gap: 10px;
                }

                .form-group { margin: 0; }
                .form-group label { display: none; }

                input, textarea {
                    width: 100%; padding: 10px 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    color: #fff; font-size: 0.9rem;
                    transition: all 0.2s;
                    outline: none;
                }
                input:focus, textarea:focus {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--md-sys-color-primary);
                }
                textarea { 
                    resize: none; font-family: inherit; 
                    height: 80px; 
                }

                .bio-section {
                    margin-bottom: 12px;
                }
                .bio-label {
                    display: block; color: #666; font-size: 0.7rem; font-weight: 700; 
                    margin-bottom: 6px; text-transform: uppercase;
                }

                .action-buttons {
                    margin-top: auto; 
                    display: flex; gap: 10px;
                    padding-top: 10px;
                }
                .cancel-btn, .save-btn {
                    flex: 1; padding: 12px; border-radius: 12px;
                    font-weight: 700; font-size: 0.9rem; cursor: pointer;
                    text-transform: uppercase; letter-spacing: 0.5px;
                }
                .cancel-btn { background: #222; border: 1px solid #333; color: #888; }
                .cancel-btn:hover { background: #333; color: #fff; }
                .save-btn { background: var(--md-sys-color-primary); border: none; color: var(--md-sys-color-on-primary); }
                .save-btn:hover { background: var(--primary-hover); }
                .error-msg { color: #ff4444; font-size: 0.8rem; text-align: center; margin-top: 8px; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}

