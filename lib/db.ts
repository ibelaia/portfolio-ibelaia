// Menggunakan HTTP fetch murni yang 100% diizinkan di Cloudflare Workers Edge Runtime
export default async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const query = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? `$${i + 1}` : ''), '');
  
  // Endpoint HTTP Neon Anda
  const endpoint = "https://ep-winter-sea-b18q5m84-pooler.c-6.us-east-2.aws.neon.tech/sql"; // Sesuaikan host database Neon anda jika perlu
  const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_9LYZp1qdaBZX@ep-winter-sea-b18q5m84-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

  // Kita gunakan standar fetch POST ke Neon API
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${connectionString}` // Atau sesuaikan autentikasinya
      },
      body: JSON.stringify({ query, params: values })
    });
    const data = await response.json();
    return data.rows || [];
  } catch (err) {
    console.error("Database fetch error:", err);
    return [];
  }
}