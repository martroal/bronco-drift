import { Routes, Route } from 'react-router-dom';
import Layout from './routes/Layout';
import Home from './routes/Home';
import ProjectModule from './routes/ProjectModule';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/proyectos/:slug" element={<ProjectModule />} />
      </Route>
    </Routes>
  );
}
