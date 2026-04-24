import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center bg-canvas-bg text-gray-100 gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-sm text-gray-400">Page not found.</p>
      <Link
        href="/"
        className="px-4 py-2 text-sm rounded border border-gray-600 hover:border-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        ← Back to home
      </Link>
    </main>
  );
}
