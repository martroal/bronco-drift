import type { Urgencia } from '../lib/fechas';

const ESTILOS: Record<Urgencia, { bg: string; text: string; label: (dias: number) => string }> = {
  rojo: {
    bg: 'bg-red-500/10 border border-red-500/40',
    text: 'text-red-300',
    label: (d) => (d < 0 ? `vencido hace ${Math.abs(d)}d` : d === 0 ? 'vence hoy' : `${d}d`),
  },
  amarillo: {
    bg: 'bg-amber-500/10 border border-amber-500/40',
    text: 'text-amber-300',
    label: (d) => `${d}d`,
  },
  verde: {
    bg: 'bg-emerald-500/10 border border-emerald-500/40',
    text: 'text-emerald-300',
    label: (d) => `${d}d`,
  },
};

export default function BadgeProximidad({ urgencia, dias }: { urgencia: Urgencia; dias: number }) {
  const estilo = ESTILOS[urgencia];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-mono ${estilo.bg} ${estilo.text}`}
    >
      {estilo.label(dias)}
    </span>
  );
}
