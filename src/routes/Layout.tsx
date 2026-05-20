import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-mono text-sm tracking-tight">
          bronco-drift
        </Link>
        <nav className="text-xs text-neutral-400">
          v0.0.0
        </nav>
      </header>
      <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-800 px-6 py-4 text-xs text-neutral-500">
        Una app por semana. Un nicho por semana.
      </footer>
    </div>
  );
}
