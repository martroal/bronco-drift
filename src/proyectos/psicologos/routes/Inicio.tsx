import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, NotebookPen, UserPlus } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Paciente } from '../lib/queries';
import { listarPacientes, proximosPacientes } from '../lib/queries';
import { ultimasSesionesDePaciente } from '../lib/queries';
import { formatearPasado, formatearProxima } from '../lib/recap';
import { config } from '../config';
import ModalNuevoPaciente from '../components/ModalNuevoPaciente';

type Recap = {
  ultimaFecha: string | null;
  temaUltima: string | null;
  tareaPendiente: string | null;
  planProxima: string | null;
  cantidadSesiones: number;
};

export default function Inicio({ user }: { user: User | null }) {
  const [proximos, setProximos] = useState<{ paciente: Paciente; recap: Recap | null }[]>([]);
  const [todosLosPacientes, setTodosLosPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNuevo, setModalNuevo] = useState(false);

  const userId = user?.id ?? null;

  async function cargar() {
    setLoading(true);
    try {
      const [proxs, todos] = await Promise.all([
        proximosPacientes(userId, 7),
        listarPacientes(userId),
      ]);
      const enriched = await Promise.all(
        proxs.map(async (p) => {
          const sesiones = await ultimasSesionesDePaciente(userId, p.id, 3);
          if (sesiones.length === 0) {
            return {
              paciente: p,
              recap: {
                ultimaFecha: null,
                temaUltima: null,
                tareaPendiente: null,
                planProxima: null,
                cantidadSesiones: 0,
              } as Recap,
            };
          }
          const ultima = sesiones[0];
          return {
            paciente: p,
            recap: {
              ultimaFecha: ultima.fecha,
              temaUltima: ultima.tema_central,
              tareaPendiente: ultima.tarea_propuesta,
              planProxima: ultima.plan_proxima,
              cantidadSesiones: sesiones.length,
            } as Recap,
          };
        }),
      );
      setProximos(enriched);
      setTodosLosPacientes(todos);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center text-xs text-stone-500 py-20">Cargando tu cuaderno...</div>
    );
  }

  const tienePacientes = todosLosPacientes.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <header>
        <p
          className="text-xs uppercase tracking-wider text-stone-500 mb-1"
          style={{ fontFamily: config.serif }}
        >
          {saludoSegunHora()}
        </p>
        <h1 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: config.serif }}>
          ¿Listo para hoy?
        </h1>
        {!userId && tienePacientes && (
          <p className="text-xs text-stone-500 mt-3">
            Guardando en tu navegador. <span className="text-stone-300">Creá cuenta gratis</span> para sincronizar entre dispositivos.
          </p>
        )}
      </header>

      {/* Próximos turnos con recap */}
      <section>
        <SectionTitle>Próximos pacientes</SectionTitle>
        {proximos.length === 0 ? (
          <EmptyProximos
            tienePacientes={tienePacientes}
            onCrear={() => setModalNuevo(true)}
          />
        ) : (
          <ul className="space-y-3">
            {proximos.map(({ paciente, recap }) => (
              <li key={paciente.id}>
                <Link
                  to={`/freud/pacientes/${paciente.id}`}
                  className="block rounded-xl border border-stone-800 p-4 sm:p-5 hover:border-stone-700 transition-colors group"
                  style={{ backgroundColor: 'rgba(161, 98, 7, 0.03)' }}
                >
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-base sm:text-lg font-medium" style={{ fontFamily: config.serif }}>
                      {paciente.nombre}
                    </h3>
                    {paciente.proxima_sesion && (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: config.acentoSoft, color: config.acento }}
                      >
                        <Clock size={12} />
                        {formatearProxima(paciente.proxima_sesion)}
                      </span>
                    )}
                  </div>
                  {recap ? (
                    <RecapDetalle recap={recap} />
                  ) : (
                    <p className="text-xs text-stone-500 italic">Cargando notas...</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Acciones rápidas */}
      <section>
        <SectionTitle>Acciones rápidas</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-3">
          <ActionCard
            to="/freud/pacientes"
            icon={<NotebookPen size={18} />}
            titulo="Mis pacientes"
            descripcion={
              tienePacientes
                ? `${todosLosPacientes.length} ${todosLosPacientes.length === 1 ? 'paciente' : 'pacientes'} en tu cuaderno`
                : 'Ver y buscar todos tus pacientes'
            }
          />
          <ActionCardButton
            onClick={() => setModalNuevo(true)}
            icon={<UserPlus size={18} />}
            titulo="Nuevo paciente"
            descripcion="Empezá un nuevo proceso terapéutico"
          />
        </div>
      </section>

      <ModalNuevoPaciente
        open={modalNuevo}
        onClose={() => setModalNuevo(false)}
        userId={userId}
        onCreated={cargar}
      />
    </div>
  );
}

/* -------------------- componentes locales -------------------- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-3 pb-2 border-b border-stone-800/70"
      style={{ fontFamily: config.serif }}
    >
      {children}
    </h2>
  );
}

function RecapDetalle({ recap }: { recap: Recap }) {
  if (recap.cantidadSesiones === 0) {
    return (
      <p className="text-xs text-stone-400">
        Primera sesión. Sin notas previas todavía.
      </p>
    );
  }

  return (
    <div className="space-y-1.5 text-xs text-stone-400">
      {recap.ultimaFecha && (
        <p>
          <span className="text-stone-600">Última sesión:</span>{' '}
          <span className="text-stone-300">{formatearPasado(recap.ultimaFecha)}</span>
          {recap.temaUltima && (
            <>
              <span className="text-stone-600"> · tema:</span>{' '}
              <span className="text-stone-200">{recap.temaUltima}</span>
            </>
          )}
        </p>
      )}
      {recap.tareaPendiente && (
        <p>
          <span className="text-stone-600">Tarea pendiente:</span>{' '}
          <span className="text-stone-200">{recap.tareaPendiente}</span>
        </p>
      )}
      {recap.planProxima && (
        <p>
          <span className="text-stone-600">Plan que escribiste:</span>{' '}
          <span className="text-stone-200">{recap.planProxima}</span>
        </p>
      )}
    </div>
  );
}

function EmptyProximos({
  tienePacientes,
  onCrear,
}: {
  tienePacientes: boolean;
  onCrear: () => void;
}) {
  if (!tienePacientes) {
    return (
      <div className="rounded-xl border border-dashed border-stone-800 p-8 sm:p-12 text-center">
        <p className="text-base sm:text-lg mb-2" style={{ fontFamily: config.serif }}>
          El cuaderno está nuevo.
        </p>
        <p className="text-sm text-stone-400 mb-5 max-w-md mx-auto">
          Cargá tu primer paciente y empezá a registrar sesiones. Lo que escribas se guarda en tu navegador (o en tu cuenta si la creás).
        </p>
        <button
          onClick={onCrear}
          style={{ backgroundColor: config.acento }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
        >
          <UserPlus size={14} />
          Crear mi primer paciente
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-stone-800 p-8 text-center">
      <p className="text-sm text-stone-400">
        No hay sesiones agendadas en los próximos 7 días.
      </p>
      <Link
        to="/freud/pacientes"
        className="inline-block mt-3 text-xs underline hover:text-stone-200"
        style={{ color: config.acento }}
      >
        Ver todos los pacientes →
      </Link>
    </div>
  );
}

function ActionCard({
  to,
  icon,
  titulo,
  descripcion,
}: {
  to: string;
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-xl border border-stone-800 p-4 hover:border-stone-700 transition-colors"
    >
      <span
        className="shrink-0 mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: config.acentoSoft, color: config.acento }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-medium text-sm mb-0.5" style={{ fontFamily: config.serif }}>
          {titulo}
        </div>
        <div className="text-xs text-stone-500">{descripcion}</div>
      </div>
    </Link>
  );
}

function ActionCardButton({
  onClick,
  icon,
  titulo,
  descripcion,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 rounded-xl border border-stone-800 p-4 hover:border-stone-700 transition-colors text-left w-full"
    >
      <span
        className="shrink-0 mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: config.acentoSoft, color: config.acento }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-medium text-sm mb-0.5" style={{ fontFamily: config.serif }}>
          {titulo}
        </div>
        <div className="text-xs text-stone-500">{descripcion}</div>
      </div>
    </button>
  );
}

function saludoSegunHora() {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
