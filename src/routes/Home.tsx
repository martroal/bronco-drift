import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';

const modulos: { slug: string; nombre: string; estado: 'planeado' | 'en-progreso' | 'live' }[] = [
  { slug: 'contadores', nombre: 'Contadores', estado: 'planeado' },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Bronco Drift</h1>
        <p className="text-neutral-400 mt-2 max-w-xl">
          Una plataforma multi-tenant. Cada semana, un módulo nuevo para un nicho distinto.
        </p>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-neutral-500 mb-3">Módulos</h2>
        <ul className="grid gap-2">
          {modulos.map((m) => (
            <li key={m.slug}>
              <Link
                to={`/proyectos/${m.slug}`}
                className="flex items-center justify-between border border-neutral-800 rounded-lg px-4 py-3 hover:border-neutral-600 transition-colors"
              >
                <span>{m.nombre}</span>
                <span className="text-xs text-neutral-500">{m.estado}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="text-xs text-neutral-500">
        Supabase: {isSupabaseConfigured ? 'conectado' : 'no configurado'}
      </section>
    </div>
  );
}
