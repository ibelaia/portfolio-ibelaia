import { neon, neonConfig } from '@neondatabase/serverless';

// Mengaktifkan fetch connection cache agar stabil
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL || '';
const sql = neon(connectionString);

export default sql;