import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    
    // Get paste
    const result = await sql`SELECT * FROM pastes WHERE id = ${id}`;
    
    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }
    
    const paste = result[0];
    
    // Check expiry
    if (paste.expires_at) {
      const expiry = new Date(paste.expires_at);
      const now = new Date();
      
      // Check test mode
      if (process.env.TEST_MODE === '1') {
        const testTime = request.headers.get('x-test-now-ms');
        if (testTime) {
          const testNow = parseInt(testTime);
          if (!isNaN(testNow)) {
            if (expiry <= new Date(testNow)) {
              return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
              );
            }
          }
        }
      } else if (expiry <= now) {
        return NextResponse.json(
          { error: 'Paste not found' },
          { status: 404 }
        );
      }
    }
    
    // Check view limit
    if (paste.max_views && paste.views >= paste.max_views) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }
    
    // Increment view
    await sql`UPDATE pastes SET views = views + 1 WHERE id = ${id}`;
    
    // Calculate remaining
    const remaining_views = paste.max_views 
      ? Math.max(0, paste.max_views - paste.views - 1)
      : null;
    
    return NextResponse.json({
      content: paste.content,
      remaining_views,
      expires_at: paste.expires_at,
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}