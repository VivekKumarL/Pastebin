
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">404 | Page Not Found</h1>
      <h4 className="text-gray-600 mb-8">This shareable link has expired or been deleted.</h4>
      
      <div className="space-y-3">
        <Link
          href="/"
          className="block px-6 py-3 bg-blue-600 text-white rounded-lg text-center"
        >
          Create New Link
        </Link>        
      </div>
    </div>
  );
}