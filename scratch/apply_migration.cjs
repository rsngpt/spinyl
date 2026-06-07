const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:SpinylDb2026Password!@db.ngpbgyqybxzbzzfkoyew.supabase.co:5432/postgres';

const sqlPath = path.join(__dirname, '../create_boiler_rooms.sql');
console.log(`Reading SQL file from: ${sqlPath}`);
const sql = fs.readFileSync(sqlPath, 'utf8');

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
    console.log('Connected successfully. Executing SQL...');
    
    await client.query(sql);
    console.log('SQL executed successfully! Table and policies created.');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
