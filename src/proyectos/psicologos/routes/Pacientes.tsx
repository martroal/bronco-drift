import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, UserPlus } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { listarPacientes, type Paciente, type EstadoPaciente } from '../lib/queries';
import { formatearProxima } from '../lib/recap';
import { config } from '../config';
import ModalNuevoPaciente from '../components/ModalNuevoPaciente';
import ModalAuth from '@/components/ModalAuth';

const estadoLabel: Record<EstadoPaciente, string> = {
  activo: 'activo',
  pausa: 'en pausa',
  alta: 'alta',
};

export default function Pacientes({ user }: { user: User | null }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPaciente | 'todos'>('todos');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalAuth, setModalAuth] = useState(false);

  const userId = user?.id ?? null;

  async function cargar() {
    if (!userId) {
      setPacientes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listarPacientes(userId);
      setPacientes(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [userId]);

  function pedirAuthOEjecutar(accion: () => void) {
    if (!userId) {
      setModalAuth(true);
    } else {
      accion();
    }
  }

  const filtrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    return pacientes.filter((p) => {
      if (estadoFiltro !== 'todos' && p.estado !== estadoFiltro) return false;
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        (p.motivo_consulta ?? '').toLowerCase().includes(q)
      );
    });
  }, [pacientes, filtro, estadoFiltro]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: config.serif }}>
            Pacientes
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {userId
              ? `${pacientes.length} en total · ${pacientes.filter((p) => p.estado === 'activo').length} activos`
              : 'Iniciá sesión para ver y guardar tus pacientes'}
          </p>
        </div>
        <button
          onClick={() => pedirAuthOEjecutar(() => setModalNuevo(true))}
          style={{ backgroundColor: config.acento }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
        >
          <UserPlus size={14} />
          Nuevo paciente
        </button>
      </header>

      {/* Search + filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex-1 min-w-[240px] relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por nombre o motivo..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md pl-9 pr-3 py-2 text-sm focus:border-neutral-600 focus:outline-none transition-colors"
            disabled={!userId}
          />
        </div>
        <FiltroEstado value={estadoFiltro} onChange={setEstadoFiltro} disabled={!userId} />
      </div>

      {!userId ? (
        <EmptyAnonimo onLogin={() => setModalAuth(true)} />
      ) : loading ? (
        <div className="text-center text-xs text-neutral-500 py-20">Cargando pacientes...</div>
      ) : filtrados.length === 0 ? (
        <EmptyState onCrear={() => setModalNuevo(true)} tieneAlgo={pacientes.length > 0} />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {filtrados.map((p) => (
            <li key={p.id}>
              <PacienteCard paciente={p} />
            </li>
          ))}
        </ul>
      )}

      {userId && (
        <ModalNuevoPaciente
          open={modalNuevo}
          onClose={() => setModalNuevo(false)}
          userId={userId}
          onCreated={cargar}
        />
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

function PacienteCard({ paciente }: { paciente: Paciente }) {
  const estadoColor: Record<EstadoPaciente, string> = {
    activo: 'text-emerald-400',
    pausa: 'text-amber-400',
    alta: 'text-neutral-500',
  };

  return (
    <Link
      to={`/freud/app/pacientes/${paciente.id}`}
      className="block rounded-xl border border-neutral-800 p-4 hover:border-neutral-700 transition-colors group h-full"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3
          className="text-base font-medium leading-snug min-w-0 truncate"
          style={{ fontFamily: config.serif }}
        >
          {paciente.nombre}
        </h3>
        <ArrowRight
          size={14}
          className="shrink-0 text-neutral-600 group-hover:text-neutral-300 transition-colors"
        />
      </div>

      {paciente.motivo_consulta && (
        <p className="text-xs text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
          {paciente.motivo_consulta}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 text-[10px] text-neutral-500 mt-auto">
        <span className={`uppercase tracking-wider ${estadoColor[paciente.estado]}`}>
          {estadoLabel[paciente.estado]}
        </span>
        {paciente.proxima_sesion && (
          <span style={{ color: config.acento }}>
            próx: {formatearProxima(paciente.proxima_sesion)}
          </span>
        )}
      </div>
    </Link>
  );
}

function FiltroEstado({
  value,
  onChange,
  disabled,
}: {
  value: EstadoPaciente | 'todos';
  onChange: (v: EstadoPaciente | 'todos') => void;
  disabled?: boolean;
}) {
  const opciones: { value: EstadoPaciente | 'todos'; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'activo', label: 'Activos' },
    { value: 'pausa', label: 'En pausa' },
    { value: 'alta', label: 'Alta' },
  ];
  return (
    <div className={`flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-950 p-0.5 ${disabled ? 'opacity-40' : ''}`}>
      {opciones.map((op) => (
        <button
          key={op.value}
          onClick={() => onChange(op.value)}
          disabled={disabled}
          className={`text-xs px-2 py-1 rounded-sm transition-colors ${value === op.value ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'} ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}

function EmptyAnonimo({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center">
      <p className="text-base mb-2" style={{ fontFamily: config.serif }}>
        Tus pacientes te esperan acá.
      </p>
      <p className="text-sm text-neutral-500 mb-5 max-w-md mx-auto">
        Cargás cada paciente una vez, después solo agregás sus sesiones. La memoria queda guardada y sincronizada en cualquier dispositivo.
      </p>
      <button
        onClick={onLogin}
        style={{ backgroundColor: config.acento }}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
      >
        <UserPlus size={14} />
        Crear cuenta gratis
      </button>
    </div>
  );
}

function EmptyState({ onCrear, tieneAlgo }: { onCrear: () => void; tieneAlgo: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center">
      <p className="text-base mb-2" style={{ fontFamily: config.serif }}>
        {tieneAlgo ? 'Nada que coincida con tu búsqueda.' : 'Tu cuaderno está vacío.'}
      </p>
      <p className="text-sm text-neutral-500 mb-5">
        {tieneAlgo ? 'Probá con otros términos o cambiá el filtro.' : 'Empezá agregando tu primer paciente.'}
      </p>
      {!tieneAlgo && (
        <button
          onClick={onCrear}
          style={{ backgroundColor: config.acento }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
        >
          <UserPlus size={14} />
          Nuevo paciente
        </button>
      )}
    </div>
  );
}
