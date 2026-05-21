import { FileText, Pencil, Share2, Shield } from 'lucide-react';
import type { OnboardingStep } from '@/components/Onboarding';

export const contratosOnboardingStorageKey = 'bronco_contratos_onboarding_done';

export const contratosOnboardingSteps: OnboardingStep[] = [
  {
    titulo: 'Firma Digital Simple',
    descripcion:
      'Contratos en español natural, firma online con valor legal en Argentina (Ley 25.506) y PDF descargable. Sin imprimir, sin escanear, sin sobre con sello.',
    icon: <FileText size={26} />,
  },
  {
    titulo: 'Elegí un template y completalo',
    descripcion:
      'Cuatro contratos comunes: freelance, NDA, servicios y locación. Cambiás nombres, montos y fechas en un formulario, el documento se arma solo.',
    icon: <Pencil size={26} />,
  },
  {
    titulo: 'Firmá vos y mandá el link',
    descripcion:
      'Firma con el dedo o tipeo. Genera un link único, mandalo por WhatsApp o email. La otra parte firma y queda registrado con IP, fecha y hash criptográfico.',
    icon: <Share2 size={26} />,
  },
  {
    titulo: 'Para enviar necesitás cuenta',
    descripcion:
      'Sin cuenta podés armar borradores, descargar PDFs en blanco y editar. Para que la otra parte firme online, creá cuenta gratis: tus borradores se suben automáticamente.',
    icon: <Shield size={26} />,
  },
];
