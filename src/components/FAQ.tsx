import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type FAQItem = {
  pregunta: string;
  respuesta: string; // texto plano o con markdown light (\n para nuevas líneas)
};

type FAQProps = {
  items: FAQItem[];
  acento?: string;
  acentoSoft?: string;
  bordeColor?: string;
  cardBackground?: string;
  hoverOverlay?: string;
  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;
  fontSerif?: string;
};

/**
 * Componente FAQ accesible con accordion + JSON-LD structured data (schema.org/FAQPage).
 *
 * El JSON-LD hace que Google muestre las preguntas como acordeón expandible
 * directo en los resultados de búsqueda (rich snippets), y las captura para
 * la sección "People Also Ask". Es uno de los rich results más impactantes
 * para SEO en 2026.
 *
 * Cada módulo declara sus FAQs en `<modulo>/faq.ts` y las pasa con su tema visual.
 */
export default function FAQ({
  items,
  bordeColor = '#e7e1d4',
  cardBackground = '#ffffff',
  hoverOverlay = 'rgba(0, 0, 0, 0.03)',
  textPrimary = '#1c1917',
  textSecondary = '#57534e',
  textMuted = '#a8a29e',
  fontSerif,
}: FAQProps) {
  const [abierto, setAbierto] = useState<number | null>(0);

  return (
    <>
      {/* JSON-LD structured data for SEO (FAQPage) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((item) => ({
              '@type': 'Question',
              name: item.pregunta,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.respuesta,
              },
            })),
          }),
        }}
      />

      <ul className="space-y-2">
        {items.map((item, idx) => {
          const open = abierto === idx;
          return (
            <li key={idx}>
              <div
                className="rounded-lg border overflow-hidden transition-colors"
                style={{ borderColor: bordeColor, backgroundColor: cardBackground }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = hoverOverlay;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = cardBackground;
                }}
              >
                <button
                  onClick={() => setAbierto(open ? null : idx)}
                  className="w-full flex items-baseline justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span
                    className="text-sm sm:text-base font-medium leading-snug"
                    style={{ color: textPrimary, fontFamily: fontSerif }}
                  >
                    {item.pregunta}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      color: textMuted,
                      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms ease-out',
                      flexShrink: 0,
                    }}
                  />
                </button>
                {open && (
                  <div
                    className="px-5 pb-5 pt-1 text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: textSecondary, borderTop: `1px solid ${bordeColor}`, paddingTop: '16px' }}
                  >
                    {item.respuesta}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
