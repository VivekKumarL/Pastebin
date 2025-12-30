import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isPasteExpired, isViewLimitExceeded, getNowFromHeaders } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const now = getNowFromHeaders(request.headers);
    
    // First, get the paste without incrementing views
    const pastes = await sql`
      SELECT * FROM pastes WHERE id = ${id}
    `;
    
    if (pastes.length === 0) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }
    
    const paste = pastes[0];
    
    // Check constraints
    if (isPasteExpired(paste, now) || isViewLimitExceeded(paste)) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await sql`
      UPDATE pastes 
      SET views = views + 1 
      WHERE id = ${id}
    `;
    
    // Calculate remaining views
    const remaining_views = paste.max_views 
      ? Math.max(0, paste.max_views - paste.views - 1)
      : null;
    
    return NextResponse.json({
      content: paste.content,
      remaining_views,
      expires_at: paste.expires_at,
    });
  } catch (error) {
    console.error('Failed to fetch paste:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}