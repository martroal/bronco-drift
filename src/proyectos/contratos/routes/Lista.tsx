import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FilePlus, FileText, Search } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { listarContratos, type Contrato } from '../lib/queries';
import { config } from '../config';
import { useDocTitle } from '@/lib/useDocTitle';

const estadoLabel: Record<Contrato['estado'], string> = {
  borrador: 'Borrador',
  enviado: 'Esperando firma',
  firmado: 'Firmado',
  cancelado: 'Cancelado',
};

const estadoColor: Record<Contrato['estado'], string> = {
  borrador: config.tintaSuave,
  enviado: config.acento,
  firmado: '#15803d',
  cancelado: config.tintaMuyTenue,
};

type FiltroEstado = 'todos' | Contrato['estado'];

export default function Lista({ user }: { user: User | null }) {
  useDocTitle('Tus contratos · Firma Digital Simple');
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>('todos');

  const userId = user?.id ?? null;

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setLoading(true);
      try {
        const data = await listarContratos(userId);
        if (!cancelado) setContratos(data);
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [userId]);

  const filtrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    return contratos.filter((c) => {
      if (estadoFiltro !== 'todos' && c.estado !== estadoFiltro) return false;
      if (!q) return true;
      return c.titulo.toLowerCase().includes(q);
    });
  }, [contratos, filtro, estadoFiltro]);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-4 mb-6 pb-6 border-b" style={{ borderColor: config.borde }}>
        <div>
          <h1
            className="text-3xl sm:text-4xl tracking-tight"
            style={{ fontFamily: config.serifDisplay, ...config.fraunces.titularSuave }}
          >
            Tus contratos
          </h1>
          <p className="text-sm mt-2" style={{ color: config.tintaSuave }}>
            {contratos.length === 0
              ? 'Acá van a vivir los acuerdos que armes.'
              : `${contratos.length} ${contratos.length === 1 ? 'contrato' : 'contratos'}`}
          </p>
        </div>
        <Link
          to="/contratos/nuevo"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: config.acento }}
        >
          <FilePlus size={15} />
          Nuevo contrato
        </Link>
      </header>

      {/* Filtros — solo si hay contratos */}
      {contratos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: config.tintaMuyTenue }}
            />
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full rounded-md border pl-9 pr-3 py-2 text-sm focus:outline-none transition-shadow"
              style={{ backgroundColor: '#ffffff', borderColor: config.borde, color: config.tinta }}
            />
          </div>
          <FiltroEstadoTabs value={estadoFiltro} onChange={setEstadoFiltro} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-sm" style={{ color: config.tintaMuyTenue }}>
          Cargando...
        </div>
      ) : contratos.length === 0 ? (
        <EmptyState />
      ) : filtrados.length === 0 ? (
        <SinResultados onLimpiar={() => { setFiltro(''); setEstadoFiltro('todos'); }} />
      ) : (
        <ul className="space-y-2">
          {filtrados.map((c) => (
            <li key={c.id}>
              <Link
                to={`/contratos/${c.id}`}
                className="block rounded-lg border p-4 hover:shadow-sm transition-shadow group"
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: config.borde,
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h3
                    className="text-base font-medium leading-snug min-w-0 truncate"
                    style={{ fontFamily: config.serifDisplay, color: config.tinta, ...config.fraunces.titularDuro }}
                  >
                    {c.titulo}
                  </h3>
                  <ArrowRight
                    size={14}
                    style={{ color: config.tintaMuyTenue }}
                    className="group-hover:translate-x-0.5 transition-transform shrink-0"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span style={{ color: config.tintaMuyTenue }}>
                    {formatFecha(c.created_at)}
                  </span>
                  <span
                    className="font-medium uppercase tracking-wider"
                    style={{ color: estadoColor[c.estado], fontSize: '10px' }}
                  >
                    {estadoLabel[c.estado]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function FiltroEstadoTabs({ value, onChange }: { value: FiltroEstado; onChange: (v: FiltroEstado) => void }) {
  const opciones: { value: FiltroEstado; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'borrador', label: 'Borradores' },
    { value: 'enviado', label: 'Enviados' },
    { value: 'firmado', label: 'Firmados' },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-md border p-0.5" style={{ borderColor: config.borde, backgroundColor: '#ffffff' }}>
      {opciones.map((op) => (
        <button
          key={op.value}
          onClick={() => onChange(op.value)}
          className="text-xs px-3 py-1.5 rounded-sm transition-colors"
          style={{
            backgroundColor: value === op.value ? config.acentoSoft : 'transparent',
            color: value === op.value ? config.acento : config.tintaSuave,
            fontWeight: value === op.value ? 500 : 400,
          }}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}

function SinResultados({ onLimpiar }: { onLimpiar: () => void }) {
  return (
    <div
      className="rounded-xl border border-dashed p-10 text-center"
      style={{ borderColor: config.bordeFuerte, backgroundColor: '#ffffff' }}
    >
      <p className="text-sm mb-2" style={{ color: config.tinta }}>
        Nada que coincida con tu búsqueda.
      </p>
      <button
        onClick={onLimpiar}
        className="text-xs underline hover:no-underline"
        style={{ color: config.acento }}
      >
        Limpiar filtros
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-xl border border-dashed p-12 sm:p-16 text-center"
      style={{ borderColor: config.bordeFuerte, backgroundColor: '#ffffff' }}
    >
      <FileText size={32} style={{ color: config.tintaMuyTenue }} className="mx-auto mb-4" />
      <h2
        className="text-2xl mb-3"
        style={{ fontFamily: config.serifDisplay, ...config.fraunces.titularSuave }}
      >
        Tu primer contrato te espera.
      </h2>
      <p className="text-sm max-w-md mx-auto mb-6" style={{ color: config.tintaSuave }}>
        Elegí un template, completá los datos, firmá y mandalo. Sin imprimir, sin escanear.
      </p>
      <Link
        to="/contratos/nuevo"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white rounded-md hover:opacity-90"
        style={{ backgroundColor: config.acento }}
      >
        <FilePlus size={15} />
        Empezar mi primer contrato
      </Link>
    </div>
  );
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
