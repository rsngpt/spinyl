const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  console.log('Fetching from boiler_rooms table...');
  const { data, error } = await supabase
    .from('boiler_rooms')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error fetching boiler rooms:', error);
    process.exit(1);
  } else {
    console.log('Success! Fetch returned:', data);
    process.exit(0);
  }
}

testFetch();
