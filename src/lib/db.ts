import postgres from 'postgres';

// For serverless environments (Vercel)
declare global {
  var postgresSqlClient: ReturnType<typeof postgres> | undefined;
}

// Get database URL with proper SSL
function getDatabaseURL(): string {
  // Check for direct connection string
  if (process.env.POSTGRES_URL) {
    // Ensure SSL is enabled in the URL
    const url = process.env.POSTGRES_URL;
    if (!url.includes('sslmode=')) {
      return `${url}?sslmode=require`;
    }
    return url;
  }
  
  // Check for individual Neon variables
  if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
    return `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}/${process.env.PGDATABASE}?sslmode=require`;
  }
  
  // For local development without Neon
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  throw new Error('Database connection string not found. Please set POSTGRES_URL or Neon variables.');
}

// Create database connection
export const sql = globalThis.postgresSqlClient ?? postgres(getDatabaseURL(), {
  ssl: process.env.NODE_ENV === 'development' ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Cache the connection in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.postgresSqlClient = sql;
}