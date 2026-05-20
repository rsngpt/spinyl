const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('id', 'bbf2b465-d6bf-4a5f-8885-e820a44871b7')
            .single();
        console.log('Username for bbf2b465-d6bf-4a5f-8885-e820a44871b7:', data);
    } catch(e) {
        console.error(e);
    }
}

check();
