import { sql } from './db';

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS pastes (
        id VARCHAR(21) PRIMARY KEY,
        content TEXT NOT NULL,
        ttl_seconds INTEGER,
        expires_at TIMESTAMP WITH TIME ZONE,
        max_views INTEGER,
        views INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `;
    console.log('Database table initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Export table schema for reference
export const pasteSchema = {
  table: 'pastes',
  columns: {
    id: 'id',
    content: 'content',
    ttlSeconds: 'ttl_seconds',
    expiresAt: 'expires_at',
    maxViews: 'max_views',
    views: 'views',
    createdAt: 'created_at'
  }
} as const;