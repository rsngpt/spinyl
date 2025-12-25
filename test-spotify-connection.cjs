const https = require('https');
const fs = require('fs');
const path = require('path');

// Basic dotenv implementation to avoid dependencies issues if not installed globally
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
        console.log('Env loaded from', envPath);
    } catch (e) {
        console.error('Error loading .env:', e.message);
    }
}

loadEnv();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

console.log('Client ID:', clientId ? (clientId.substring(0, 5) + '...') : 'MISSING');
console.log('Client Secret exists:', !!clientSecret);

if (!clientId || !clientSecret) {
    console.error('Missing credentials');
    process.exit(1);
}

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
        console.log('Status:', res.statusCode);
        if (res.statusCode !== 200) {
            console.log('Body:', data);
        } else {
            console.log('Token fetch successful.');
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.write('grant_type=client_credentials');
req.end();
