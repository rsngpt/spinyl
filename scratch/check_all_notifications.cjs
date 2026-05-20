const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        const { data: profiles } = await supabase.from('profiles').select('id, username');
        console.log(`Checking ${profiles?.length || 0} profiles...`);
        
        let totalCount = 0;
        for (const p of profiles || []) {
            const { data: notifs, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', p.id);
            if (notifs && notifs.length > 0) {
                console.log(`User ${p.username} (${p.id}) has ${notifs.length} notifications:`, notifs);
                totalCount += notifs.length;
            }
        }
        console.log(`Total notifications found across all users: ${totalCount}`);
    } catch(e) {
        console.error(e);
    }
}

check();
