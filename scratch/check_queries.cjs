const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const userId = 'bbf2b465-d6bf-4a5f-8885-e820a44871b7';

async function check() {
    try {
        console.log('Testing follows query...');
        const followsRes = await supabase
            .from('follows')
            .select(`
                follower_id,
                created_at,
                follower:profiles!follows_follower_id_fkey (username, avatar_url)
            `)
            .eq('following_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);
        
        console.log('Follows Error:', followsRes.error);
        console.log('Follows Data:', followsRes.data);

        console.log('Testing reviews query...');
        const { data: followingData, error: followingError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', userId);
        
        console.log('Following Error:', followingError);
        const followingIds = followingData?.map(f => f.following_id) || [];
        console.log('Following IDs count:', followingIds.length);

        if (followingIds.length > 0) {
            const reviewsRes = await supabase
                .from('reviews')
                .select(`
                    id,
                    created_at,
                    profiles!user_id (username, avatar_url),
                    albums (id, spotify_id, name, cover_image)
                `)
                .in('user_id', followingIds)
                .order('created_at', { ascending: false })
                .limit(20);
            console.log('Reviews Error:', reviewsRes.error);
            console.log('Reviews Count:', reviewsRes.data?.length);
        }

        console.log('Testing notifications query...');
        const realNotifsRes = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);
        console.log('Notifications Error:', realNotifsRes.error);
        console.log('Notifications Count:', realNotifsRes.data?.length);

    } catch(e) {
        console.error(e);
    }
}

check();
