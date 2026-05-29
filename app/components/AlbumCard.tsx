import React from 'react';

export default function AlbumCard({
  album,
}: {
  album: {
    id: string;
    cover_image: string | null;
    name: string;
    avg_rating: number | null;
    artist: string; // Added artist field
  };
}) {
  return (
    <div className="album-card-hover">
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <img
          src={album.cover_image ?? '/placeholder.png'}
          alt={album.name}
          style={{
            width: '100%',
            aspectRatio: '1/1',
            objectFit: 'cover',
            borderRadius: '0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        />
        {album.avg_rating !== null && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.8)',
              color: '#FFD700',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backdropFilter: 'blur(4px)',
            }}
          >
            ★ {album.avg_rating}
          </span>
        )}
      </div>

      <h3
        style={{
          fontSize: '1rem',
          color: 'var(--text-main)',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {album.name}
      </h3>
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {album.artist}
      </p>
    </div>
  );
}

