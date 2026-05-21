import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FAQ from '@/components/FAQ';
import { useMeta } from '@/lib/useMeta';
import { config } from '../config';
import { sello_faq } from '../faq';

export default function ContratosPreguntas() {
  useMeta({
    title: 'Preguntas frecuentes · Firma Digital Simple',
    description: '¿La firma electrónica es legal en Argentina? ¿Cómo funciona el audit trail? ¿Sirve para una demanda? Respondemos las dudas más comunes sobre firma de contratos online.',
    ogTitle: 'Firma Digital Simple · Preguntas frecuentes',
    ogDescription: 'Validez legal de la firma electrónica en Argentina, audit trail, uso sin pagar, edición de contratos. Las dudas comunes resueltas.',
  });

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        to="/contratos"
        className="inline-flex items-center gap-1.5 text-xs mb-6 hover:underline"
        style={{ color: config.tintaSuave }}
      >
        <ArrowLeft size={12} />
        Volver
      </Link>

      <header className="mb-8 pb-6 border-b" style={{ borderColor: config.borde }}>
        <p
          className="text-xs uppercase tracking-wider mb-2"
          style={{ color: config.tintaSuave, fontFamily: config.serifDisplay }}
        >
          Firma Digital Simple · Preguntas
        </p>
        <h1
          className="text-3xl sm:text-4xl tracking-tight"
          style={{ fontFamily: config.serifDisplay, ...config.fraunces.titularSuave }}
        >
          Dudas comunes sobre la firma online
        </h1>
        <p className="text-sm mt-3 max-w-xl leading-relaxed" style={{ color: config.tintaSuave }}>
          Respuestas concretas sobre validez legal, audit trail, uso sin pagar y manejo de contratos. Si tu pregunta no está, escribinos y la sumamos.
        </p>
      </header>

      <FAQ
        items={sello_faq}
        bordeColor={config.borde}
        cardBackground="#ffffff"
        hoverOverlay={config.papelHover}
        textPrimary={config.tinta}
        textSecondary={config.tintaSuave}
        textMuted={config.tintaMuyTenue}
        fontSerif={config.serifDisplay}
      />
    </main>
  );
}
