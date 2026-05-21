import { BookOpen, NotebookPen, Shield, UserPlus } from 'lucide-react';
import type { OnboardingStep } from '@/components/Onboarding';

/**
 * Pasos del onboarding inicial de Freud. Se muestra la primera vez que el
 * usuario entra al módulo, persistido en localStorage por la storageKey de abajo.
 */
export const freudOnboardingStorageKey = 'bronco_freud_onboarding_done';

export const freudOnboardingSteps: OnboardingStep[] = [
  {
    titulo: 'Bienvenido a Freud',
    descripcion:
      'Tu cuaderno clínico, ahora con memoria. Cargás pacientes, escribís cada sesión en prompts cortos, y antes de cada turno te mostramos lo que escribiste la vez pasada.',
    icon: <BookOpen size={26} />,
  },
  {
    titulo: 'Cargá tu primer paciente',
    descripcion:
      'Solo necesitás nombre y motivo de consulta. Podés editar después cualquier cosa. Para mantener privacidad, usá nombre con apellido inicial (ej: "Mariana G.").',
    icon: <UserPlus size={26} />,
  },
  {
    titulo: 'Anotá cada sesión en 5 prompts cortos',
    descripcion:
      'Tema central, estado emocional, tarea propuesta, notas libres y plan para la próxima. Tomá 3 minutos al final de cada sesión. Mejor que un Word vacío.',
    icon: <NotebookPen size={26} />,
  },
  {
    titulo: 'Tu data, en tu navegador',
    descripcion:
      'Por ahora se guarda local en tu navegador. Si querés sincronizar entre dispositivos, creá una cuenta gratis cuando quieras. Lo que cargaste ahora se sube automáticamente.',
    icon: <Shield size={26} />,
  },
];
