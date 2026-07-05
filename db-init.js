const { Client } = require('pg');
require('dotenv').config();

async function initDatabase() {
  const dbName = process.env.DB_NAME || 'ktt_assets';
  
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres'
  };

  const client = new Client(config);

  try {
    await client.connect();
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error during database initialization:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: dbName
  };
  const dbClient = new Client(dbConfig);
  try {
    await dbClient.connect();
    await dbClient.query('CREATE SCHEMA IF NOT EXISTS "ktt"');
    console.log('Schema "ktt" verified/created successfully.');
  } catch (err) {
    console.error('Error during schema initialization:', err.message);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
