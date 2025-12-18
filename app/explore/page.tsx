import React from 'react';
import AlbumCard from '../components/AlbumCard';

// fetch album grid
async function getAlbums() {
  const res = await fetch('/api/discover/albums', { next: { revalidate: 60 } });
  return res.json();
}

export default async function Explore() {
  const albums = await getAlbums();

  return (
    <main className="explore-page">
      <h1 className="title">Discover Music</h1>

      <div className="grid">
        {albums?.map((album: any) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </main>
  );
}
