const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function migrate() {
  const directUrl =
    process.env.DIRECT_URL ||
    'postgresql://postgres.kaljmvhnnoknupzkzptz:Rupiyo%407236@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres';

  console.log('🔌 Connecting to Supabase PostgreSQL database via direct pooler...');
  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
    console.log(`📄 Reading DDL migration script from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Executing SQL DDL migration schema (Tables, RLS Policies, Triggers)...');
    await client.query(sql);

    console.log('🎉 Migration completed successfully! Database tables and RLS security policies established.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
