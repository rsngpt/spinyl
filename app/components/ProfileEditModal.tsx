'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/actions/profile';

type Props = {
    currentUsername: string;
};

export default function ProfileEditModal({ currentUsername }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        const result = await updateProfile(null, formData);
        if (result.success) {
            setIsOpen(false);
            setMessage(null);
            // Optional: Toast success?
        } else {
            setMessage(result.message || 'Failed to update');
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    padding: '8px 16px',
                    background: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#444'}
                onMouseOut={(e) => e.currentTarget.style.background = '#333'}
            >
                Edit Profile
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000
        }}>
            <div style={{
                background: '#181818',
                padding: '32px',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid #333'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Edit Profile</h2>

                <form action={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>
                            Username
                        </label>
                        <input
                            name="username"
                            defaultValue={currentUsername}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #333',
                                background: '#222',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {message && (
                        <div style={{ color: '#ff4444', marginBottom: '16px', fontSize: '0.9rem' }}>
                            {message}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            style={{
                                padding: '10px 20px',
                                background: 'transparent',
                                border: '1px solid #333',
                                borderRadius: '4px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 24px',
                                background: '#1ed760',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#000',
                                cursor: 'pointer',
                                fontWeight: 700
                            }}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
