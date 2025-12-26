const https = require('https');
require('dotenv').config({ path: '.env.local' });
const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => {
        try {
            const j = JSON.parse(data);
            if (j.models) {
                console.log("VALID MODELS:");
                j.models.forEach(m => console.log(m.name.replace('models/', '')));
            } else {
                console.log("ERROR:", j);
            }
        } catch (e) { console.log(e); }
    });
});
