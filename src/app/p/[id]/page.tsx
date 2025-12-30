import { sql } from '@/lib/db';
import { isPasteExpired, isViewLimitExceeded, getNowFromHeaders } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;
  const headers = await import('next/headers').then(m => m.headers());
  const now = getNowFromHeaders(headers);
  
  const pastes = await sql`
    SELECT * FROM pastes WHERE id = ${id}
  `;
  
  if (pastes.length === 0) {
    notFound();
  }
  
  const paste = pastes[0];
  
  if (isPasteExpired(paste, now) || isViewLimitExceeded(paste)) {
    notFound();
  }
  
  // Increment view count for HTML view as well
  await sql`
    UPDATE pastes 
    SET views = views + 1 
    WHERE id = ${id}
  `;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pastebin App</h1>
          <p className="text-gray-600 mt-2">Content ID: {id}</p>
        </header>
        
        <main className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Paste Content</h2>
            <div className="text-sm text-gray-500">
              Views: {paste.views + 1}
              {paste.max_views && ` / ${paste.max_views}`}
              {paste.expires_at && ` • Expires: ${new Date(paste.expires_at).toLocaleString()}`}
            </div>
          </div>
          
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-gray-800">
            {paste.content}
          </pre>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Create another link
            </a>
          </div>
        </main>
      </div>
    </div>
  );

}

