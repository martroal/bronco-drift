import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Search } from 'lucide-react';
import { config } from './config';

export default function FreudLanding() {
  return (
    <div
      className="flex-1 text-neutral-100"
      style={{
        background: `radial-gradient(ellipse at top, ${config.acentoSoft}, transparent 55%), #0a0a0a`,
      }}
    >
      {/* Subheader del módulo */}
      <div
        className="border-b border-neutral-800/60 px-6 py-3 flex items-center justify-between gap-4"
        style={{ backgroundColor: config.acentoSoft }}
      >
        <span className="text-base font-semibold" style={{ color: config.acento, fontFamily: config.serif }}>
          Freud
        </span>
        <span className="text-xs text-neutral-400 hidden sm:inline">{config.tagline}</span>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <section className="text-center mb-20">
          <div
            className="inline-block text-xs font-mono px-3 py-1 rounded-full mb-6"
            style={{ backgroundColor: config.acentoSoft, color: config.acento }}
          >
            para psicólogos clínicos · Argentina
          </div>
          <h1
            className="text-4xl sm:text-5xl mb-5 tracking-tight leading-tight"
            style={{ fontFamily: config.serif }}
          >
            {config.tagline}
          </h1>
          <p className="text-neutral-400 max-w-xl mx-auto mb-8 text-lg leading-relaxed">
            Dejá de pelearte con el Word de notas. Cargá cada sesión con preguntas que importan, ve la evolución del paciente en una línea de tiempo, y antes de cada turno recibí un resumen de lo que escribiste.
          </p>
          <Link
            to="/freud/app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.acento }}
          >
            Empezar a usar Freud
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-neutral-500 mt-4">Sin tarjeta. Sin instalación. Funciona en cualquier navegador.</p>
        </section>

        {/* Tres pilares */}
        <section className="grid sm:grid-cols-3 gap-4 mb-20">
          <Feature
            icon={<BookOpen size={22} />}
            titulo="Notas estructuradas"
            descripcion="Tema central, tarea, estado emocional y plan. Cinco prompts cortos, no un Word vacío."
          />
          <Feature
            icon={<Clock size={22} />}
            titulo="Pre-sesión recap"
            descripcion="Antes de la próxima sesión, te mostramos lo que escribiste la última vez y qué quedó pendiente."
          />
          <Feature
            icon={<Search size={22} />}
            titulo="Memoria buscable"
            descripcion="Encontrá cualquier sesión por palabra clave. La memoria no se te va a quedar corta."
          />
        </section>

        {/* Cómo funciona */}
        <section className="rounded-xl border border-neutral-800 p-6 sm:p-8 mb-20" style={{ backgroundColor: 'rgba(120, 53, 15, 0.02)' }}>
          <h2 className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6" style={{ fontFamily: config.serif }}>
            Cómo funciona
          </h2>
          <ol className="space-y-5 text-sm text-neutral-300">
            <Paso numero="1" titulo="Cargás tus pacientes">
              Solo nombre y el motivo de consulta. Si querés, agregás la fecha de la primera sesión. Nada obligatorio.
            </Paso>
            <Paso numero="2" titulo="Después de cada sesión, abrís el cuaderno">
              Cinco campos cortos te guían: tema central, estado emocional, tarea propuesta, notas libres y plan próximo. Tomá 3 minutos.
            </Paso>
            <Paso numero="3" titulo="La próxima vez, el cuaderno te recuerda lo importante">
              Tema de la última sesión, tarea que quedó pendiente, plan que vos mismo escribiste. Sin releer 3 hojas.
            </Paso>
          </ol>
        </section>

        {/* Privacidad — importante para psicólogos */}
        <section className="text-center text-xs text-neutral-500 max-w-xl mx-auto">
          <p>
            <span className="text-neutral-300">Tus notas son solo tuyas.</span> Cada psicólogo ve únicamente sus pacientes y sus sesiones, garantizado por reglas a nivel base de datos. Los datos viajan cifrados y se guardan cifrados.
          </p>
        </section>
      </main>
    </div>
  );
}

function Feature({
  icon,
  titulo,
  descripcion,
}: {
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 p-5">
      <div style={{ color: config.acento }} className="mb-3">
        {icon}
      </div>
      <div className="text-sm font-medium mb-1.5" style={{ fontFamily: config.serif }}>
        {titulo}
      </div>
      <div className="text-xs text-neutral-400 leading-relaxed">{descripcion}</div>
    </div>
  );
}

function Paso({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
        style={{ backgroundColor: config.acentoSoft, color: config.acento, fontFamily: config.serif }}
      >
        {numero}
      </span>
      <div>
        <div className="font-medium text-neutral-100 mb-1" style={{ fontFamily: config.serif }}>
          {titulo}
        </div>
        <p className="text-neutral-400 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}
