import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type OnboardingStep = {
  titulo: string;
  descripcion: string;
  icon?: React.ReactNode;
};

type OnboardingProps = {
  steps: OnboardingStep[];
  storageKey: string;
  acento?: string;
  acentoSoft?: string;
  fontFamily?: string;
  onComplete?: () => void;
};

/**
 * Onboarding genérico de 3 a 4 pasos para mostrar la primera vez que un usuario
 * entra a un módulo. Persistido en localStorage por la `storageKey` recibida.
 *
 * Apariencia ajustable por módulo via `acento`, `acentoSoft` y `fontFamily`.
 *
 * Cada módulo nuevo de Bronco Drift debe declarar sus pasos y montar este
 * componente en su shell. Ver `src/proyectos/<nicho>/onboarding.ts` para
 * el patrón de definición de steps.
 */
export default function Onboarding({
  steps,
  storageKey,
  acento = '#a8a29e',
  acentoSoft = 'rgba(168, 162, 158, 0.10)',
  fontFamily,
  onComplete,
}: OnboardingProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem(storageKey) === '1';
    if (!done) setOpen(true);
  }, [storageKey]);

  function completar() {
    localStorage.setItem(storageKey, '1');
    setOpen(false);
    onComplete?.();
  }

  function siguiente() {
    if (step >= steps.length - 1) {
      completar();
    } else {
      setStep((s) => s + 1);
    }
  }

  function anterior() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (!open || steps.length === 0) return null;

  const actual = steps[step];
  const esUltimo = step === steps.length - 1;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm"
      onClick={completar}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-2xl shadow-xl my-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Skip */}
          <button
            onClick={completar}
            className="absolute top-3 right-3 text-stone-500 hover:text-white transition-colors"
            aria-label="Saltar onboarding"
          >
            <X size={16} />
          </button>

          {/* Contenido del step */}
          <div className="px-6 pt-10 pb-6 text-center">
            {actual.icon && (
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
                style={{ backgroundColor: acentoSoft, color: acento }}
              >
                {actual.icon}
              </div>
            )}
            <h2
              className="text-xl sm:text-2xl mb-3 leading-tight"
              style={{ fontFamily }}
            >
              {actual.titulo}
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed max-w-sm mx-auto">
              {actual.descripcion}
            </p>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 pb-5">
            {steps.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === step ? 24 : 6,
                  backgroundColor: i === step ? acento : 'rgba(168, 162, 158, 0.3)',
                }}
              />
            ))}
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-between gap-2 px-6 pb-6 pt-2 border-t border-stone-800">
            <button
              onClick={anterior}
              disabled={step === 0}
              className="px-3 py-2 text-xs text-stone-400 hover:text-white disabled:opacity-0 disabled:pointer-events-none"
            >
              Atrás
            </button>
            <button
              onClick={completar}
              className="text-xs text-stone-500 hover:text-stone-300"
            >
              Saltar
            </button>
            <button
              onClick={siguiente}
              style={{ backgroundColor: acento }}
              className="px-4 py-2 text-xs font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            >
              {esUltimo ? 'Empezar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
