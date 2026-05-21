import { Hash, Globe, Calendar, User } from 'lucide-react';
import type { Contrato } from '../lib/types';
import { config } from '../config';

/**
 * Muestra el audit trail completo del contrato (qué pasó, cuándo, desde qué IP).
 * Se incluye en el PDF final como prueba de firma.
 */
export default function AuditTrail({ contrato }: { contrato: Contrato }) {
  return (
    <div className="space-y-3 text-xs">
      <h3
        className="text-sm uppercase tracking-wider font-semibold"
        style={{ color: config.tintaSuave, fontFamily: config.serifDisplay }}
      >
        Audit trail
      </h3>

      <div className="space-y-2">
        <Linea
          icon={<Calendar size={11} />}
          label="Creado"
          value={formatFecha(contrato.created_at)}
        />

        {contrato.parte_a_firmado_at && (
          <>
            <Linea
              icon={<User size={11} />}
              label={`Firmado por ${contrato.parte_a_nombre ?? 'parte A'}`}
              value={formatFecha(contrato.parte_a_firmado_at)}
            />
            {contrato.parte_a_ip && (
              <Linea icon={<Globe size={11} />} label="IP parte A" value={contrato.parte_a_ip} mono />
            )}
          </>
        )}

        {contrato.parte_b_firmado_at && (
          <>
            <Linea
              icon={<User size={11} />}
              label={`Firmado por ${contrato.parte_b_nombre ?? 'parte B'}`}
              value={formatFecha(contrato.parte_b_firmado_at)}
            />
            {contrato.parte_b_ip && (
              <Linea icon={<Globe size={11} />} label="IP parte B" value={contrato.parte_b_ip} mono />
            )}
          </>
        )}

        {contrato.hash_documento && (
          <Linea
            icon={<Hash size={11} />}
            label="Hash SHA-256"
            value={contrato.hash_documento}
            mono
            truncate
          />
        )}
      </div>
    </div>
  );
}

function Linea({
  icon,
  label,
  value,
  mono,
  truncate,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="shrink-0 mt-0.5" style={{ color: config.tintaMuyTenue }}>
        {icon}
      </span>
      <span className="shrink-0" style={{ color: config.tintaSuave }}>
        {label}:
      </span>
      <span
        className={`${mono ? 'font-mono' : ''} ${truncate ? 'truncate' : ''} min-w-0`}
        style={{ color: config.tinta }}
      >
        {value}
      </span>
    </div>
  );
}

function formatFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
