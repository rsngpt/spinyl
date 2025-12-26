const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

// Simple dotenv loader
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const lines = envFile.split('\n');
        for (const line of lines) {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                process.env[key] = value;
            }
        }
    } catch (e) { console.error(e.message); }
}

loadEnv();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const req = https.request('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data).access_token));
        });
        req.on('error', reject);
        req.write('grant_type=client_credentials');
        req.end();
    });
}

async function searchAlbum(token, query) {
    return new Promise((resolve, reject) => {
        // q=album:query
        const q = querystring.stringify({ q: query, type: 'album', limit: 1 });
        const req = https.request(`https://api.spotify.com/v1/search?${q}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const json = JSON.parse(data);
                if (json.albums && json.albums.items.length > 0) {
                    const album = json.albums.items[0];
                    console.log(`[FOUND] ${query}: ${album.name} -> ${album.id}`);
                    resolve(album);
                } else {
                    console.log(`[NOT FOUND] ${query}`);
                    resolve(null);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    const token = await getAccessToken();
    console.log('Got token, searching...\n');

    const queries = [
        "Stranger Things Vol 1",
        "Stranger Things Vol 2",
        "Master of Puppets Metallica",
        "Hounds of Love Kate Bush",
        "Combat Rock The Clash",
        "Frontiers Journey",
        "The Youth of Today Musical Youth",
        "Like a Virgin Madonna"
    ];

    for (const q of queries) {
        await searchAlbum(token, q);
    }
}

run();
