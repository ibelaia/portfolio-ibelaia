import { neon } from '@neondatabase/serverless';

// Menggunakan inisialisasi koneksi pooling resmi Neon yang terbukti stabil
const sql = neon(
  process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9LYZp1qdaBZX@ep-winter-sea-b18q5m84-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require'
);

export default sql;