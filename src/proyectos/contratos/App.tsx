import { useEffect, useRef } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useUser } from '@/lib/auth';
import Onboarding from '@/components/Onboarding';
import { config } from './config';
import { contratosOnboardingSteps, contratosOnboardingStorageKey } from './onboarding';
import { migrarLocalASupabase } from './lib/migracion';
import Lista from './routes/Lista';
import Nuevo from './routes/Nuevo';
import Detalle from './routes/Detalle';
import Firmar from './routes/Firmar';
import Preguntas from './routes/Preguntas';

export default function ContratosApp() {
  const { user, loading } = useUser();
  const userIdPrevio = useRef<string | null>(null);
  const location = useLocation();

  // Migración local → Supabase al loguearse.
  useEffect(() => {
    const userId = user?.id ?? null;
    if (userId && !userIdPrevio.current) {
      migrarLocalASupabase(userId)
        .then((res) => {
          if (res.migrados > 0) {
            console.log(`[Contratos] Migración local→Supabase: ${res.migrados} contratos.`);
            window.location.reload();
          }
        })
        .catch((err) => console.error('[Contratos] Migración falló:', err));
    }
    userIdPrevio.current = userId;
  }, [user]);

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center py-20"
        style={{ backgroundColor: config.papel, color: config.tintaMuyTenue }}
      >
        <div className="text-xs">Cargando...</div>
      </div>
    );
  }

  // La página pública de firma (/contratos/firmar/:token) no muestra subheader.
  const esPaginaFirmaPublica = /^\/contratos\/firmar\/[^/]+$/.test(location.pathname);

  return (
    <div
      className="flex-1 flex flex-col"
      style={{
        backgroundColor: config.papel,
        color: config.tinta,
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(124, 45, 18, 0.04), transparent 40%), radial-gradient(circle at 100% 100%, rgba(124, 45, 18, 0.03), transparent 40%)',
      }}
    >
      {!esPaginaFirmaPublica && <Subheader />}

      <div className="flex-1">
        <Routes>
          <Route index element={<Lista user={user} />} />
          <Route path="nuevo" element={<Nuevo user={user} />} />
          <Route path="preguntas" element={<Preguntas />} />
          <Route path="firmar/:token" element={<Firmar />} />
          <Route path=":id/editar" element={<Nuevo user={user} />} />
          <Route path=":id" element={<Detalle user={user} />} />
        </Routes>
      </div>

      {!esPaginaFirmaPublica && (
        <Onboarding
          steps={contratosOnboardingSteps}
          storageKey={contratosOnboardingStorageKey}
          acento={config.acento}
          acentoSoft={config.acentoSoft}
          fontFamily={config.serifDisplay}
        />
      )}
    </div>
  );
}

/* -------------------- subheader del módulo -------------------- */

function Subheader() {
  return (
    <div
      className="border-b"
      style={{ borderColor: config.borde, backgroundColor: 'rgba(124, 45, 18, 0.04)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-baseline justify-between gap-4">
        <Link to="/contratos" className="flex items-baseline gap-3 min-w-0">
          <span
            className="text-base font-semibold"
            style={{ color: config.acento, fontFamily: config.serifDisplay, ...config.fraunces.titularDuro }}
          >
            Firma Digital Simple
          </span>
          <span className="text-xs hidden sm:inline truncate" style={{ color: config.tintaSuave }}>
            {config.tagline}
          </span>
        </Link>
      </div>
    </div>
  );
}
