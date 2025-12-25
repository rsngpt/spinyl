import { NextResponse } from 'next/server';
import { spotifyFetch } from '@/src/lib/spotify';

export async function GET() {
    try {
        const data = await spotifyFetch('recommendations/available-genre-seeds');

        // Structure: { "genres": [ "acoustic", "afrobeat", ... ] }
        if (!data || !data.genres) {
            return NextResponse.json({ genres: [] });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching genres:', error);

        // Debug logging to file
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), 'debug_error.txt');
            const errorMessage = error?.response?.data
                ? JSON.stringify(error.response.data)
                : error.message || String(error);
            fs.writeFileSync(logPath, `Error at ${new Date().toISOString()}: ${errorMessage}\nFull Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n`);
        } catch (logErr) {
            console.error('Failed to write log:', logErr);
        }

        return NextResponse.json({ genres: [], error: String(error) }, { status: 500 });
    }
}
