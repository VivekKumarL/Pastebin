export interface CreatePasteRequest {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
}

export interface CreatePasteResponse {
  id: string;
  url: string;
}

export interface Paste {
  id: string;
  content: string;
  ttl_seconds?: number;
  expires_at?: string | null;
  max_views?: number;
  views: number;
  created_at: string;
}

export interface GetPasteResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}