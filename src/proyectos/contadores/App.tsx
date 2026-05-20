import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Plus, Upload, UserPlus } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { config } from './config';
import { useUser } from '@/lib/auth';
import { suscribir } from '@/lib/modulos';
import ModalAuth from '@/components/ModalAuth';
import {
  exportTodo,
  listarPendientes,
  marcarPresentado,
  type ObligacionConCliente,
} from './lib/queries';
import { downloadCSV, unparseCSV } from './lib/csv';
import { toISODate } from './lib/fechas';
import FilaVencimiento from './components/FilaVencimiento';
import ModalNuevoCliente from './components/ModalNuevoCliente';
import ModalNuevaObligacion from './components/ModalNuevaObligacion';
import ModalImportCSV from './components/ModalImportCSV';

export default function VencetApp() {
  const { user, loading: loadingUser } = useUser();

  // Auto-suscribir al user al módulo en background. Idempotente (unique en bronco_user_nichos).
  useEffect(() => {
    if (user) {
      suscribir(user.id, config.nicho).catch(() => {
        // Falla silenciosa. Si el user no quedó suscripto, el próximo intento de guardar lo va a intentar de nuevo.
      });
    }
  }, [user]);

  if (loadingUser) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-xs text-neutral-500">Cargando...</div>
      </div>
    );
  }

  return <Panel user={user} />;
}

/* -------------------- Panel principal -------------------- */

function Panel({ user }: { user: User | null }) {
  const [obligaciones, setObligaciones] = useState<ObligacionConCliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalCliente, setModalCliente] = useState(false);
  const [modalObligacion, setModalObligacion] = useState(false);
  const [modalImport, setModalImport] = useState(false);
  const [modalAuth, setModalAuth] = useState(false);
  const [exportando, setExportando] = useState(false);

  const userId = user?.id ?? null;

  const recargar = useCallback(async () => {
    if (!userId) {
      setObligaciones([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listarPendientes(userId);
      setObligaciones(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  /** Interceptor: si no hay user, abre el modal de auth en lugar de la acción pedida. */
  function pedirAuthOEjecutar(accion: () => void) {
    if (!userId) {
      setModalAuth(true);
    } else {
      accion();
    }
  }

  async function handleMarcarPresentado(id: string) {
    if (!userId) return; // No debería pasar (si no hay user no hay filas), pero por seguridad.
    const previo = obligaciones;
    setObligaciones((prev) => prev.filter((o) => o.id !== id));
    try {
      await marcarPresentado(id);
    } catch (err) {
      setObligaciones(previo);
      setError((err as Error).message);
    }
  }

  async function handleExport() {
    if (!userId) {
      setModalAuth(true);
      return;
    }
    setExportando(true);
    setError(null);
    try {
      const data = await exportTodo(userId);
      const csv = unparseCSV(data);
      const filename = `vencet-${toISODate(new Date())}.csv`;
      downloadCSV(filename, csv);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Subheader propio del módulo Vencet (debajo del header global de Bronco Drift) */}
      <div
        className="border-b border-neutral-800/60 px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
        style={{ backgroundColor: config.acentoSoft }}
      >
        <Link to="/contadores" className="text-base font-semibold shrink-0" style={{ color: config.acento }}>
          {config.nombre}
        </Link>
        <span className="text-xs text-neutral-400 hidden sm:inline truncate">{config.tagline}</span>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-lg font-semibold">Vencimientos pendientes</h1>
            <p className="text-xs text-neutral-500">
              {userId
                ? `${obligaciones.length} ${obligaciones.length === 1 ? 'obligación' : 'obligaciones'} por presentar`
                : 'Iniciá sesión para ver y guardar tus vencimientos'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => pedirAuthOEjecutar(() => setModalImport(true))}
              className="flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-xs hover:border-neutral-500"
            >
              <Upload size={14} />
              Importar CSV
            </button>
            <button
              onClick={handleExport}
              disabled={exportando}
              className="flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-xs hover:border-neutral-500 disabled:opacity-50"
            >
              <Download size={14} />
              {exportando ? 'Exportando...' : 'Exportar'}
            </button>
            <button
              onClick={() => pedirAuthOEjecutar(() => setModalCliente(true))}
              className="flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-xs hover:border-neutral-500"
            >
              <UserPlus size={14} />
              Nuevo cliente
            </button>
            <button
              onClick={() => pedirAuthOEjecutar(() => setModalObligacion(true))}
              style={{ backgroundColor: config.acento }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90"
            >
              <Plus size={14} />
              Nueva obligación
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 mb-4 text-xs text-red-300">
            {error}
          </div>
        )}

        {!userId ? (
          <EmptyStateAnonimo onLogin={() => setModalAuth(true)} />
        ) : loading ? (
          <div className="text-center text-xs text-neutral-500 py-12">Cargando vencimientos...</div>
        ) : obligaciones.length === 0 ? (
          <EmptyStateVacio
            onCargar={() => setModalCliente(true)}
            onImportar={() => setModalImport(true)}
          />
        ) : (
          <div className="rounded-lg border border-neutral-800 px-4">
            {obligaciones.map((o) => (
              <FilaVencimiento
                key={o.id}
                obligacion={o}
                onMarcarPresentado={handleMarcarPresentado}
              />
            ))}
          </div>
        )}
      </main>

      {userId && (
        <>
          <ModalNuevoCliente
            open={modalCliente}
            onClose={() => setModalCliente(false)}
            userId={userId}
            onCreated={recargar}
          />
          <ModalNuevaObligacion
            open={modalObligacion}
            onClose={() => setModalObligacion(false)}
            userId={userId}
            onCreated={recargar}
          />
          <ModalImportCSV
            open={modalImport}
            onClose={() => setModalImport(false)}
            userId={userId}
            onImported={recargar}
          />
        </>
      )}

      <ModalAuth
        open={modalAuth}
        onClose={() => setModalAuth(false)}
        acento={config.acento}
        nombreProducto={config.nombre}
      />
    </div>
  );
}

/* -------------------- Empty states -------------------- */

function EmptyStateAnonimo({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-800 p-12 text-center space-y-4">
      <h2 className="text-base font-medium">Probá {config.nombre}</h2>
      <p className="text-sm text-neutral-400 max-w-md mx-auto">
        Iniciá sesión para empezar a cargar tus clientes y obligaciones. Tu data queda guardada y la ves desde cualquier dispositivo.
      </p>
      <button
        onClick={onLogin}
        style={{ backgroundColor: config.acento }}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
      >
        Crear cuenta gratis
      </button>
    </div>
  );
}

function EmptyStateVacio({ onCargar, onImportar }: { onCargar: () => void; onImportar: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-800 p-12 text-center space-y-4">
      <h2 className="text-base font-medium">Tu panel está vacío</h2>
      <p className="text-sm text-neutral-400 max-w-md mx-auto">
        Empezá cargando un cliente o importá toda tu data desde un CSV. La segunda opción es la más rápida si ya tenés una planilla Excel.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={onImportar}
          style={{ backgroundColor: config.acento }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
        >
          <Upload size={14} />
          Importar mi CSV
        </button>
        <button
          onClick={onCargar}
          className="flex items-center gap-1.5 rounded-md border border-neutral-700 px-4 py-2 text-xs hover:border-neutral-500"
        >
          <UserPlus size={14} />
          Cargar el primer cliente
        </button>
      </div>
    </div>
  );
}
