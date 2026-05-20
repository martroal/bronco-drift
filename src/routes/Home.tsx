import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';

type Modulo = {
  slug: string;
  nombre: string;
  tagline: string;
  estado: 'planeado' | 'en-progreso' | 'live' | 'pausado';
  href: string;
};

const modulos: Modulo[] = [
  {
    slug: 'psicologos',
    nombre: 'Freud',
    tagline: 'El cuaderno que recuerda por vos.',
    estado: 'live',
    href: '/freud',
  },
  {
    slug: 'contadores',
    nombre: 'Vencet',
    tagline: 'Tus vencimientos AFIP, ordenados.',
    estado: 'pausado',
    href: '/contadores',
  },
];

const estadoEstilos: Record<Modulo['estado'], string> = {
  live: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
  'en-progreso': 'bg-amber-500/10 text-amber-300 border-amber-500/40',
  planeado: 'bg-neutral-800 text-neutral-400 border-neutral-700',
  pausado: 'bg-neutral-800 text-neutral-500 border-neutral-700',
};

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-10">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Bronco Drift</h1>
          <p className="text-neutral-400 mt-2 max-w-xl">
            Plataforma multi-tenant. Apps funcionales, hermosas y gratis para nichos específicos.
          </p>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-neutral-500 mb-3">Módulos</h2>
          <ul className="grid gap-2">
            {modulos.map((m) => (
              <li key={m.slug}>
                <Link
                  to={m.href}
                  className="flex items-center justify-between gap-4 border border-neutral-800 rounded-lg px-4 py-3 hover:border-neutral-600 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{m.nombre}</div>
                    <div className="text-xs text-neutral-500 truncate">{m.tagline}</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-mono ${estadoEstilos[m.estado]}`}
                  >
                    {m.estado}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="text-xs text-neutral-500">
          Supabase: {isSupabaseConfigured ? 'conectado' : 'no configurado'}
        </section>
      </main>

      <footer className="border-t border-neutral-800 px-6 py-4 text-xs text-neutral-500">
        Una app por nicho. Apps reales, no demos.
      </footer>
    </div>
  );
}
