import { Routes, Route } from 'react-router-dom';
import BroncoShell from './components/BroncoShell';
import Home from './routes/Home';
import ProjectModule from './routes/ProjectModule';
import ContadoresLanding from './proyectos/contadores/Landing';
import ContadoresApp from './proyectos/contadores/App';
import FreudLanding from './proyectos/psicologos/Landing';
import FreudApp from './proyectos/psicologos/App';

export default function App() {
  return (
    <Routes>
      <Route element={<BroncoShell />}>
        {/* Portfolio público de Bronco Drift */}
        <Route path="/" element={<Home />} />
        <Route path="/proyectos/:slug" element={<ProjectModule />} />

        {/* Vencet — contadores */}
        <Route path="/contadores" element={<ContadoresLanding />} />
        <Route path="/contadores/app" element={<ContadoresApp />} />

        {/* Freud — psicólogos */}
        <Route path="/freud" element={<FreudLanding />} />
        <Route path="/freud/app/*" element={<FreudApp />} />
      </Route>
    </Routes>
  );
}
