import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, Trash2 } from 'lucide-react';
import {
  actualizarPaciente,
  eliminarPaciente,
  listarSesionesDePaciente,
  obtenerPaciente,
  type EstadoPaciente,
  type Paciente,
  type SesionConTags,
} from '../lib/queries';
import { config } from '../config';
import TimelineSesion from '../components/TimelineSesion';
import ModalSesion from '../components/ModalSesion';

export default function PacienteDetalle({ userId }: { userId: string }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [sesiones, setSesiones] = useState<SesionConTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalSesionAbierto, setModalSesionAbierto] = useState(false);
  const [sesionEditar, setSesionEditar] = useState<SesionConTags | null>(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);
  const [editandoMotivo, setEditandoMotivo] = useState(false);
  const [motivoTexto, setMotivoTexto] = useState('');

  const cargar = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [p, ss] = await Promise.all([obtenerPaciente(id), listarSesionesDePaciente(id)]);
      setPaciente(p);
      setMotivoTexto(p?.motivo_consulta ?? '');
      setSesiones(ss);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function cambiarEstado(estado: EstadoPaciente) {
    if (!paciente) return;
    try {
      const actualizado = await actualizarPaciente(paciente.id, { estado });
      setPaciente(actualizado);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function guardarMotivo() {
    if (!paciente) return;
    try {
      const actualizado = await actualizarPaciente(paciente.id, {
        motivo_consulta: motivoTexto.trim() || null,
      });
      setPaciente(actualizado);
      setEditandoMotivo(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function borrarPaciente() {
    if (!paciente) return;
    try {
      await eliminarPaciente(paciente.id);
      navigate('/freud/app/pacientes');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function abrirNuevaSesion() {
    setSesionEditar(null);
    setModalSesionAbierto(true);
  }

  function abrirEditarSesion(s: SesionConTags) {
    setSesionEditar(s);
    setModalSesionAbierto(true);
  }

  if (loading) {
    return <div className="text-center text-xs text-neutral-500 py-20">Cargando paciente...</div>;
  }

  if (!paciente) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-neutral-400 mb-4">No encontré ese paciente.</p>
        <Link to="/freud/app/pacientes" className="text-xs underline" style={{ color: config.acento }}>
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link
        to="/freud/app/pacientes"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 mb-6"
      >
        <ArrowLeft size={12} />
        Pacientes
      </Link>

      {/* Header del paciente */}
      <header className="mb-8 pb-6 border-b border-neutral-800/70">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: config.serif }}>
            {paciente.nombre}
          </h1>
          <EstadoSelector estado={paciente.estado} onChange={cambiarEstado} />
        </div>
        <p className="text-xs text-neutral-500 mb-4">
          {sesiones.length} {sesiones.length === 1 ? 'sesión registrada' : 'sesiones registradas'}
          {paciente.primera_sesion && (
            <> · primera el {new Date(paciente.primera_sesion).toLocaleDateString('es-AR')}</>
          )}
        </p>

        {/* Motivo de consulta editable inline */}
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1" style={{ fontFamily: config.serif }}>
            Motivo de consulta
          </div>
          {editandoMotivo ? (
            <div className="space-y-2">
              <textarea
                value={motivoTexto}
                onChange={(e) => setMotivoTexto(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm h-24 resize-none focus:border-neutral-600 focus:outline-none"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={guardarMotivo}
                  style={{ backgroundColor: config.acento }}
                  className="px-3 py-1 text-xs font-medium text-white rounded-md hover:opacity-90"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setMotivoTexto(paciente.motivo_consulta ?? '');
                    setEditandoMotivo(false);
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditandoMotivo(true)}
              className="text-left text-sm text-neutral-300 hover:text-white w-full leading-relaxed"
            >
              {paciente.motivo_consulta ?? (
                <span className="text-neutral-600 italic">Agregar motivo de consulta...</span>
              )}
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 mb-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Timeline + botón nueva sesión */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2
            className="text-xs uppercase tracking-[0.18em] text-neutral-500"
            style={{ fontFamily: config.serif }}
          >
            Cuaderno de sesiones
          </h2>
          <button
            onClick={abrirNuevaSesion}
            style={{ backgroundColor: config.acento }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90"
          >
            <Plus size={12} />
            Nueva sesión
          </button>
        </div>

        {sesiones.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center">
            <Calendar size={28} className="mx-auto mb-3 text-neutral-600" />
            <p className="text-base mb-2" style={{ fontFamily: config.serif }}>
              Aún no hay sesiones registradas.
            </p>
            <p className="text-sm text-neutral-500 mb-5">
              Cargá la primera con los prompts del cuaderno.
            </p>
            <button
              onClick={abrirNuevaSesion}
              style={{ backgroundColor: config.acento }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
            >
              <Plus size={14} />
              Primera sesión
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            {sesiones.map((s) => (
              <TimelineSesion key={s.id} sesion={s} onEditar={abrirEditarSesion} />
            ))}
          </div>
        )}
      </section>

      {/* Borrar paciente al final, después de scroll */}
      <footer className="mt-16 pt-8 border-t border-neutral-800/60 flex items-center justify-between gap-2">
        <p className="text-[10px] text-neutral-600">
          Cualquier dato cargado acá es solo tuyo. Nadie más lo ve.
        </p>
        {confirmarBorrar ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">¿Borrar {paciente.nombre} y todas sus sesiones?</span>
            <button
              onClick={borrarPaciente}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Sí, borrar
            </button>
            <button
              onClick={() => setConfirmarBorrar(false)}
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmarBorrar(true)}
            className="inline-flex items-center gap-1 text-[10px] text-neutral-600 hover:text-red-400"
          >
            <Trash2 size={10} />
            Borrar paciente
          </button>
        )}
      </footer>

      {/* Modal sesión */}
      <ModalSesion
        open={modalSesionAbierto}
        onClose={() => setModalSesionAbierto(false)}
        userId={userId}
        pacienteId={paciente.id}
        sesionExistente={sesionEditar}
        onSaved={cargar}
        onDeleted={cargar}
      />
    </div>
  );
}

function EstadoSelector({
  estado,
  onChange,
}: {
  estado: EstadoPaciente;
  onChange: (e: EstadoPaciente) => void;
}) {
  const opciones: { value: EstadoPaciente; label: string; color: string }[] = [
    { value: 'activo', label: 'Activo', color: '#10b981' },
    { value: 'pausa', label: 'En pausa', color: '#f59e0b' },
    { value: 'alta', label: 'Alta', color: '#737373' },
  ];
  return (
    <div className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-950 p-0.5">
      {opciones.map((op) => (
        <button
          key={op.value}
          onClick={() => onChange(op.value)}
          className={`text-[10px] px-2 py-0.5 rounded-sm transition-all ${estado === op.value ? 'bg-neutral-800' : 'opacity-50 hover:opacity-100'}`}
          style={{ color: estado === op.value ? op.color : undefined }}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
