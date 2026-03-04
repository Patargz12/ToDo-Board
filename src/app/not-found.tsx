export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 px-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10 select-none">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_4px_24px_rgba(99,102,241,0.4)] mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold bg-linear-to-r from-slate-200 to-indigo-300 bg-clip-text text-transparent">
          TaskBoard
        </h1>
      </div>


      <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-indigo-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 8v3m0 3h.01" />
          </svg>
        </div>

        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
          404 — Not Found
        </span>

        <h2 className="text-xl font-bold text-slate-100 mb-2">Page doesn't exist</h2>

        <p className="text-sm text-slate-500 leading-relaxed">
          The page you're looking for couldn't be found. It may have been moved, deleted, or you
          may have typed the URL incorrectly.
        </p>
      </div>
    </div>
  );
}
