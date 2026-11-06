import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || '';

// Menggunakan neon client berbasis HTTP yang kompatibel dengan Cloudflare Edge Runtime
const sql = neon(connectionString);

export default sql; 