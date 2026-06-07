const { Client } = require('pg');

const connectionString = 'postgresql://postgres:SpinylDb2026Password!@db.ngpbgyqybxzbzzfkoyew.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully. Enabling realtime for boiler_rooms...');
    
    await client.query(`
      alter publication supabase_realtime add table public.boiler_rooms;
    `);
    console.log('Realtime enabled successfully!');
  } catch (err) {
    console.error('Error executing SQL:', err.message);
  } finally {
    await client.end();
  }
}

run();
