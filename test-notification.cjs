const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    console.log('URL:', supabaseUrl);
    console.log('KEY:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing notification logic...');
    // Use the ID from the logs
    const userId = 'bbf2b465-d6bf-4a5f-8885-e820a44871b7';
    console.log('Target User:', userId);

    try {
        console.log('1. Fetching follows...');
        const { data: follows, error: followError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', userId);

        if (followError) {
            console.error('Follow Error:', followError);
            return;
        }
        console.log('Follows Found:', follows?.length || 0);

        if (!follows || follows.length === 0) return;

        const followingIds = follows.map(f => f.following_id);
        console.log('Following IDs:', followingIds);

        console.log('2. Fetching reviews...');
        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select(`
                id,
                created_at,
                profiles (username, avatar_url),
                albums (id, name, cover_image)
            `)
            .in('user_id', followingIds)
            .order('created_at', { ascending: false })
            .limit(10);

        if (reviewsError) {
            console.error('Reviews Error:', reviewsError);
            return;
        }
        console.log('Reviews Found:', reviews?.length || 0);
        if (reviews && reviews.length > 0) {
            console.log('Sample Review:', JSON.stringify(reviews[0], null, 2));
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

test();
