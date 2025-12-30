'use client';

import { useState } from 'react';

export default function HomePage() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [createdPaste, setCreatedPaste] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const pasteData: any = {
      content,
    };

    if (ttlSeconds) {
      pasteData.ttl_seconds = parseInt(ttlSeconds, 10);
    }

    if (maxViews) {
      pasteData.max_views = parseInt(maxViews, 10);
    }

    try {
      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pasteData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      setCreatedPaste(data);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdPaste) {
      navigator.clipboard.writeText(createdPaste.url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pastebin Lite</h1>
          <p className="text-gray-600">Create and share text snippets with optional expiry</p>
        </div>

        {createdPaste ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-600 mb-4">✓ Paste Created!</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Share this URL:
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={createdPaste.url}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-900"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => setCreatedPaste(null)}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Create Another Paste
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Paste</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={8}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste your content here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label htmlFor="ttl" className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry (seconds, optional)
                  </label>
                  <input
                    type="number"
                    id="ttl"
                    value={ttlSeconds}
                    onChange={(e) => setTtlSeconds(e.target.value)}
                    min="1"
                    placeholder="e.g., 3600"
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty for no expiry</p>
                </div>

                <div>
                  <label htmlFor="maxViews" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Views (optional)
                  </label>
                  <input
                    type="number"
                    id="maxViews"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    min="1"
                    placeholder="e.g., 10"
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited views</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Paste'}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All pastes are public. Use constraints to limit accessibility.</p>
        </div>
      </div>
    </div>
  );
}