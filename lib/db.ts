import { neon } from '@neondatabase/serverless';

// Memastikan koneksi mengambil URL lingkungan dengan aman di Edge Runtime
const sql = neon(process.env.DATABASE_URL!);

export default sql;