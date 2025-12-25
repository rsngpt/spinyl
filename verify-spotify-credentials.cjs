const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
console.log('Reading .env from:', envPath);

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    const env = {};

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const parts = trimmed.split('=');
        if (parts.length > 1) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
            env[key] = value;
        }
    });

    const clientId = env.SPOTIFY_CLIENT_ID;
    const clientSecret = env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('Credentials missing');
        process.exit(1);
    }

    // Test connection
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const req = https.request('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('SUCCESS: Token fetched.');
                const token = JSON.parse(data).access_token;

                // Fetch Recommendations
                console.log('Fetching recommendations for pop...');
                const genreReq = https.request('https://api.spotify.com/v1/recommendations?seed_genres=pop&limit=1', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }, (genreRes) => {
                    let genreData = '';
                    genreRes.on('data', (c) => genreData += c);
                    genreRes.on('end', () => {
                        console.log('Recs Status:', genreRes.statusCode);
                        if (genreRes.statusCode === 200) {
                            console.log('Recs fetched successfully.');
                        } else {
                            console.log('Recs fetch failed:', genreData);
                        }
                    });
                });
                genreReq.on('error', (e) => console.error('Recs request error:', e));
                genreReq.end();

            } else {
                console.error('FAILURE: Could not fetch token: ' + res.statusCode);
            }
        });
    });

    req.on('error', (e) => console.error('Request error:', e));
    req.write('grant_type=client_credentials');
    req.end();

} catch (e) {
    console.error('Error:', e.message);
}
