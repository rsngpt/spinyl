import SpotifyAuthButton from '../components/SpotifyAuthButton';
import Link from 'next/link';

export default function LoginPage() {
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
                maxWidth: '400px',
                background: '#181818',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#fff' }}>Welcome Back</h1>
                <p style={{ color: '#aaa', marginBottom: '32px' }}>Log in to share your reviews.</p>

                <SpotifyAuthButton />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0', color: '#555' }}>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                </div>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Email address</label>
                        <input
                            type="email"
                            placeholder="name@domain.com"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#222',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#222',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="button" // Change to submit when implementing functionality
                        style={{
                            marginTop: '8px',
                            padding: '12px',
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '500px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Log In
                    </button>
                </form>

                <p style={{ marginTop: '24px', fontSize: '0.9rem', color: '#888' }}>
                    Don't have an account? <Link href="/login" style={{ color: '#fff', textDecoration: 'underline' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}
