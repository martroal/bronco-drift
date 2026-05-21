import { Link, useLocation } from 'react-router-dom';
import AuthMenu from './AuthMenu';
import { esRutaPublica } from '@/lib/publicRoutes';

/**
 * Header global de Bronco Drift. Aparece sticky en TODAS las rutas
 * (portfolio, landings de nichos, apps de nichos).
 *
 * Excepción: rutas públicas standalone (ej `/contratos/firmar/:token`)
 * no muestran el header. Allí el usuario está accediendo a un documento
 * compartido, no a la plataforma.
 */
export default function BroncoHeader() {
  const location = useLocation();
  if (esRutaPublica(location.pathname)) return null;

  return (
    <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-md border-b border-stone-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-12 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-xs font-mono tracking-tight text-neutral-300 hover:text-white transition-colors py-3 px-1"
        >
          bronco-drift
        </Link>
        <AuthMenu />
      </div>
    </header>
  );
}
