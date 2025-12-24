
import { getUserRecentlyPlayed } from '@/src/lib/spotify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('spotify_access_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Missing Spotify access token' }, { status: 401 });
    }

    const data = await getUserRecentlyPlayed(token);

    if (!data) {
        return NextResponse.json({ error: 'Failed to fetch recently played' }, { status: 500 });
    }

    return NextResponse.json(data);
}
