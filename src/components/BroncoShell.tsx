import { Outlet } from 'react-router-dom';
import BroncoHeader from './BroncoHeader';
import AuthBanner from './AuthBanner';

/**
 * Shell global de Bronco Drift. Envuelve TODAS las rutas.
 * - BroncoHeader sticky arriba (identifica la plataforma + AuthMenu único).
 * - AuthBanner persuasivo debajo (solo si no hay user logueado y no fue cerrado).
 * - Outlet con el contenido de la ruta, libre de decidir su propio layout adentro.
 */
export default function BroncoShell() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <BroncoHeader />
      <AuthBanner />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
