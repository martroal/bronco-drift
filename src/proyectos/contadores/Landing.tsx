import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Upload, Download } from 'lucide-react';
import { config } from './config';
import AuthMenu from '@/components/AuthMenu';
import AuthBanner from '@/components/AuthBanner';

export default function Landing() {
  return (
    <div
      className="min-h-screen text-neutral-100"
      style={{ background: `radial-gradient(ellipse at top, ${config.acentoSoft}, transparent 60%), #0a0a0a` }}
    >
      <AuthBanner acento={config.acento} nombreProducto={config.nombre} />
      <header className="border-b border-neutral-800/60 px-6 py-4 flex items-center justify-between gap-4">
        <span className="text-base font-semibold" style={{ color: config.acento }}>
          {config.nombre}
        </span>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xs text-neutral-500 hover:text-neutral-300 hidden sm:inline">
            ← Volver
          </Link>
          <AuthMenu acento={config.acento} nombreProducto={config.nombre} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <section className="text-center mb-16">
          <div
            className="inline-block text-xs font-mono px-3 py-1 rounded-full mb-6"
            style={{ backgroundColor: config.acentoSoft, color: config.acento }}
          >
            para estudios contables · Argentina
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
            {config.tagline}
          </h1>
          <p className="text-neutral-400 max-w-xl mx-auto mb-8">
            Reemplazá la planilla Excel de vencimientos con un panel claro que te dice qué vence esta semana, sin ningún olvido.
          </p>
          <Link
            to="/contadores/app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.acento }}
          >
            Probalo gratis
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-neutral-500 mt-4">Sin tarjeta. Sin instalación. Funciona en cualquier navegador.</p>
        </section>

        <section className="grid sm:grid-cols-3 gap-4 mb-16">
          <Feature
            icon={<CheckCircle2 size={20} />}
            titulo="Panel ordenado"
            descripcion="Todos los vencimientos en una pantalla, con badges de color que te indican qué urge."
          />
          <Feature
            icon={<Upload size={20} />}
            titulo="Importás tu Excel"
            descripcion="Subís tu planilla actual en CSV y la app reconoce clientes e impuestos automáticamente."
          />
          <Feature
            icon={<Download size={20} />}
            titulo="Tu data, tuya"
            descripcion="Bajás todo a CSV cuando quieras. Sin lock-in, sin sorpresas, sin secretos."
          />
        </section>

        <section className="rounded-xl border border-neutral-800 p-6 mb-16">
          <h2 className="text-sm uppercase tracking-wider text-neutral-500 mb-4">Cómo funciona</h2>
          <ol className="space-y-3 text-sm text-neutral-300">
            <li className="flex gap-3">
              <span className="font-mono text-neutral-500 w-6">1.</span>
              Te registrás con tu mail (sin password, llega un link).
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-neutral-500 w-6">2.</span>
              Cargás tus clientes y obligaciones, o importás tu CSV.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-neutral-500 w-6">3.</span>
              Cada mañana, abrís el panel y ves qué vence pronto. Click para marcar presentado.
            </li>
          </ol>
        </section>

        <footer className="text-center text-xs text-neutral-500">
          {config.nombre} es parte de Bronco Drift · {' '}
          <Link to="/" className="hover:text-neutral-300">portfolio</Link>
        </footer>
      </main>
    </div>
  );
}

function Feature({ icon, titulo, descripcion }: { icon: React.ReactNode; titulo: string; descripcion: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <div style={{ color: config.acento }} className="mb-2">
        {icon}
      </div>
      <div className="text-sm font-medium mb-1">{titulo}</div>
      <div className="text-xs text-neutral-400">{descripcion}</div>
    </div>
  );
}
