import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useUser } from '@/lib/auth';
import ModalAuth from './ModalAuth';

const STORAGE_KEY = 'bronco_auth_banner_dismissed';

/**
 * Banner persistente que invita a iniciar sesión cuando NO hay user.
 * Dismisible con X (la elección se guarda en localStorage).
 * Se oculta automáticamente cuando hay user logueado.
 */
export default function AuthBanner({
  acento = '#0ea5e9',
  nombreProducto,
  mensaje = 'Para guardar tus datos y volver a verlos cuando quieras, iniciá sesión.',
}: {
  acento?: string;
  nombreProducto?: string;
  mensaje?: string;
}) {
  const { user, loading } = useUser();
  const [dismissed, setDismissed] = useState(false);
  const [modal, setModal] = useState<'login' | 'register' | null>(null);

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

  return (
    <>
      <div
        className="border-b border-neutral-800/60 px-4 py-2 flex items-center justify-center gap-3 text-xs"
        style={{ backgroundColor: 'rgba(14, 165, 233, 0.06)' }}
      >
        <span className="text-neutral-300 text-center">{mensaje}</span>
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
            className="text-neutral-300 hover:text-white px-2"
          >
            Entrar
          </button>
          <button
            onClick={cerrar}
            className="text-neutral-500 hover:text-white ml-1"
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
