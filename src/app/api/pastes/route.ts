import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { generateId, calculateExpiry } from '@/lib/utils';
import { initializeDatabase } from '@/lib/schema';

const createPasteSchema = z.object({
  content: z.string().min(1, 'Content is required and cannot be empty'),
  ttl_seconds: z.number().int().min(1).optional(),
  max_views: z.number().int().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Creating paste...');
    
    // Initialize database
    try {
      await initializeDatabase();
    } catch (dbError) {
      console.error('Database initialization failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: 'Check your database configuration' },
        { status: 503 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate input
    const validationResult = createPasteSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { content, ttl_seconds, max_views } = validationResult.data;
    const id = generateId();
    const expiresAt = calculateExpiry(ttl_seconds);
    
    // Use environment variable or default for production
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'production' 
                     ? `https://${process.env.VERCEL_URL}` 
                     : 'http://localhost:3000');
    
    const url = `${baseUrl}/p/${id}`;

    // Insert into database
    await sql`
      INSERT INTO pastes (id, content, ttl_seconds, expires_at, max_views)
      VALUES (${id}, ${content}, ${ttl_seconds || null}, ${expiresAt?.toISOString() || null}, ${max_views || null})
    `;

    console.log(`Paste created: ${id}`);
    
    return NextResponse.json(
      { id, url },
      { status: 201 }
    );
  } catch (error) {
  console.error('Failed to create paste:', error);
  
  let errorMessage = 'Internal server error';
  let statusCode = 500;
  
  // Fix: Type cast the error
  if (error instanceof Error) {
    const err = error as Error;
    
    if (err.message.includes('connection') || err.message.includes('SSL')) {
      errorMessage = 'Database connection failed. Check SSL configuration.';
    } else if (err.message.includes('timeout')) {
      errorMessage = 'Database connection timeout.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: process.env.NODE_ENV === 'development' ? err.message : undefined 
      },
      { status: statusCode }
    );
  }
  
  // If error is not an Error instance
  return NextResponse.json(
    { error: errorMessage },
    { status: statusCode }
  );
}
}