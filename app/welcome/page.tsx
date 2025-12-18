export default function WelcomePage() {
  return (
    <main
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>
        Welcome to Spinyl 🎶
      </h1>

      <p style={{ marginBottom: '24px', color: '#555' }}>
        Discover, rate, and review music you love.
      </p>

      <a
        href="/"
        style={{
          padding: '10px 16px',
          background: '#000',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none',
        }}
      >
        Start Exploring
      </a>
    </main>
  );
}
