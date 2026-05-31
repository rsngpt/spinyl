export default function AuthErrorPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#000000', color: '#fff' }}>
            <h1 style={{ marginBottom: '16px' }}>Authentication Error</h1>
            <p>Something went wrong during the login process.</p>
            <a href="/" style={{ marginTop: '24px', color: 'var(--primary)', textDecoration: 'underline' }}>Return Home</a>
        </div>
    );
}
