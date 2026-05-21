import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { accentForPath } from '@/lib/routeAccent';
import ModalAuth from './ModalAuth';

const STORAGE_KEY = 'bronco_auth_banner_dismissed';

/**
 * Banner persistente que invita a iniciar sesión cuando NO hay user.
 * Dismisible con X (la elección se guarda en localStorage).
 * Se oculta automáticamente cuando hay user logueado.
 *
 * Acento y nombre del producto se resuelven por ruta. Props son override.
 */
export default function AuthBanner({
  acento: acentoOverride,
  nombreProducto: nombreOverride,
  mensaje = 'Para guardar tus datos y volver a verlos cuando quieras, iniciá sesión.',
}: {
  acento?: string;
  nombreProducto?: string;
  mensaje?: string;
}) {
  const { user, loading } = useUser();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const [modal, setModal] = useState<'login' | 'register' | null>(null);

  const resolved = accentForPath(location.pathname);
  const acento = acentoOverride ?? resolved.acento;
  const nombreProducto = nombreOverride ?? resolved.nombreProducto;

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

  // Background tinted con el acento del módulo activo (~7% alpha).
  const bgTint = `${acento}12`;

  return (
    <>
      <div
        className="border-b border-stone-800/60 px-4 py-2 flex items-center justify-center gap-3 text-xs"
        style={{ backgroundColor: bgTint }}
      >
        <span className="text-stone-300 text-center">{mensaje}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setModal('register')}
            style={{ backgroundColor: acento }}
            className="rounded-md px-2.5 py-1 text-white font-medium hover:opacity-90"
          >
            Crear cuenta
          </button>
          <button
            onClick={() => setModal('login')}
            className="text-stone-300 hover:text-white px-2"
          >
            Entrar
          </button>
          <button
            onClick={cerrar}
            className="text-stone-500 hover:text-white ml-1"
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
