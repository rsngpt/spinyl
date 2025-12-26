const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
require('dotenv').config();

// Basic dotenv implementation removed in favor of package
// function loadEnv() { ... }
// loadEnv();


const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    console.error('Missing credentials in .env');
    process.exit(1);
}

function getAccessToken() {
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
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const token = JSON.parse(data).access_token;
                        resolve(token);
                    } catch (e) { reject('Failed to parse token response'); }
                } else {
                    reject(`Auth failed: ${res.statusCode} ${data}`);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write('grant_type=client_credentials');
        req.end();
    });
}

function searchAlbum(token, query) {
    return new Promise((resolve, reject) => {
        // q=query&type=album&limit=1&market=US
        const params = querystring.stringify({ q: query, type: 'album', limit: 1, market: 'US' });
        const req = https.request(`https://api.spotify.com/v1/search?${params}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const json = JSON.parse(data);
                    if (json.albums && json.albums.items.length > 0) {
                        const album = json.albums.items[0];
                        resolve({ query, found: true, name: album.name, id: album.id, artist: album.artists[0].name });
                    } else {
                        resolve({ query, found: false });
                    }
                } else {
                    resolve({ query, found: false, error: `Status ${res.statusCode}` });
                }
            });
        });
        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function run() {
    try {
        const token = await getAccessToken();
        console.log('Token acquired. Searching...');

        const queries = [
            "Stranger Things Vol 1 artist:Kyle Dixon",
            "Stranger Things 4 artist:Kyle Dixon",
            "Master of Puppets artist:Metallica",
            "Hounds of Love artist:Kate Bush",
            "Combat Rock artist:The Clash",
            "Frontiers artist:Journey",
            "The Youth of Today artist:Musical Youth",
            "Like a Virgin artist:Madonna",
            "Should I Stay Or Should I Go artist:The Clash"
        ];

        const results = [];
        for (const q of queries) {
            const result = await searchAlbum(token, q);
            results.push(result);
            if (result.found) {
                console.log(`[FOUND] ${result.query}`);
            } else {
                console.log(`[NOT FOUND] ${result.query} ${result.error || ''}`);
            }
        }

        fs.writeFileSync('ids_found.json', JSON.stringify(results, null, 2));
        console.log('Results written to ids_found.json');

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
