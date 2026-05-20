import { Routes, Route } from 'react-router-dom';
import BroncoShell from './components/BroncoShell';
import Home from './routes/Home';
import ProjectModule from './routes/ProjectModule';
import ContadoresLanding from './proyectos/contadores/Landing';
import ContadoresApp from './proyectos/contadores/App';

export default function App() {
  return (
    <Routes>
      <Route element={<BroncoShell />}>
        {/* Portfolio público de Bronco Drift */}
        <Route path="/" element={<Home />} />
        <Route path="/proyectos/:slug" element={<ProjectModule />} />

        {/* Módulos. Cada uno es libre de su layout interno. */}
        <Route path="/contadores" element={<ContadoresLanding />} />
        <Route path="/contadores/app" element={<ContadoresApp />} />
      </Route>
    </Routes>
  );
}
