import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Home as HomeIcon, NotebookPen } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useUser } from '@/lib/auth';
import { suscribir } from '@/lib/modulos';
import ModalAuth from '@/components/ModalAuth';
import { config } from './config';
import Inicio from './routes/Inicio';
import Pacientes from './routes/Pacientes';
import PacienteDetalle from './routes/PacienteDetalle';

export default function FreudApp() {
  const { user, loading } = useUser();

  // Auto-suscribir al user al módulo (idempotente).
  useEffect(() => {
    if (user) {
      suscribir(user.id, config.nicho).catch(() => undefined);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-xs text-neutral-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col"
      style={{
        background: `radial-gradient(ellipse at top, ${config.acentoSoft}, transparent 50%), #0a0a0a`,
      }}
    >
      <Subheader />
      {user ? <AppLogueada user={user} /> : <PantallaAnonima />}
    </div>
  );
}

/* -------------------- Subheader del módulo -------------------- */

function Subheader() {
  return (
    <div
      className="border-b border-neutral-800/60"
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
          <span className="text-xs text-neutral-400 hidden sm:inline truncate">
            {config.tagline}
          </span>
        </Link>
      </div>
    </div>
  );
}

/* -------------------- Pantalla sin sesión -------------------- */

function PantallaAnonima() {
  const [modal, setModal] = useState<'login' | 'register' | null>(null);
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2" style={{ fontFamily: config.serif }}>
          Freud
        </p>
        <h1 className="text-2xl sm:text-3xl mb-4 tracking-tight" style={{ fontFamily: config.serif }}>
          Tu cuaderno te está esperando.
        </h1>
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          Iniciá sesión o creá una cuenta para empezar a registrar pacientes y sesiones. La cuenta es gratis, sin tarjeta, sin pruebas que vencen.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setModal('register')}
            style={{ backgroundColor: config.acento }}
            className="px-4 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
          >
            Crear cuenta gratis
          </button>
          <button
            onClick={() => setModal('login')}
            className="px-4 py-2 text-xs text-neutral-300 hover:text-white"
          >
            Iniciar sesión
          </button>
        </div>

        <ModalAuth
          open={modal !== null}
          modoInicial={modal ?? 'login'}
          onClose={() => setModal(null)}
          acento={config.acento}
          nombreProducto={config.nombre}
        />
      </div>
    </div>
  );
}

/* -------------------- App logueada -------------------- */

function AppLogueada({ user }: { user: User }) {
  return (
    <>
      <NavTabs />
      <div className="flex-1">
        <Routes>
          <Route index element={<Inicio userId={user.id} />} />
          <Route path="pacientes" element={<Pacientes userId={user.id} />} />
          <Route path="pacientes/:id" element={<PacienteDetalle userId={user.id} />} />
        </Routes>
      </div>
    </>
  );
}

function NavTabs() {
  const location = useLocation();
  // Detectar si estamos en detalle de paciente — ahí ocultamos las tabs para no recargar visualmente.
  const enDetalle = /\/freud\/app\/pacientes\/[^/]+$/.test(location.pathname);
  if (enDetalle) return null;

  const tabs = [
    { to: '/freud/app', label: 'Inicio', icon: <HomeIcon size={13} />, end: true },
    { to: '/freud/app/pacientes', label: 'Pacientes', icon: <NotebookPen size={13} />, end: false },
  ];

  return (
    <nav className="border-b border-neutral-800/60">
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
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
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
