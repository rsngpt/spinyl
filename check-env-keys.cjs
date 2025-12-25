const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
console.log('Checking .env at:', envPath);

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    console.log(`File has ${lines.length} lines.`);

    let clientIdFound = false;
    let clientSecretFound = false;

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        // Mask value for safety
        const parts = trimmed.split('=');
        const key = parts[0].trim();
        const hasValue = parts.length > 1 && parts[1].trim().length > 0;

        console.log(`Line ${index + 1}: Key=[${key}] HasValue=${hasValue}`);

        if (key.includes('SPOTIFY_CLIENT_ID')) clientIdFound = true;
        if (key.includes('SPOTIFY_CLIENT_SECRET')) clientSecretFound = true;
    });

    console.log('--- Summary ---');
    console.log('SPOTIFY_CLIENT_ID found:', clientIdFound);
    console.log('SPOTIFY_CLIENT_SECRET found:', clientSecretFound);

} catch (e) {
    console.error('Error reading .env:', e.message);
}
