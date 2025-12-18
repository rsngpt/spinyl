import React from 'react';

export default function AlbumCard({
  album,
}: {
  album: {
    id: string;
    cover_image: string | null;
    name: string;
    avg_rating: number | null;
  };
}) {
  return (
    <div className="album-card">
      <img
        src={album.cover_image ?? '/placeholder.png'}
        alt={album.name}
        className="cover"
      />

      {album.avg_rating !== null && (
        <span className="badge">⭐ {album.avg_rating}</span>
      )}

      <p className="album-name">{album.name}</p>
    </div>
  );
}
