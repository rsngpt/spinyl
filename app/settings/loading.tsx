'use client';

export default function SettingsLoading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      color: '#fff',
      fontSize: '1.2rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      fontFamily: 'var(--font-display), Georgia, serif'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div className="skeleton-disc" style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid rgba(255, 159, 104, 0.2)',
          borderTopColor: 'var(--md-sys-color-primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <span>Syncing settings...</span>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
