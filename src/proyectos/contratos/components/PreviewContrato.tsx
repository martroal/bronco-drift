import ReactMarkdown from 'react-markdown';
import { forwardRef } from 'react';
import type { Contrato } from '../lib/types';
import { config } from '../config';

type Props = {
  contenido: string;
  contrato?: Contrato;        // si se pasa, se renderizan las firmas
  incluirAuditTrail?: boolean;
};

/**
 * Renderiza el contrato en formato "documento de papel" con Fraunces serif.
 * El forwardRef permite que el padre lo use como target del PDF generator.
 */
const PreviewContrato = forwardRef<HTMLDivElement, Props>(function PreviewContrato(
  { contenido, contrato, incluirAuditTrail },
  ref,
) {
  return (
    <article
      ref={ref}
      className="rounded-lg shadow-sm"
      style={{
        backgroundColor: '#ffffff',
        color: config.tinta,
        padding: '48px 56px',
        fontFamily: 'Geist, sans-serif',
        fontSize: '14px',
        lineHeight: '1.7',
        ...config.fraunces.body,
      }}
    >
      <div
        className="prose-contract"
        style={{
          // Estilos custom para los headings del markdown.
        }}
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1
                style={{
                  fontFamily: config.serifDisplay,
                  fontSize: '32px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: '32px',
                  textAlign: 'center',
                  ...config.fraunces.titularSuave,
                }}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                style={{
                  fontFamily: config.serifDisplay,
                  fontSize: '18px',
                  fontWeight: 600,
                  marginTop: '28px',
                  marginBottom: '10px',
                  color: config.tinta,
                  ...config.fraunces.titularDuro,
                }}
              >
                {children}
              </h2>
            ),
            p: ({ children }) => (
              <p style={{ marginBottom: '14px', textAlign: 'justify' }}>{children}</p>
            ),
            strong: ({ children }) => (
              <strong style={{ fontWeight: 600, color: config.tinta }}>{children}</strong>
            ),
            ul: ({ children }) => (
              <ul style={{ paddingLeft: '22px', marginBottom: '14px' }}>{children}</ul>
            ),
            li: ({ children }) => (
              <li style={{ marginBottom: '6px' }}>{children}</li>
            ),
            hr: () => (
              <hr
                style={{
                  border: 'none',
                  borderTop: `1px solid ${config.borde}`,
                  margin: '32px 0',
                }}
              />
            ),
          }}
        >
          {contenido}
        </ReactMarkdown>
      </div>

      {/* Firmas al final del contrato */}
      {contrato && (contrato.parte_a_firma_data || contrato.parte_b_firma_data) && (
        <div
          style={{
            marginTop: '48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            pageBreakInside: 'avoid',
          }}
        >
          <BloqueFirma
            label="Parte A"
            nombre={contrato.parte_a_nombre}
            firma_data={contrato.parte_a_firma_data}
            firma_tipo={contrato.parte_a_firma_tipo}
            fecha={contrato.parte_a_firmado_at}
          />
          <BloqueFirma
            label="Parte B"
            nombre={contrato.parte_b_nombre}
            firma_data={contrato.parte_b_firma_data}
            firma_tipo={contrato.parte_b_firma_tipo}
            fecha={contrato.parte_b_firmado_at}
          />
        </div>
      )}

      {incluirAuditTrail && contrato?.hash_documento && (
        <div style={{ marginTop: '48px', paddingTop: '20px', borderTop: `1px solid ${config.borde}` }}>
          <p style={{ fontSize: '10px', color: config.tintaSuave, lineHeight: 1.5 }}>
            <strong>Verificación criptográfica:</strong> este contrato tiene un hash SHA-256 único que permite probar que el texto no fue alterado después de la firma. Si alguien cambia una palabra, el hash deja de coincidir.
          </p>
          <p
            style={{
              fontSize: '10px',
              fontFamily: 'Geist Mono, monospace',
              color: config.tintaSuave,
              wordBreak: 'break-all',
              marginTop: '6px',
            }}
          >
            {contrato.hash_documento}
          </p>
        </div>
      )}
    </article>
  );
});

function BloqueFirma({
  label,
  nombre,
  firma_data,
  firma_tipo,
  fecha,
}: {
  label: string;
  nombre: string | null;
  firma_data: string | null;
  firma_tipo: 'dibujo' | 'tipeo' | null;
  fecha: string | null;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: '10px',
          color: config.tintaMuyTenue,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '8px',
        }}
      >
        {label}
      </p>

      <div
        style={{
          minHeight: '60px',
          borderBottom: `1px solid ${config.borde}`,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '4px',
        }}
      >
        {firma_data ? (
          firma_tipo === 'dibujo' ? (
            <img src={firma_data} alt={`Firma de ${nombre ?? ''}`} style={{ maxHeight: '60px', maxWidth: '100%' }} />
          ) : (
            <span
              style={{
                fontFamily: config.serifDisplay,
                fontSize: '22px',
                fontStyle: 'italic',
                ...config.fraunces.titularSuave,
              }}
            >
              {firma_data}
            </span>
          )
        ) : (
          <span style={{ fontSize: '10px', color: config.tintaMuyTenue }}>(pendiente de firma)</span>
        )}
      </div>

      <p style={{ fontSize: '12px', fontWeight: 500 }}>{nombre ?? '—'}</p>
      {fecha && (
        <p
          style={{
            fontSize: '10px',
            color: config.tintaSuave,
            fontFamily: 'Geist Mono, monospace',
            marginTop: '2px',
          }}
        >
          {new Date(fecha).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}
    </div>
  );
}

export default PreviewContrato;
