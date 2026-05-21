import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { accentForPath } from '@/lib/routeAccent';
import { esRutaPublica } from '@/lib/publicRoutes';
import ModalAuth from './ModalAuth';

const STORAGE_KEY = 'bronco_auth_banner_dismissed';

/**
 * Banner persistente que invita a iniciar sesión cuando NO hay user.
 *
 * - Dismisible con X (la elección se guarda en localStorage).
 * - Se oculta cuando hay user logueado.
 * - Se oculta en rutas públicas standalone (ej `/contratos/firmar/:token`).
 * - Detecta si el módulo activo está en light mode (ej `/contratos/*`) y
 *   ajusta el tono del banner para no clashear con el papel cremoso.
 * - Copy adaptativo: short en mobile, completo desde tablet.
 */
export default function AuthBanner({
  acento: acentoOverride,
  nombreProducto: nombreOverride,
  mensajeCompleto = 'Para guardar tus datos y volver a verlos cuando quieras, iniciá sesión.',
  mensajeCorto = 'Guardá tu data en la nube',
}: {
  acento?: string;
  nombreProducto?: string;
  mensajeCompleto?: string;
  mensajeCorto?: string;
}) {
  const { user, loading } = useUser();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const [modal, setModal] = useState<'login' | 'register' | null>(null);

  const resolved = accentForPath(location.pathname);
  const acento = acentoOverride ?? resolved.acento;
  const nombreProducto = nombreOverride ?? resolved.nombreProducto;

  // El módulo de contratos usa light mode. Detectamos por path y ajustamos el banner.
  const enModuloLight = location.pathname.startsWith('/contratos');

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  function cerrar() {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  }

  if (loading) return null;
  if (user) return null;
  if (dismissed) return null;
  if (esRutaPublica(location.pathname)) return null;

  // Estilos según light/dark mode
  const estilo = enModuloLight
    ? {
        background: `${acento}10`,
        border: `1px solid ${acento}25`,
        text: '#44403c', // stone-700
        textMuted: '#78716c', // stone-500
      }
    : {
        background: `${acento}12`,
        border: '1px solid rgba(120, 113, 108, 0.30)',
        text: '#d6d3d1', // stone-300
        textMuted: '#a8a29e', // stone-400
      };

  return (
    <>
      <div
        className="px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs"
        style={{
          backgroundColor: estilo.background,
          borderBottom: estilo.border,
        }}
      >
        <span className="text-center" style={{ color: estilo.text }}>
          <span className="sm:hidden">{mensajeCorto}</span>
          <span className="hidden sm:inline">{mensajeCompleto}</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setModal('register')}
            style={{ backgroundColor: acento }}
            className="rounded-md px-3 py-2 text-white font-medium hover:opacity-90 text-xs"
          >
            Crear cuenta
          </button>
          <button
            onClick={() => setModal('login')}
            className="px-3 py-2 text-xs hover:underline"
            style={{ color: estilo.text }}
          >
            Entrar
          </button>
          <button
            onClick={cerrar}
            className="p-2 rounded-md hover:bg-black/5"
            style={{ color: estilo.textMuted }}
            aria-label="Cerrar banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <ModalAuth
        open={modal !== null}
        modoInicial={modal ?? 'login'}
        onClose={() => setModal(null)}
        acento={acento}
        nombreProducto={nombreProducto}
      />
    </>
  );
}
