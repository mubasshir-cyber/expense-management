import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
      <div className="p-4 rounded-3xl bg-blue-50 text-blue-600 border border-blue-200 text-3xl font-black font-mono">
        404
      </div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm">
        The page you are looking for does not exist in your SBI Expense Manager.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-mono uppercase shadow-md shadow-blue-600/25 transition-all"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
