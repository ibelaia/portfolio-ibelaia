import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
});

export default sql;