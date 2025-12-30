import { nanoid } from 'nanoid';
import { Paste } from './types';

export function generateId(): string {
  return nanoid(10); // 10-character ID for shorter URLs
}

export function isPasteExpired(paste: any, now: Date): boolean {
  if (!paste.expires_at) return false;
  const expiryDate = new Date(paste.expires_at);
  return expiryDate <= now;
}

export function isViewLimitExceeded(paste: any): boolean {
  if (!paste.max_views) return false;
  return paste.views >= paste.max_views;
}

export function getNowFromHeaders(headers: Headers): Date {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode) {
    const testNowHeader = headers.get('x-test-now-ms');
    if (testNowHeader) {
      const testNowMs = parseInt(testNowHeader, 10);
      if (!isNaN(testNowMs)) {
        return new Date(testNowMs);
      }
    }
  }
  return new Date();
}

export function calculateExpiry(ttlSeconds?: number): Date | null {
  if (!ttlSeconds) return null;
  const now = new Date();
  return new Date(now.getTime() + ttlSeconds * 1000);
}