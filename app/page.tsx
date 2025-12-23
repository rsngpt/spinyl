import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AlbumCard from './components/AlbumCard';

import { spotifyFetch } from '@/src/lib/spotify';

type Album = {
  id: string;
  name: string;
  cover_image: string | null;
  avg_rating: number | null;
};

async function getGlobalAlbums(): Promise<Album[]> {
  try {
    const data = await spotifyFetch('browse/new-releases?limit=10');
    return mapSpotifyAlbums(data);
  } catch (error) {
    console.error('Failed to fetch global albums:', error);
    return [];
  }
}

async function getIndianAlbums(): Promise<Album[]> {
  try {
    // country=IN filters new releases for India
    const data = await spotifyFetch('browse/new-releases?country=IN&limit=10');
    return mapSpotifyAlbums(data);
  } catch (error) {
    console.error('Failed to fetch Indian albums:', error);
    return [];
  }
}

function mapSpotifyAlbums(data: any): Album[] {
  if (!data || !data.albums || !data.albums.items) return [];

  return data.albums.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    cover_image: item.images?.[0]?.url || null,
    avg_rating: null,
  }));
}

export default async function Home() {
  const [globalAlbums, indianAlbums] = await Promise.all([
    getGlobalAlbums(),
    getIndianAlbums()
  ]);

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', position: 'relative' }}>
      <div className="live-gradient-bg" />
      <Navbar />
      <Hero />

      <div
        style={{
          maxWidth: '1400px', // Wider to fit two columns
          margin: '0 auto',
          padding: '40px 24px',
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', // Responsive 2-column layout
          gap: '40px',
        }}
      >
        {/* Global Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Trending Worldwide</h2>
            <a href="/explore" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>See All</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
            {globalAlbums.map((album) => (
              <a key={album.id} href={`/album/${album.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <AlbumCard album={album} />
              </a>
            ))}
          </div>
        </section>

        {/* India Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Trending in India 🇮🇳</h2>
            <a href="/explore?region=IN" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>See All</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
            {indianAlbums.map((album) => (
              <a key={album.id} href={`/album/${album.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <AlbumCard album={album} />
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
