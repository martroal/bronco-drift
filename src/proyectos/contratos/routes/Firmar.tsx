import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileCheck } from 'lucide-react';
import { firmarComoParteB, obtenerPorToken, type Contrato } from '../lib/queries';
import { aplicarVariables, obtenerTemplate } from '../lib/templates';
import { obtenerIPPublica } from '../lib/hash';
import { config } from '../config';
import PreviewContrato from '../components/PreviewContrato';
import FirmaCanvas from '../components/FirmaCanvas';

/**
 * Página pública de firma. Accesible sin login, solo con el token en la URL.
 * La RLS de Supabase permite SELECT/UPDATE solo cuando el doc está en estado 'enviado'.
 */
export default function Firmar() {
  const { token } = useParams<{ token: string }>();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [firmando, setFirmando] = useState(false);
  const [firmado, setFirmado] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    async function cargar() {
      setLoading(true);
      try {
        const c = await obtenerPorToken(token!);
        if (!cancelado) {
          if (c) {
            setContrato(c);
            if (c.parte_b_firmado_at) setFirmado(true);
          } else {
            setError('Este link de firma no existe o ya no es válido. Pedile a quien te lo envió que lo genere de nuevo.');
          }
        }
      } catch (err) {
        if (!cancelado) setError((err as Error).message);
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [token]);

  async function firmar(firma_data: string, firma_tipo: 'dibujo' | 'tipeo') {
    if (!token || !contrato) return;
    if (!nombre.trim()) {
      setError('Necesitamos tu nombre para registrar la firma.');
      return;
    }
    setFirmando(true);
    setError(null);
    try {
      const ip = await obtenerIPPublica();
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      await firmarComoParteB(token, {
        nombre: nombre.trim(),
        email: email.trim() || null,
        firma_data,
        firma_tipo,
        ip,
        user_agent: ua,
      });
      setFirmado(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setFirmando(false);
    }
  }

  if (loading) {
    return (
      <Centrado>
        <p className="text-sm" style={{ color: config.tintaMuyTenue }}>Cargando contrato...</p>
      </Centrado>
    );
  }

  if (error || !contrato) {
    return (
      <Centrado>
        <h1 className="text-2xl mb-3" style={{ fontFamily: config.serifDisplay }}>
          No pudimos abrir el contrato.
        </h1>
        <p className="text-sm" style={{ color: config.tintaSuave }}>
          {error ?? 'Link inválido.'}
        </p>
      </Centrado>
    );
  }

  const template = contrato.template_slug ? obtenerTemplate(contrato.template_slug) : undefined;
  const contenidoMd = template
    ? aplicarVariables(template.contenido, contrato.variables)
    : contrato.contenido_md;

  if (firmado) {
    return (
      <Centrado>
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
          style={{ backgroundColor: config.acentoSoft, color: config.acento }}
        >
          <FileCheck size={28} />
        </div>
        <h1
          className="text-3xl mb-3 tracking-tight"
          style={{ fontFamily: config.serifDisplay, ...config.fraunces.titularSuave }}
        >
          Firmado. Listo.
        </h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: config.tintaSuave }}>
          La otra parte ya recibió tu firma. Te recomendamos guardarte una copia del contrato firmado.
        </p>
      </Centrado>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="text-center mb-8">
        <p
          className="text-xs uppercase tracking-[0.2em] mb-2"
          style={{ color: config.acento, fontFamily: config.serifDisplay }}
        >
          Te invitaron a firmar
        </p>
        <h1
          className="text-3xl sm:text-4xl tracking-tight mb-2"
          style={{ fontFamily: config.serifDisplay, ...config.fraunces.titularSuave }}
        >
          {contrato.titulo}
        </h1>
        <p className="text-xs" style={{ color: config.tintaSuave }}>
          Leé el documento abajo. Si estás de acuerdo, completá tu nombre y firmá al final.
        </p>
      </header>

      <PreviewContrato contenido={contenidoMd} contrato={contrato} />

      {/* Form de firma */}
      <div
        className="mt-8 rounded-xl border p-6"
        style={{ backgroundColor: '#ffffff', borderColor: config.bordeFuerte }}
      >
        <h2
          className="text-xl mb-5"
          style={{ fontFamily: config.serifDisplay, ...config.fraunces.titularDuro }}
        >
          Tu firma
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: config.tinta }}>
              Tu nombre completo
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Mariana López"
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{ backgroundColor: '#ffffff', borderColor: config.borde, color: config.tinta }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: config.tinta }}>
              Tu email <span style={{ color: config.tintaMuyTenue }}>(opcional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mariana@ejemplo.com"
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{ backgroundColor: '#ffffff', borderColor: config.borde, color: config.tinta }}
            />
          </div>
        </div>

        <FirmaCanvas onConfirmar={firmar} disabled={firmando} nombreSugerido={nombre} />

        <p className="text-[10px] text-center mt-4" style={{ color: config.tintaMuyTenue }}>
          Al firmar registramos tu nombre, fecha, IP pública y user-agent del navegador. Esta información queda incluida en el PDF como audit trail (Ley 25.506 Argentina).
        </p>
      </div>
    </div>
  );
}

function Centrado({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20">
      {children}
    </div>
  );
}
