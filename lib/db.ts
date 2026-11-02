import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';

// Menggunakan konfigurasi yang kompatibel dengan Cloudflare Serverless / Edge
const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

export default sql;