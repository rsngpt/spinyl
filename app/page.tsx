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

async function getAlbums(): Promise<Album[]> {
  try {
    // Direct server-side call - no HTTP fetch needed
    const data = await spotifyFetch('browse/new-releases?limit=20');

    if (!data || !data.albums || !data.albums.items) {
      console.warn('Spotify API returned unexpected structure:', data);
      // Try a fallback search if new releases fails (sometimes happens with restricted tokens)
      const fallbackData = await spotifyFetch('search?q=year:2024&type=album&limit=20');
      if (fallbackData?.albums?.items) {
        return fallbackData.albums.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          cover_image: item.images?.[0]?.url || null,
          avg_rating: null,
        }));
      }
      return [];
    }

    return data.albums.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      cover_image: item.images?.[0]?.url || null,
      avg_rating: null,
    }));
  } catch (error) {
    console.error('Failed to fetch albums from Spotify:', error);
    return [];
  }
}

export default async function Home() {
  const albums = await getAlbums();

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', position: 'relative' }}>
      <div className="live-gradient-bg" />
      <Navbar />
      <Hero />

      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 24px',
          position: 'relative', // Ensure content is above background if z-index plays up
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Trending Albums</h2>
          <a
            href="/explore"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            See All
          </a>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '24px',
          }}
        >
          {albums.length > 0 ? (
            albums.map((album) => (
              <a
                key={album.id}
                href={`/album/${album.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <AlbumCard album={album} />
              </a>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <p>No albums found (API connection issue).</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
