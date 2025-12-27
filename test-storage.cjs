const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log('Testing upload to "avatars" bucket...');

    // Create a dummy file
    const content = 'Hello World ' + Date.now();
    const fileName = `test-upload-${Date.now()}.txt`;

    // Upload
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, Buffer.from(content), {
            contentType: 'text/plain',
            upsert: true
        });

    if (uploadError) {
        console.error('Upload Failed:', uploadError);
        return;
    }

    console.log('Upload Success:', uploadData);

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

    console.log('Public URL:', publicUrl);

    // Verify Access
    const fetch = await import('node-fetch').then(m => m.default);
    const res = await fetch(publicUrl);

    if (res.ok) {
        console.log('Public Access Verification: OK', await res.text());
    } else {
        console.error('Public Access Verification Failed:', res.status, res.statusText);
    }
}

testUpload();
