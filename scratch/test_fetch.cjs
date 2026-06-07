const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  console.log('Fetching from boiler_rooms with profiles join...');
  const { data, error } = await supabase
      .from('boiler_rooms')
      .select(`
          id,
          content,
          cover_image,
          created_at,
          user_id,
          profiles ( username, avatar_url )
      `)
      .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Data returned:', JSON.stringify(data, null, 2));
  }
}

testFetch();
