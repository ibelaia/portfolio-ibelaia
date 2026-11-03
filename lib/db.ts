import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';

const sql = postgres(connectionString, {
  ssl: 'require',
  transform: {
    undefined: null,
  }
});

export default sql;