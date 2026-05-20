const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        console.log('Querying pg_policies...');
        // We can query pg_policies using rpc or direct query if available, 
        // but since we don't have direct SQL runner via HTTP client unless we write an edge function, 
        // we can try fetching data for a few profiles and check metadata.
        
        // Wait, let's query the supabase client with auth to see what happens.
        // What profiles are available?
        const { data: profiles } = await supabase.from('profiles').select('id, username').limit(5);
        console.log('Available Profiles:', profiles);
        
        for (const p of profiles || []) {
            const { data: notifs, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', p.id);
            console.log(`User ${p.username} (${p.id}) notifications count:`, notifs?.length, 'Error:', error);
        }
    } catch(e) {
        console.error(e);
    }
}

check();
