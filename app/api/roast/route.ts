import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch User Data (Reviews and Profile)
        // Get reviews count first
        const { count: reviewsCount } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const currentCount = reviewsCount || 0;

        // Get last roast to check for freshness
        const { data: lastRoast } = await supabase
            .from('user_roasts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // Check if we should serve cached roast
        // Rule: If user has a previous roast, AND hasn't added 5 new reviews since then
        if (lastRoast) {
            const reviewsNeeded = lastRoast.reviews_count_snapshot + 5;
            if (currentCount < reviewsNeeded) {
                // Not enough new data, return existing roast
                return NextResponse.json({
                    ...lastRoast.roast_content,
                    is_cached: true,
                    reviews_needed: reviewsNeeded - currentCount
                });
            }
        }

        // 2. Prepare Data for Gemini
        // Fetch last 50 reviews with album info
        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select(`
                rating, 
                review_text, 
                created_at,
                albums (name, artists)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (reviewsError) {
            console.error('Roast API: Error fetching reviews content', reviewsError);
            return NextResponse.json({ error: 'Database error fetching reviews.' }, { status: 500 });
        }

        // Allow roasting with at least 3 reviews
        if (!reviews || reviews.length < 3) {
            const count = reviews?.length || 0;
            return NextResponse.json({
                error: `Not enough data. You only have ${count} review(s). Please review at least 3 albums so I can judge you properly.`
            }, { status: 400 });
        }

        // Format history for the prompt
        const historyText = reviews.map((r: any) => {
            const albumName = r.albums?.name || 'Unknown Album';
            const artist = r.albums?.artists || 'Unknown Artist';
            return `- Album: "${albumName}" by ${artist}. User Rating: ${r.rating}/5. User Review: "${r.review_text || ''}"`;
        }).join('\n');

        // 3. Generate Roast with Gemini
        // Using generic flash-latest to avoid 2.0 quota limits
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            You are a brutally honest, aggressive, and hilarious music critic.
            Analyze this user's listening history and roast their music taste.
            
            User's Review History:
            ${historyText}

            Instructions for the roast:
            1. USE SIMPLE ENGLISH. No fancy words. Use slang if it fits.
            2. BE AGGRESSIVE. Do not hold back. Truly insult their taste.
            3. BE FUNNY. It must be entertaining, not just mean.
            4. Keep it SHORT and PUNCHY.

            Output must be valid JSON with NO markdown formatting, just raw JSON.
            Structure:
            {
                "diagnosis": "A short, funny diagnosis (2-4 words max) (e.g. 'Basic Bro Disorder')",
                "roast_text": "A 2-3 sentence roast directly addressing the user. Destroy them for their specific choices. Be ruthless.",
                "rating": "A rating out of 10 with a mean label (e.g. '2/10 - Trash')",
                "hashtag": "A single funny hashtag"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if Gemini sends them
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let roastData;
        try {
            roastData = JSON.parse(jsonText);
        } catch (e) {
            console.error('Failed to parse Gemini JSON:', text);
            return NextResponse.json({ error: 'AI Brain malfunction. Try again.' }, { status: 500 });
        }

        // 4. Save to DB
        const { error: saveError } = await supabase
            .from('user_roasts')
            .insert({
                user_id: user.id,
                roast_content: roastData,
                reviews_count_snapshot: currentCount
            });

        if (saveError) {
            console.error('Failed to save user_roast:', saveError);
        }

        return NextResponse.json({
            ...roastData,
            is_cached: false
        });

    } catch (error) {
        console.error('Roast API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
