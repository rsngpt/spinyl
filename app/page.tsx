import Hero from './components/Hero';
import AlbumSwitcher from './components/AlbumSwitcher';
import { spotifyFetch } from '@/src/lib/spotify';
import RecentlyPlayedSlideshow from './components/RecentlyPlayedSlideshow';

type Album = {
  id: string;
  name: string;
  cover_image: string | null;
  avg_rating: number | null;
  artist: string;
};

async function getGlobalAlbums(): Promise<Album[]> {
  try {
    // country=US serves as a good proxy for "Global" pop culture trends
    const data = await spotifyFetch('browse/new-releases?country=US&limit=10');
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
    artist: item.artists?.[0]?.name || 'Unknown Artist',
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
      <Hero />

      <div style={{ position: 'relative', zIndex: 1, marginTop: '-40px' }}>
        <RecentlyPlayedSlideshow />

        <AlbumSwitcher
          globalAlbums={globalAlbums}
          indianAlbums={indianAlbums}
        />
      </div>
    </main>
  );
}
