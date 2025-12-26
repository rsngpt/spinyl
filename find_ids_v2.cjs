const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

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

async function searchAlbum(token, qRaw) {
    return new Promise((resolve, reject) => {
        // Use q=... directly
        const searchPath = `/v1/search?q=${encodeURIComponent(qRaw)}&type=album&limit=1&market=US`;
        const req = https.request(`https://api.spotify.com${searchPath}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const json = JSON.parse(data);
                if (json.albums && json.albums.items.length > 0) {
                    const album = json.albums.items[0];
                    console.log(`[FOUND] "${qRaw}" -> ${album.name} (${album.artists[0].name}) -> ${album.id}`);
                    resolve(album.id);
                } else {
                    console.log(`[NOT FOUND] "${qRaw}"`);
                    if (json.error) console.log('Error:', json.error);
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

    // Using advanced search syntax
    const queries = [
        "Stranger Things 4",
        "Stranger Things 3",
        "Master of Puppets artist:Metallica",
        "Hounds of Love artist:Kate Bush",
        "Combat Rock artist:The Clash",
        "Frontiers artist:Journey",
        "The Youth of Today", // Musical Youth
        "Like a Virgin artist:Madonna"
    ];

    for (const q of queries) {
        await searchAlbum(token, q);
    }
}

run();
