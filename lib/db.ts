import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || '';

// Menginisialisasi neon client berbasis HTTP/fetch yang aman untuk Cloudflare Workers
const sql = neon(connectionString);

export default sql;