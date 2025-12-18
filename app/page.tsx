import LoginButton from './components/LoginButton';

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
    <main style={{ padding: '24px' }}>
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}
    >
      <h1 style={{ fontSize: '1.8rem' }}>Spinyl</h1>
      <LoginButton />
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
        }}
      >
        {albums.map((album) => (
          <a
            key={album.id}
            href={`/album/${album.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              position: 'relative',
            }}
          >
            <div>
              <img
                src={album.cover_image ?? '/placeholder.png'}
                alt={album.name}
                style={{
                  width: '100%',
                  height: '160px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />

              {album.avg_rating !== null && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#000',
                    color: '#fff',
                    fontSize: '0.8rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  ⭐ {album.avg_rating}
                </span>
              )}

              <p
                style={{
                  marginTop: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                {album.name}
              </p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
