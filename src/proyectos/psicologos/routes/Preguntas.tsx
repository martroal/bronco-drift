import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';
import { useMeta } from '@/lib/useMeta';
import { config } from '../config';
import { freudFAQ } from '../faq';

export default function FreudPreguntas() {
  useMeta({
    title: 'Preguntas frecuentes · Freud',
    description: '¿Cómo funciona Freud? Privacidad de tus notas, validez legal en Argentina, exportación de datos, uso sin cuenta. Todas las dudas comunes resueltas.',
    ogTitle: 'Freud · Preguntas frecuentes',
    ogDescription: 'Privacidad, validez legal, exportación. Las dudas comunes sobre el cuaderno clínico digital para psicólogos en Argentina.',
  });

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        to="/freud"
        className="inline-flex items-center gap-1.5 text-xs mb-6 hover:underline text-stone-400"
      >
        <ArrowLeft size={12} />
        Volver
      </Link>

      <header className="mb-8 pb-6 border-b border-stone-800/60">
        <p
          className="text-xs uppercase tracking-wider text-stone-500 mb-2"
          style={{ fontFamily: config.serif }}
        >
          Freud · Preguntas
        </p>
        <h1
          className="text-3xl sm:text-4xl tracking-tight"
          style={{ fontFamily: config.serif }}
        >
          Dudas comunes
        </h1>
        <p className="text-sm text-stone-400 mt-3 max-w-xl leading-relaxed">
          Si tu pregunta no está acá, escribinos. Las que aparecen seguido las sumamos.
        </p>
      </header>

      <FAQ
        items={freudFAQ}
        bordeColor="rgba(120, 113, 108, 0.30)"
        cardBackground="rgba(255, 255, 255, 0.02)"
        hoverOverlay="rgba(255, 255, 255, 0.04)"
        textPrimary="#fafaf9"
        textSecondary="#d6d3d1"
        textMuted="#a8a29e"
        fontSerif={config.serif}
      />
    </main>
  );
}
