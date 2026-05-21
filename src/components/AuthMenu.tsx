import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useUser, logout } from '@/lib/auth';
import { accentForPath } from '@/lib/routeAccent';
import ModalAuth from './ModalAuth';

/**
 * Menú de auth para colocar en el header de cualquier ruta (portfolio o módulo).
 * Sin sesión: botones "Iniciar sesión" y "Crear cuenta" que abren el modal.
 * Con sesión: email + botón logout.
 *
 * Touch targets respetan WCAG 2.1 AA (mínimo 44x44 efectivo via padding).
 */
export default function AuthMenu({
  acento: acentoOverride,
  nombreProducto: nombreOverride,
  compact = false,
}: {
  acento?: string;
  nombreProducto?: string;
  compact?: boolean;
}) {
  const { user, loading } = useUser();
  const location = useLocation();
  const [modal, setModal] = useState<'login' | 'register' | null>(null);

  const resolved = accentForPath(location.pathname);
  const acento = acentoOverride ?? resolved.acento;
  const nombreProducto = nombreOverride ?? resolved.nombreProducto;

  if (loading) {
    return <div className="text-xs text-neutral-600">...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {!compact && (
          <span className="text-xs text-neutral-500 hidden sm:inline truncate max-w-[180px]">
            {user.email}
          </span>
        )}
        <button
          onClick={logout}
          className="text-neutral-400 hover:text-white p-2.5 rounded-md"
          title={`Salir (${user.email ?? ''})`}
          aria-label="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setModal('login')}
          className="text-xs text-neutral-300 hover:text-white px-3 py-2.5 rounded-md"
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => setModal('register')}
          style={{ backgroundColor: acento }}
          className="text-xs font-medium text-white px-3 py-2.5 rounded-md hover:opacity-90"
        >
          Crear cuenta
        </button>
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
