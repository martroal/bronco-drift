import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Download, Send, Trash2, Edit, Check } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { actualizarContrato, eliminarContrato, obtenerContrato, type Contrato } from '../lib/queries';
import { aplicarVariables, obtenerTemplate } from '../lib/templates';
import { generarToken, obtenerIPPublica, sha256 } from '../lib/hash';
import { generarPDF } from '../lib/pdf';
import { config } from '../config';
import PreviewContrato from '../components/PreviewContrato';
import FirmaCanvas from '../components/FirmaCanvas';
import AuditTrail from '../components/AuditTrail';
import { useDocTitle } from '@/lib/useDocTitle';

export default function Detalle({ user }: { user: User | null }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = user?.id ?? null;
  useDocTitle('Contrato · Firma Digital Simple');

  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firmaAbierta, setFirmaAbierta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);

  const cargar = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const c = await obtenerContrato(userId, id);
      setContrato(c);
      if (c?.titulo) document.title = `${c.titulo} · Firma Digital Simple`;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (loading) {
    return (
      <div className="text-center py-20 text-sm" style={{ color: config.tintaMuyTenue }}>
        Cargando contrato...
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-sm mb-4" style={{ color: config.tintaSuave }}>
          No encontré ese contrato.
        </p>
        <Link to="/contratos" className="text-sm underline" style={{ color: config.acento }}>
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  const template = contrato.template_slug ? obtenerTemplate(contrato.template_slug) : undefined;
  const contenidoMd = template
    ? aplicarVariables(template.contenido, contrato.variables)
    : contrato.contenido_md;

  /* -------------------- acciones -------------------- */

  async function firmarYo(data: string, tipo: 'dibujo' | 'tipeo') {
    if (!contrato) return;
    setEnviando(true);
    setError(null);
    try {
      const ip = await obtenerIPPublica();
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : null;
      const actualizado = await actualizarContrato(userId, contrato.id, {
        parte_a_nombre: tipo === 'tipeo' ? data : (contrato.parte_a_nombre ?? 'Parte A'),
        parte_a_firma_data: data,
        parte_a_firma_tipo: tipo,
        parte_a_firmado_at: new Date().toISOString(),
        parte_a_ip: ip,
        parte_a_user_agent: ua,
      });
      setContrato(actualizado);
      setFirmaAbierta(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  async function enviarParaFirma() {
    if (!contrato) return;
    if (!userId) {
      setError('Para enviar el contrato para que firme la otra parte necesitás crear cuenta. Es gratis.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const token = generarToken();
      const hash = await sha256(contenidoMd);
      const actualizado = await actualizarContrato(userId, contrato.id, {
        link_firma_token: token,
        hash_documento: hash,
        estado: 'enviado',
      });
      setContrato(actualizado);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  async function descargarPDF() {
    if (!previewRef.current || !contrato) return;
    const filename = `${slugify(contrato.titulo)}.pdf`;
    await generarPDF(previewRef.current, filename);
  }

  async function copiarLink() {
    if (!contrato?.link_firma_token) return;
    const url = `${window.location.origin}/contratos/firmar/${contrato.link_firma_token}`;
    await navigator.clipboard.writeText(url);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  function whatsappLink(): string {
    if (!contrato?.link_firma_token) return '#';
    const url = `${window.location.origin}/contratos/firmar/${contrato.link_firma_token}`;
    const text = `Hola, te dejo este contrato para que lo firmes online:\n\n${contrato.titulo}\n${url}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  async function borrar() {
    if (!contrato) return;
    try {
      await eliminarContrato(userId, contrato.id);
      navigate('/contratos');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  /* -------------------- render -------------------- */

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        to="/contratos"
        className="inline-flex items-center gap-1.5 text-xs mb-6 hover:underline"
        style={{ color: config.tintaSuave }}
      >
        <ArrowLeft size={12} />
        Tus contratos
      </Link>

      <header className="flex flex-wrap items-baseline justify-between gap-4 mb-6 pb-4 border-b" style={{ borderColor: config.borde }}>
        <div className="min-w-0">
          <h1
            className="text-2xl sm:text-3xl tracking-tight truncate"
            style={{ fontFamily: config.serifDisplay, ...config.fraunces.titularSuave }}
          >
            {contrato.titulo}
          </h1>
          <EstadoBadge estado={contrato.estado} />
        </div>

        <button
          onClick={descargarPDF}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border hover:bg-white"
          style={{ borderColor: config.borde, color: config.tinta }}
        >
          <Download size={13} />
          Descargar PDF
        </button>
      </header>

      {error && (
        <div className="rounded-md p-3 mb-4 text-xs" style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Acciones según el estado */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Documento */}
        <div>
          <PreviewContrato
            ref={previewRef}
            contenido={contenidoMd}
            contrato={contrato}
            incluirAuditTrail={contrato.estado === 'firmado'}
          />
        </div>

        {/* Acciones laterales */}
        <aside className="space-y-4">
          {contrato.estado === 'borrador' && (
            <Card titulo="Tu firma">
              {contrato.parte_a_firma_data ? (
                <div className="text-xs space-y-2" style={{ color: config.tintaSuave }}>
                  <p className="flex items-center gap-1.5" style={{ color: '#15803d' }}>
                    <Check size={12} />
                    Vos ya firmaste.
                  </p>
                  <button
                    onClick={() => setFirmaAbierta(true)}
                    className="text-xs underline hover:no-underline"
                    style={{ color: config.acento }}
                  >
                    Rehacer firma
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setFirmaAbierta(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white rounded-md hover:opacity-90"
                  style={{ backgroundColor: config.acento }}
                >
                  <Edit size={13} />
                  Firmar yo
                </button>
              )}
              {firmaAbierta && (
                <div className="mt-3">
                  <FirmaCanvas
                    onConfirmar={firmarYo}
                    disabled={enviando}
                    nombreSugerido={contrato.parte_a_nombre ?? ''}
                  />
                </div>
              )}
            </Card>
          )}

          {contrato.estado === 'borrador' && contrato.parte_a_firma_data && (
            <Card titulo="Enviar para que firme la otra parte">
              <p className="text-xs mb-3" style={{ color: config.tintaSuave }}>
                Genera un link único. La otra persona entra, firma con su dedo o tipeo, y queda registrado con IP y fecha.
              </p>
              {userId ? (
                <button
                  onClick={enviarParaFirma}
                  disabled={enviando}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: config.acento }}
                >
                  <Send size={13} />
                  {enviando ? 'Generando...' : 'Generar link de firma'}
                </button>
              ) : (
                <p className="text-xs italic" style={{ color: config.tintaSuave }}>
                  Para enviar, necesitás cuenta. Es gratis y se crea desde el header de arriba. Lo que cargaste se mantiene.
                </p>
              )}
            </Card>
          )}

          {contrato.estado === 'enviado' && contrato.link_firma_token && (
            <Card titulo="Esperando a la otra parte">
              <p className="text-xs mb-3" style={{ color: config.tintaSuave }}>
                Mandale el link por donde te quede más fácil. Cuando firme, te aparece acá.
              </p>
              <div className="space-y-2">
                <button
                  onClick={copiarLink}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-md border hover:bg-white"
                  style={{ borderColor: config.borde, color: config.tinta }}
                >
                  <Copy size={12} />
                  {linkCopiado ? '¡Copiado!' : 'Copiar link'}
                </button>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
                  style={{ backgroundColor: '#25D366' }}
                >
                  Enviar por WhatsApp
                </a>
              </div>
            </Card>
          )}

          {contrato.estado === 'firmado' && (
            <Card titulo="Contrato firmado" tone="success">
              <p className="text-xs" style={{ color: config.tintaSuave }}>
                Ambas partes firmaron. El audit trail está incluido en el PDF.
              </p>
            </Card>
          )}

          <Card titulo="Audit trail">
            <AuditTrail contrato={contrato} />
          </Card>

          {/* Borrar al final */}
          {confirmarBorrar ? (
            <div className="text-xs p-3 rounded-md" style={{ backgroundColor: 'rgba(220, 38, 38, 0.06)', color: '#991b1b' }}>
              <p className="mb-2">¿Borrar este contrato definitivamente?</p>
              <div className="flex items-center gap-2">
                <button onClick={borrar} className="underline hover:no-underline font-medium">
                  Sí, borrar
                </button>
                <button onClick={() => setConfirmarBorrar(false)} className="hover:underline" style={{ color: config.tintaSuave }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmarBorrar(true)}
              className="text-xs inline-flex items-center gap-1 hover:text-red-700 transition-colors"
              style={{ color: config.tintaMuyTenue }}
            >
              <Trash2 size={11} />
              Borrar contrato
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

/* -------------------- componentes locales -------------------- */

function Card({ titulo, children, tone }: { titulo: string; children: React.ReactNode; tone?: 'success' }) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: tone === 'success' ? 'rgba(21, 128, 61, 0.06)' : '#ffffff',
        borderColor: tone === 'success' ? 'rgba(21, 128, 61, 0.30)' : config.borde,
      }}
    >
      <h3
        className="text-xs uppercase tracking-wider mb-3"
        style={{ color: config.tintaSuave, fontFamily: config.serifDisplay }}
      >
        {titulo}
      </h3>
      {children}
    </div>
  );
}

function EstadoBadge({ estado }: { estado: Contrato['estado'] }) {
  const labelMap: Record<Contrato['estado'], string> = {
    borrador: 'Borrador',
    enviado: 'Esperando firma',
    firmado: 'Firmado',
    cancelado: 'Cancelado',
  };
  const colorMap: Record<Contrato['estado'], { bg: string; color: string }> = {
    borrador: { bg: 'rgba(168, 162, 158, 0.15)', color: config.tintaSuave },
    enviado: { bg: config.acentoSoft, color: config.acento },
    firmado: { bg: 'rgba(21, 128, 61, 0.10)', color: '#15803d' },
    cancelado: { bg: 'rgba(168, 162, 158, 0.10)', color: config.tintaMuyTenue },
  };
  const s = colorMap[estado];
  return (
    <span
      className="inline-block mt-2 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {labelMap[estado]}
    </span>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}
