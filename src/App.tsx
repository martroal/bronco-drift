import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import BroncoShell from './components/BroncoShell';
import Home from './routes/Home';
import ProjectModule from './routes/ProjectModule';

/**
 * Routing top-level. Cada módulo de nicho se carga en lazy chunk
 * (React.lazy + Suspense). El portfolio en `/` queda en el bundle principal.
 *
 * Cuando agregás un módulo nuevo, registralo como lazy import también.
 */
const ContadoresApp = lazy(() => import('./proyectos/contadores/App'));
const FreudApp = lazy(() => import('./proyectos/psicologos/App'));
const ContratosApp = lazy(() => import('./proyectos/contratos/App'));

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-xs text-stone-500">Cargando módulo...</div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<BroncoShell />}>
        {/* Portfolio público de Bronco Drift */}
        <Route path="/" element={<Home />} />
        <Route path="/proyectos/:slug" element={<ProjectModule />} />

        {/* Módulos: lazy load por chunk. */}
        <Route
          path="/contadores/*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ContadoresApp />
            </Suspense>
          }
        />
        <Route
          path="/freud/*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <FreudApp />
            </Suspense>
          }
        />
        <Route
          path="/contratos/*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ContratosApp />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
