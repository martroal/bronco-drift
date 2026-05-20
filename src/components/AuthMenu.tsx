import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useUser, logout } from '@/lib/auth';
import ModalAuth from './ModalAuth';

/**
 * Menú de auth para colocar en el header de cualquier ruta (portfolio o módulo).
 * Sin sesión: botones "Iniciar sesión" y "Crear cuenta" que abren el modal.
 * Con sesión: email + botón logout.
 */
export default function AuthMenu({
  acento = '#0ea5e9',
  nombreProducto,
  compact = false,
}: {
  acento?: string;
  nombreProducto?: string;
  compact?: boolean;
}) {
  const { user, loading } = useUser();
  const [modal, setModal] = useState<'login' | 'register' | null>(null);

  if (loading) {
    return <div className="text-xs text-neutral-600">...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {!compact && (
          <span className="text-xs text-neutral-500 hidden sm:inline truncate max-w-[180px]">
            {user.email}
          </span>
        )}
        <button
          onClick={logout}
          className="text-neutral-400 hover:text-white"
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
      <div className="flex items-center gap-2">
        <button
          onClick={() => setModal('login')}
          className="text-xs text-neutral-300 hover:text-white px-2 py-1.5"
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => setModal('register')}
          style={{ backgroundColor: acento }}
          className="text-xs font-medium text-white px-3 py-1.5 rounded-md hover:opacity-90"
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
