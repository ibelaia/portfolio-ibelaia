import { neon } from '@neondatabase/serverless';

const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  // Masukkan string connection Neon pooling secara langsung agar tidak bergantung pada env Cloudflare yang sering gagal dibaca
  const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9LYZp1qdaBZX@ep-winter-sea-b18q5m84-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  
  const sqlClient = neon(connectionString);
  return sqlClient(strings, ...values);
};

export default sql;