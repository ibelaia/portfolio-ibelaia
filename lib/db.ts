import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';
// Menggunakan konfigurasi fetch/ssl yang aman untuk serverless Cloudflare Workers
const sql = postgres(connectionString, { 
  ssl: 'require',
  max: 1, // Batasi koneksi maksimal untuk lingkungan serverless
  idle_timeout: 20,
  connect_timeout: 10
});

export default sql;