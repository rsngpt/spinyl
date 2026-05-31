'use client';

import { useState } from 'react';
import { submitOnboarding } from '../auth/onboarding-actions';

export default function OnboardingPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        const result = await submitOnboarding(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        } else if (result?.success) {
            // Hard redirect to home to refresh session/profile context
            window.location.href = '/';
        } else {
            setIsLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '500px',
                background: '#181818',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                textAlign: 'left'
            }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#fff' }}>
                    Setup Your Profile
                </h1>
                <p style={{ color: '#aaa', marginBottom: '32px' }}>
                    Choose a unique username and tell us about yourself.
                </p>

                <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Username</label>
                        <input
                            name="username"
                            type="text"
                            required
                            minLength={3}
                            maxLength={30}
                            placeholder="e.g. music_lover_99"
                            style={{
                                width: '100%', padding: '12px', background: '#222', border: '1px solid #333',
                                borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none'
                            }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>This will be your unique handle on Spinyl.</p>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Bio</label>
                        <textarea
                            name="bio"
                            required
                            maxLength={160}
                            placeholder="I love rock, jazz, and reviewing vinyls..."
                            rows={4}
                            style={{
                                width: '100%', padding: '12px', background: '#222', border: '1px solid #333',
                                borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none', resize: 'vertical'
                            }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Max 160 characters.</p>
                    </div>

                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', color: '#ff4444', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            marginTop: '8px',
                            padding: '14px',
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '500px',
                            fontWeight: 700,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            opacity: isLoading ? 0.7 : 1,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {isLoading ? 'Saving Profile...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
}
