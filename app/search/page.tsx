
import AlbumCard from '../components/AlbumCard';
import { spotifySearch } from '@/src/lib/spotify';

type SearchPageProps = {
    searchParams: Promise<{ q: string }>;
};

export default async function SearchPage(props: SearchPageProps) {
    const searchParams = await props.searchParams;
    const query = searchParams.q;
    let albums: any[] = [];
    let error = null;

    if (query) {
        try {
            console.log(`Searching for: ${query}`);
            const results = await spotifySearch(query);
            console.log(`Search results count: ${results?.length || 0}`);
            if (results && results.length > 0) {
                console.log('First result:', JSON.stringify(results[0], null, 2));
            } else {
                console.log('No results found from Spotify API');
            }
            albums = results.map((item: any) => ({
                id: item.id,
                name: item.name,
                cover_image: item.images?.[0]?.url || null,
                avg_rating: null,
                artist: item.artists?.[0]?.name || 'Unknown Artist',
            }));
        } catch (err) {
            console.error('Search failed:', err);
            error = 'Failed to load search results.';
        }
    }

    return (
        <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <div className="live-gradient-bg" />


            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>
                    {query ? `Search results for "${query}"` : 'Search for an album'}
                </h1>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {albums.length > 0 ? (
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
                                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                            >
                                <AlbumCard album={album} />
                            </a>
                        ))}
                    </div>
                ) : (
                    query && !error && <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No albums found.</p>
                )}
            </section>
        </main>
    );
}
