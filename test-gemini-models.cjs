const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("No API Key found in env!");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Key prefix:", apiKey.substring(0, 8) + "...");

    const variations = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.0-pro",
        "gemini-pro",
        "gemini-1.5-pro"
    ];

    for (const m of variations) {
        console.log(`\nAttempting model: ${m}`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Test");
            console.log(`SUCCESS with ${m}! Response: ${result.response.text()}`);
            return;
        } catch (e) {
            console.log(`Failed ${m}: ${e.message.split('[')[1] || e.message}`);
        }
    }
}

run();
