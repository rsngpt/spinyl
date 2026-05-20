const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        console.log('--- Database Check ---');
        
        // 1. Get current profiles
        const { data: profiles, error: pErr } = await supabase
            .from('profiles')
            .select('id, username')
            .limit(10);
        console.log('Profiles sample:', profiles);
        
        // 2. Count notifications
        const { data: notifs, error: nErr } = await supabase
            .from('notifications')
            .select('id, user_id, type, message')
            .limit(10);
        console.log('Notifications sample:', notifs);

        // 3. Count follows
        const { data: follows, error: fErr } = await supabase
            .from('follows')
            .select('follower_id, following_id')
            .limit(10);
        console.log('Follows sample:', follows);
    } catch(e) {
        console.error(e);
    }
}

check();
