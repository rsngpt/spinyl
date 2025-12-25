import { NextResponse } from 'next/server';
import { spotifyFetch } from '@/src/lib/spotify';

// Helper: Fetch Author's Top Tracks
async function fetchArtistTopTracks(artistId: string) {
    try {
        // Market 'US' is standard for broad availability
        const data = await spotifyFetch(`artists/${artistId}/top-tracks?market=US`);
        return data.tracks || [];
    } catch (e) {
        console.error(`Failed to fetch top tracks for artist ${artistId}`, e);
        return [];
    }
}

// Helper: Fetch Popular Tracks for a Genre
async function fetchGenreTopTracks(genre: string) {
    try {
        // Search for tracks with this genre, sorted roughly by popularity (default search behavior)
        // using a specific year range or 'hipster' tag could be cool later, but let's stick to simple genre search.
        const data = await spotifyFetch(`search?q=genre:${encodeURIComponent(genre)}&type=track&limit=10&market=US`);
        return data.tracks?.items || [];
    } catch (e) {
        console.error(`Failed to fetch top tracks for genre ${genre}`, e);
        return [];
    }
}

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const seedGenres = searchParams.get('seed_genres'); // comma separated
    const seedArtists = searchParams.get('seed_artists'); // comma separated names or IDs? logic says IDs from frontend.

    // Frontend sends IDs for artists now? let's verify. 
    // Yes, RecommendationsGrid passed `seedArtists.map(a => a.id)`.

    if (!seedGenres && !seedArtists) {
        return NextResponse.json(
            { error: 'At least one seed (genre or artist) is required.' },
            { status: 400 }
        );
    }

    const genreList = seedGenres ? seedGenres.split(',') : [];
    const artistList = seedArtists ? seedArtists.split(',') : [];

    try {
        const promises: Promise<any[]>[] = [];

        // 1. Fetch Artist Top Tracks
        artistList.forEach((id) => promises.push(fetchArtistTopTracks(id)));

        // 2. Fetch Genre Popular Tracks
        genreList.forEach((genre) => promises.push(fetchGenreTopTracks(genre)));

        const results = await Promise.all(promises);

        // Flatten
        const allTracks = results.flat();

        // Deduplicate by ID
        const seen = new Set();
        const uniqueTracks = allTracks.filter((track: any) => {
            const duplicate = seen.has(track.id);
            seen.add(track.id);
            return !duplicate;
        });

        // Shuffle
        const shuffled = shuffleArray(uniqueTracks);

        // Map to our format
        const formattedTracks = shuffled.map((track: any) => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map((a: any) => ({ name: a.name, id: a.id })),
            album: {
                id: track.album.id,
                name: track.album.name,
                image: track.album.images?.[0]?.url,
            },
            preview_url: track.preview_url,
        }));

        // Limit response size
        return NextResponse.json(formattedTracks.slice(0, 50));

    } catch (error: any) {
        console.error('Error in custom recommendation engine:', error);
        return NextResponse.json([], { status: 500 });
    }
}
