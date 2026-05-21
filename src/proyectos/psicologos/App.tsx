import { useEffect, useRef } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Home as HomeIcon, NotebookPen } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { suscribir } from '@/lib/modulos';
import Onboarding from '@/components/Onboarding';
import { config } from './config';
import { freudOnboardingSteps, freudOnboardingStorageKey } from './onboarding';
import { migrarLocalASupabase } from './lib/migracion';
import Inicio from './routes/Inicio';
import Pacientes from './routes/Pacientes';
import PacienteDetalle from './routes/PacienteDetalle';

export default function FreudApp() {
  const { user, loading } = useUser();
  const userIdPrevio = useRef<string | null>(null);

  /**
   * Side effects que se disparan cuando el user cambia.
   * - Auto-suscribir al módulo (idempotente).
   * - Si el user pasó de null a un id (acaba de loguearse), migrar localStorage → Supabase.
   */
  useEffect(() => {
    const userId = user?.id ?? null;

    if (userId && !userIdPrevio.current) {
      // Acaba de loguearse o ya estaba logueado al cargar.
      suscribir(userId, config.nicho).catch(() => undefined);
      migrarLocalASupabase(userId)
        .then((res) => {
          if (res.migradosPacientes > 0 || res.migradasSesiones > 0) {
            console.log(
              `[Freud] Migración local→Supabase OK: ${res.migradosPacientes} pacientes, ${res.migradasSesiones} sesiones, ${res.migradosTags} tags.`,
            );
            // Recargar para que las queries vayan a Supabase y se vea la data migrada.
            window.location.reload();
          }
        })
        .catch((err) => {
          console.error('[Freud] Migración local→Supabase falló:', err);
        });
    }

    userIdPrevio.current = userId;
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-xs text-stone-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col"
      style={{
        background: `radial-gradient(ellipse at top, ${config.acentoSoft}, transparent 50%), #0c0a09`,
      }}
    >
      <Subheader />
      <NavTabs />
      <div className="flex-1">
        <Routes>
          <Route index element={<Inicio user={user} />} />
          <Route path="pacientes" element={<Pacientes user={user} />} />
          <Route path="pacientes/:id" element={<PacienteDetalle user={user} />} />
        </Routes>
      </div>

      <Onboarding
        steps={freudOnboardingSteps}
        storageKey={freudOnboardingStorageKey}
        acento={config.acento}
        acentoSoft={config.acentoSoft}
        fontFamily={config.serif}
      />
    </div>
  );
}

/* -------------------- Subheader del módulo -------------------- */

function Subheader() {
  return (
    <div
      className="border-b border-stone-800/60"
      style={{ backgroundColor: config.acentoSoft }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-baseline justify-between gap-4">
        <Link to="/freud" className="flex items-baseline gap-3 min-w-0">
          <span
            className="text-base font-semibold"
            style={{ color: config.acento, fontFamily: config.serif }}
          >
            Freud
          </span>
          <span className="text-xs text-stone-400 hidden sm:inline truncate">
            {config.tagline}
          </span>
        </Link>
      </div>
    </div>
  );
}

/* -------------------- Tabs internas del módulo -------------------- */

function NavTabs() {
  const location = useLocation();
  // En detalle de paciente ocultamos las tabs para foco visual en el cuaderno.
  const enDetalle = /\/freud\/pacientes\/[^/]+$/.test(location.pathname);
  if (enDetalle) return null;

  const tabs: { to: string; label: string; icon: React.ReactNode; end: boolean }[] = [
    { to: '/freud', label: 'Inicio', icon: <HomeIcon size={13} />, end: true },
    { to: '/freud/pacientes', label: 'Pacientes', icon: <NotebookPen size={13} />, end: false },
  ];

  return (
    <nav className="border-b border-stone-800/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <ul className="flex items-center gap-1">
          {tabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-colors ${
                    isActive
                      ? 'border-current'
                      : 'border-transparent text-stone-500 hover:text-stone-300'
                  }`
                }
                style={({ isActive }) => (isActive ? { color: config.acento } : undefined)}
              >
                {tab.icon}
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
