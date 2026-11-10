export default async function sql(strings: TemplateStringsArray, ...values: any[]) {
  // Menggabungkan template string SQL secara aman
  let query = strings[0];
  for (let i = 0; i < values.length; i++) {
    query += `$${i + 1}` + strings[i + 1];
  }

  const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9LYZp1qdaBZX@ep-winter-sea-b18q5m84-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

  try {
    // Menggunakan Neon SQL HTTP API resmi (Port HTTP standar yang diizinkan di Cloudflare)
    const url = new URL(connectionString);
    const host = url.hostname.replace('-pooler', ''); // Menggunakan host HTTP langsung
    const database = url.pathname.slice(1);
    const user = url.username;
    const password = url.password;
    const endpoint = `https://${url.hostname}/sql`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${user}:${password}`)
      },
      body: JSON.stringify({
        query: query,
        params: values,
        database: database
      })
    });

    if (!response.ok) {
      console.error("Neon HTTP API Error:", await response.text());
      return [];
    }

    const data = await response.json();
    return data.rows || [];
  } catch (err) {
    console.error("Database fetch exception:", err);
    return [];
  }
}