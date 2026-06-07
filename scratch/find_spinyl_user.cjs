const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUser() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', '%spinyl%');

  if (error) {
    console.error('Error finding user:', error);
  } else {
    console.log('Matching profiles:', data);
  }
}

findUser();
