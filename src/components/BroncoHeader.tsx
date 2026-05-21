import { Link } from 'react-router-dom';
import AuthMenu from './AuthMenu';

/**
 * Header global de Bronco Drift. Aparece sticky en TODAS las rutas
 * (portfolio, landings de nichos, apps de nichos).
 * Identifica la plataforma; lo que va debajo es libertad de cada módulo.
 */
export default function BroncoHeader() {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-md border-b border-stone-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-xs font-mono tracking-tight text-neutral-300 hover:text-white transition-colors"
        >
          bronco-drift
        </Link>
        <AuthMenu />
      </div>
    </header>
  );
}
