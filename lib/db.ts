import { neon } from '@neondatabase/serverless';

// Membuat fungsi wrapper agar koneksi diinisialisasi secara dinamis saat kueri dipanggil
const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  const connectionString = process.env.DATABASE_URL || '';
  const sqlClient = neon(connectionString);
  return sqlClient(strings, ...values);
};

export default sql;