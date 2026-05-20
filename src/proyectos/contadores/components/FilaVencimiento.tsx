import { Check } from 'lucide-react';
import type { ObligacionConCliente } from '../lib/queries';
import { diasHasta, formatAR, urgenciaPorDias } from '../lib/fechas';
import BadgeProximidad from './BadgeProximidad';

export default function FilaVencimiento({
  obligacion,
  onMarcarPresentado,
}: {
  obligacion: ObligacionConCliente;
  onMarcarPresentado: (id: string) => void;
}) {
  const dias = diasHasta(obligacion.proxima_fecha);
  const urgencia = urgenciaPorDias(dias);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-800 py-3 last:border-b-0">
      <div className="flex items-center gap-4 min-w-0">
        <BadgeProximidad urgencia={urgencia} dias={dias} />
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{obligacion.cliente.nombre}</div>
          <div className="text-xs text-neutral-500 truncate">
            {obligacion.impuesto} · vence {formatAR(obligacion.proxima_fecha)} · CUIT {obligacion.cliente.cuit}
          </div>
        </div>
      </div>
      <button
        onClick={() => onMarcarPresentado(obligacion.id)}
        className="flex items-center gap-1 rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors"
        title="Marcar como presentado"
      >
        <Check size={14} />
        Presentado
      </button>
    </div>
  );
}
