import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, LogOut, Mail, Plus, Upload, UserPlus } from 'lucide-react';
import { config } from './config';
import { useUser, loginWithMagicLink, logout } from '@/lib/auth';
import { estaSuscripto, suscribir } from '@/lib/modulos';
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

  if (loadingUser) return <PantallaCarga />;
  if (!user) return <PantallaLogin />;
  return <AppLogueada userId={user.id} email={user.email ?? ''} />;
}

/* -------------------- Pantallas de estado -------------------- */

function PantallaCarga() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-xs text-neutral-500">Cargando...</div>
    </div>
  );
}

function PantallaLogin() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error: err } = await loginWithMagicLink(email.trim());
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setEnviado(true);
    }
  }

  return (
    <div
      className="min-h-screen text-neutral-100 flex items-center justify-center px-4"
      style={{ background: `radial-gradient(ellipse at top, ${config.acentoSoft}, transparent 60%), #0a0a0a` }}
    >
      <div className="max-w-sm w-full">
        <Link to="/contadores" className="block text-center text-xl font-semibold mb-6" style={{ color: config.acento }}>
          {config.nombre}
        </Link>

        {enviado ? (
          <div className="rounded-lg border border-neutral-800 p-6 text-center space-y-2">
            <Mail size={32} className="mx-auto text-neutral-400" />
            <p className="text-sm">Revisá tu casilla.</p>
            <p className="text-xs text-neutral-500">Te enviamos un link para entrar a {config.nombre}.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-lg border border-neutral-800 p-6 space-y-4">
            <div>
              <h1 className="text-sm font-semibold mb-1">Entrar a {config.nombre}</h1>
              <p className="text-xs text-neutral-500">Ingresá tu mail, te mandamos un link sin contraseña.</p>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm"
              autoFocus
              required
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: config.acento }}
              className="w-full px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Enviando...' : 'Enviar link de acceso'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-neutral-500 mt-4">
          <Link to="/contadores" className="hover:text-neutral-300">← Volver a la landing</Link>
        </p>
      </div>
    </div>
  );
}

/* -------------------- App logueada -------------------- */

function AppLogueada({ userId, email }: { userId: string; email: string }) {
  const [suscripto, setSuscripto] = useState<boolean | null>(null);
  const [suscribiendo, setSuscribiendo] = useState(false);

  useEffect(() => {
    estaSuscripto(userId, config.nicho).then(setSuscripto);
  }, [userId]);

  async function activar() {
    setSuscribiendo(true);
    const { error } = await suscribir(userId, config.nicho);
    setSuscribiendo(false);
    if (!error) setSuscripto(true);
  }

  if (suscripto === null) return <PantallaCarga />;

  if (!suscripto) {
    return (
      <div
        className="min-h-screen text-neutral-100 flex items-center justify-center px-4"
        style={{ background: `radial-gradient(ellipse at top, ${config.acentoSoft}, transparent 60%), #0a0a0a` }}
      >
        <div className="max-w-sm w-full rounded-lg border border-neutral-800 p-6 space-y-4 text-center">
          <h1 className="text-base font-semibold">Bienvenido a {config.nombre}</h1>
          <p className="text-sm text-neutral-400">
            Activá tu cuenta de {config.nombre} para empezar a cargar vencimientos.
          </p>
          <button
            onClick={activar}
            disabled={suscribiendo}
            style={{ backgroundColor: config.acento }}
            className="w-full px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {suscribiendo ? 'Activando...' : 'Activar mi cuenta'}
          </button>
        </div>
      </div>
    );
  }

  return <Panel userId={userId} email={email} />;
}

/* -------------------- Panel principal -------------------- */

function Panel({ userId, email }: { userId: string; email: string }) {
  const [obligaciones, setObligaciones] = useState<ObligacionConCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalCliente, setModalCliente] = useState(false);
  const [modalObligacion, setModalObligacion] = useState(false);
  const [modalImport, setModalImport] = useState(false);
  const [exportando, setExportando] = useState(false);

  const recargar = useCallback(async () => {
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

  async function handleMarcarPresentado(id: string) {
    // Optimistic: sacar de la lista antes de que vuelva Supabase.
    const previo = obligaciones;
    setObligaciones((prev) => prev.filter((o) => o.id !== id));
    try {
      await marcarPresentado(id);
    } catch (err) {
      // Revert si falla.
      setObligaciones(previo);
      setError((err as Error).message);
    }
  }

  async function handleExport() {
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/contadores" className="text-base font-semibold" style={{ color: config.acento }}>
            {config.nombre}
          </Link>
          <span className="text-xs text-neutral-500 hidden sm:inline">{config.tagline}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 hidden sm:inline">{email}</span>
          <button
            onClick={logout}
            className="text-neutral-400 hover:text-white"
            title="Salir"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-lg font-semibold">Vencimientos pendientes</h1>
            <p className="text-xs text-neutral-500">
              {obligaciones.length} {obligaciones.length === 1 ? 'obligación' : 'obligaciones'} por presentar
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setModalImport(true)}
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
              onClick={() => setModalCliente(true)}
              className="flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-xs hover:border-neutral-500"
            >
              <UserPlus size={14} />
              Nuevo cliente
            </button>
            <button
              onClick={() => setModalObligacion(true)}
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

        {loading ? (
          <div className="text-center text-xs text-neutral-500 py-12">Cargando vencimientos...</div>
        ) : obligaciones.length === 0 ? (
          <EmptyState
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
    </div>
  );
}

function EmptyState({ onCargar, onImportar }: { onCargar: () => void; onImportar: () => void }) {
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
