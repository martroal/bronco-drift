import { Routes, Route } from 'react-router-dom';
import Layout from './routes/Layout';
import Home from './routes/Home';
import ProjectModule from './routes/ProjectModule';
import ContadoresLanding from './proyectos/contadores/Landing';
import ContadoresApp from './proyectos/contadores/App';

export default function App() {
  return (
    <Routes>
      {/* Portfolio público (rutas dentro del layout de Bronco Drift) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/proyectos/:slug" element={<ProjectModule />} />
      </Route>

      {/* Módulo Vencet (contadores) — branding propio, sin layout de Bronco Drift */}
      <Route path="/contadores" element={<ContadoresLanding />} />
      <Route path="/contadores/app" element={<ContadoresApp />} />
    </Routes>
  );
}
