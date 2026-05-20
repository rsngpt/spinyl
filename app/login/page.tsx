'use client';

import { useState } from 'react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { login, signup } from '../auth/actions';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const action = mode === 'login' ? login : signup;
        const result = await action(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        } else if (result && 'success' in result && result.success && mode === 'signup') {
            setSuccessMessage("Account created successfully! Please check your email to confirm, then log in.");
            setIsLoading(false);
            setMode('login');
        } else {
            if (result?.success && mode === 'login') {
                window.location.href = '/';
            } else {
                setIsLoading(false);
            }
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #121212 0%, #000000 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: '#181818',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#fff' }}>
                    {mode === 'login' ? 'Welcome Back' : 'Join Spinyl'}
                </h1>
                <p style={{ color: '#aaa', marginBottom: '32px' }}>
                    {mode === 'login' ? 'Log in to continue listening.' : 'Create an account to verify reviews.'}
                </p>

                <div style={{ marginBottom: '24px' }}>
                    <GoogleAuthButton />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0', color: '#555' }}>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', marginBottom: '24px', background: '#222', borderRadius: '8px', padding: '4px' }}>
                    <button
                        onClick={() => setMode('login')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: mode === 'login' ? '#333' : 'transparent',
                            color: mode === 'login' ? '#fff' : '#888',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: mode === 'signup' ? '#333' : 'transparent',
                            color: mode === 'signup' ? '#fff' : '#888',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {mode === 'signup' && (
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Username</label>
                            <input
                                name="username"
                                type="text"
                                required
                                placeholder="Your name"
                                style={{
                                    width: '100%', padding: '12px', background: '#222', border: '1px solid #333',
                                    borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Email address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="name@domain.com"
                            style={{
                                width: '100%', padding: '12px', background: '#222', border: '1px solid #333',
                                borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '12px', background: '#222', border: '1px solid #333',
                                borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', color: '#ff4444', fontSize: '0.9rem' }}>
                            {decodeURIComponent(error)}
                        </div>
                    )}

                    {successMessage && (
                        <div style={{ padding: '12px', background: 'rgba(255, 159, 104, 0.1)', border: '1px solid #ff9f68', borderRadius: '8px', color: '#ffb488', fontSize: '0.9rem', marginBottom: '12px' }}>
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            marginTop: '8px',
                            padding: '12px',
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '500px',
                            fontWeight: 700,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                `}} />
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '3px solid rgba(0,0,0,0.1)',
                                    borderTop: '3px solid #000',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                <span>Processing...</span>
                            </div>
                        ) : (mode === 'login' ? 'Log In' : 'Sign Up')}
                    </button>
                </form>
            </div>
        </div>
    );
}
