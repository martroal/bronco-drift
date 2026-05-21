import { Routes, Route } from 'react-router-dom';
import BroncoShell from './components/BroncoShell';
import Home from './routes/Home';
import ProjectModule from './routes/ProjectModule';
import ContadoresApp from './proyectos/contadores/App';
import FreudApp from './proyectos/psicologos/App';
import ContratosApp from './proyectos/contratos/App';

export default function App() {
  return (
    <Routes>
      <Route element={<BroncoShell />}>
        {/* Portfolio público de Bronco Drift */}
        <Route path="/" element={<Home />} />
        <Route path="/proyectos/:slug" element={<ProjectModule />} />

        {/* Módulos: entrada directa a la app, sin landing. */}
        <Route path="/contadores/*" element={<ContadoresApp />} />
        <Route path="/freud/*" element={<FreudApp />} />
        <Route path="/contratos/*" element={<ContratosApp />} />
      </Route>
    </Routes>
  );
}
