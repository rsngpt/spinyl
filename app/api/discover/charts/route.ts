import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { spotifyFetch } from '@/src/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const value = searchParams.get('value');

    if (!type || !value) {
        return NextResponse.json({ error: 'Missing type or value' }, { status: 400 });
    }

    try {
        let items: any[] = [];

        if (type === 'country') {
            // Fetch top new releases in that country
            const data = await spotifyFetch(`browse/new-releases?country=${value}&limit=12`);
            if (data?.albums?.items) {
                items = data.albums.items;
            }
        } else if (type === 'genre') {
            // Fetch search albums by genre
            const data = await spotifyFetch(`search?q=genre:${encodeURIComponent(value)}&type=album&limit=12&market=US`);
            if (data?.albums?.items) {
                items = data.albums.items;
            }
        } else if (type === 'language') {
            // Map languages to Spotify queries
            let query = '';
            const lang = value.toLowerCase();
            if (lang === 'english') {
                query = 'genre:pop';
            } else if (lang === 'spanish') {
                query = 'genre:latin';
            } else if (lang === 'japanese') {
                query = 'genre:j-pop';
            } else if (lang === 'korean') {
                query = 'genre:k-pop';
            } else if (lang === 'hindi') {
                query = 'genre:bollywood';
            } else {
                query = `genre:${value}`;
            }

            const data = await spotifyFetch(`search?q=${encodeURIComponent(query)}&type=album&limit=12&market=US`);
            if (data?.albums?.items) {
                items = data.albums.items;
            }
        }

        const mapped = items.map((item: any) => ({
            id: item.id,
            name: item.name,
            cover_image: item.images?.[0]?.url || null,
            artist: item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
            avg_rating: null,
        }));

        return NextResponse.json(mapped);
    } catch (e: any) {
        console.error('Error fetching charts:', e);
        return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
    }
}
