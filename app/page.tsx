import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AlbumCard from './components/AlbumCard';

type Album = {
  id: string;
  name: string;
  cover_image: string | null;
  avg_rating: number | null;
};

async function getAlbums(): Promise<Album[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/discover/albums`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function Home() {
  const albums = await getAlbums();

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <Navbar />
      <Hero />

      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 24px',
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
          {albums.map((album) => (
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
          ))}
        </div>
      </section>
    </main>
  );
}
