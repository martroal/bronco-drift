import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { aplicarVariables, obtenerTemplate, TEMPLATES, type Template, type Variable } from '../lib/templates';
import { actualizarContrato, crearContrato, obtenerContrato } from '../lib/queries';
import { config } from '../config';
import PreviewContrato from '../components/PreviewContrato';
import { useDocTitle } from '@/lib/useDocTitle';

/**
 * Pantalla de Nuevo / Editar contrato. Dos modos:
 *
 * - `/contratos/nuevo`: paso 1 elegí template, paso 2 completá variables.
 * - `/contratos/:id/editar`: salta al paso 2 con el contrato pre-cargado.
 *
 * Editar solo aplica a contratos en estado `borrador`. Si el contrato ya tenía
 * firma del creador, se invalida al guardar (porque el contenido cambió).
 */
export default function Nuevo({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const { id: idEditar } = useParams<{ id?: string }>();
  const modoEditar = Boolean(idEditar);
  const userId = user?.id ?? null;

  useDocTitle(modoEditar ? 'Editar contrato · Firma Digital Simple' : 'Nuevo contrato · Firma Digital Simple');

  const [paso, setPaso] = useState<'elegir' | 'completar'>('elegir');
  const [template, setTemplate] = useState<Template | null>(null);
  const [titulo, setTitulo] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(modoEditar);
  const [teniaFirma, setTeniaFirma] = useState(false);

  // Cargar contrato existente si estamos editando.
  useEffect(() => {
    if (!modoEditar || !idEditar) return;
    let cancelado = false;
    async function cargar() {
      try {
        const c = await obtenerContrato(userId, idEditar!);
        if (cancelado) return;
        if (!c) {
          setError('No encontré el contrato a editar.');
          return;
        }
        if (c.estado !== 'borrador') {
          setError('Solo se pueden editar contratos en estado borrador. Si querés cambiar uno enviado/firmado, creá una versión nueva.');
          return;
        }
        const tmpl = c.template_slug ? obtenerTemplate(c.template_slug) : undefined;
        if (tmpl) setTemplate(tmpl);
        setTitulo(c.titulo);
        setVariables(c.variables);
        setTeniaFirma(Boolean(c.parte_a_firma_data));
        setPaso('completar');
      } catch (err) {
        if (!cancelado) setError((err as Error).message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [modoEditar, idEditar, userId]);

  const contenidoPreview = useMemo(() => {
    if (!template) return '';
    return aplicarVariables(template.contenido, variables);
  }, [template, variables]);

  function elegir(t: Template) {
    setTemplate(t);
    setTitulo(t.nombre);
    setVariables(Object.fromEntries(t.variables.map((v) => [v.key, ''])));
    setPaso('completar');
  }

  function setVar(key: string, value: string) {
    setVariables((prev) => ({ ...prev, [key]: value }));
  }

  async function guardar() {
    if (!template) return;
    setCreando(true);
    setError(null);
    try {
      if (modoEditar && idEditar) {
        // Modo edición: actualizar
        const parche: any = {
          titulo: titulo.trim() || template.nombre,
          variables,
        };
        // Si había firma propia, invalidarla porque el contenido cambió.
        if (teniaFirma) {
          parche.parte_a_firma_data = null;
          parche.parte_a_firma_tipo = null;
          parche.parte_a_firmado_at = null;
          parche.parte_a_ip = null;
          parche.parte_a_user_agent = null;
        }
        await actualizarContrato(userId, idEditar, parche);
        navigate(`/contratos/${idEditar}`);
      } else {
        // Modo creación
        const contrato = await crearContrato(userId, {
          titulo: titulo.trim() || template.nombre,
          template_slug: template.slug,
          contenido_md: template.contenido,
          variables,
        });
        navigate(`/contratos/${contrato.id}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreando(false);
    }
  }

  if (cargando) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-sm" style={{ color: config.tintaMuyTenue }}>Cargando contrato...</p>
      </main>
    );
  }

  if (error && !template) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <Link to="/contratos" className="text-xs mb-6 inline-flex items-center gap-1.5 hover:underline" style={{ color: config.tintaSuave }}>
          <ArrowLeft size={12} />
          Volver
        </Link>
        <div className="rounded-md p-4 text-sm" style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: '#991b1b' }}>
          {error}
        </div>
      </main>
    );
  }

  /* ============================================================
   * Paso 1: elegir template (solo en modo creación)
   * ============================================================ */
  if (paso === 'elegir' && !modoEditar) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          to="/contratos"
          className="inline-flex items-center gap-1.5 text-xs mb-6 hover:underline"
          style={{ color: config.tintaSuave }}
        >
          <ArrowLeft size={12} />
          Volver
        </Link>

        <h1
          className="text-3xl sm:text-4xl tracking-tight mb-3"
          style={{ fontFamily: config.serifDisplay, ...config.fraunces.titularSuave }}
        >
          ¿Qué tipo de contrato necesitás?
        </h1>
        <p className="text-sm mb-10 max-w-xl" style={{ color: config.tintaSuave }}>
          Cuatro templates argentinos para los casos más comunes. Después podés ajustar el texto si querés algo distinto.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.slug} template={t} onElegir={() => elegir(t)} />
          ))}
        </div>
      </main>
    );
  }

  /* ============================================================
   * Paso 2: completar / editar variables
   * ============================================================ */
  if (!template) return null;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {modoEditar ? (
        <Link
          to={`/contratos/${idEditar}`}
          className="inline-flex items-center gap-1.5 text-xs mb-6 hover:underline"
          style={{ color: config.tintaSuave }}
        >
          <ArrowLeft size={12} />
          Volver al contrato
        </Link>
      ) : (
        <button
          onClick={() => setPaso('elegir')}
          className="inline-flex items-center gap-1.5 text-xs mb-6 hover:underline"
          style={{ color: config.tintaSuave }}
        >
          <ArrowLeft size={12} />
          Elegir otro template
        </button>
      )}

      {modoEditar && teniaFirma && (
        <div
          className="rounded-md p-3 mb-4 text-xs"
          style={{ backgroundColor: config.acentoSoft, color: config.acento, border: `1px solid ${config.acentoSoftBorder}` }}
        >
          ⚠ Ya habías firmado este contrato. Al editarlo y guardar, tu firma queda invalidada y vas a tener que volver a firmar.
        </div>
      )}

      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        {/* Form de variables */}
        <div>
          <h2
            className="text-xl mb-4"
            style={{ fontFamily: config.serifDisplay, ...config.fraunces.titularDuro }}
          >
            {modoEditar ? 'Editá los datos' : 'Completá los datos'}
          </h2>

          <div className="space-y-3 mb-4">
            <CampoTexto
              label="Título del contrato"
              value={titulo}
              onChange={setTitulo}
              placeholder={template.nombre}
            />
          </div>

          <div className="space-y-3">
            {template.variables.map((v) => (
              <Campo
                key={v.key}
                variable={v}
                value={variables[v.key] ?? ''}
                onChange={(val) => setVar(v.key, val)}
              />
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-md p-3 text-xs" style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: '#991b1b' }}>
              {error}
            </div>
          )}

          <div className="mt-6 sticky bottom-4">
            <button
              onClick={guardar}
              disabled={creando}
              className="w-full px-4 py-3 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
              style={{ backgroundColor: config.acento }}
            >
              {creando ? 'Guardando...' : modoEditar ? 'Guardar cambios' : 'Guardar y continuar'}
            </button>
            {!userId && !modoEditar && (
              <p className="text-[10px] mt-2 text-center" style={{ color: config.tintaSuave }}>
                Sin cuenta, el contrato se guarda en este navegador.
              </p>
            )}
          </div>
        </div>

        {/* Preview */}
        <div>
          <h2
            className="text-xl mb-4"
            style={{ fontFamily: config.serifDisplay, ...config.fraunces.titularDuro }}
          >
            Vista previa
          </h2>
          <PreviewContrato contenido={contenidoPreview} />
        </div>
      </div>
    </main>
  );
}

/* -------------------- componentes locales -------------------- */

function TemplateCard({ template, onElegir }: { template: Template; onElegir: () => void }) {
  return (
    <button
      onClick={onElegir}
      className="text-left rounded-lg border p-5 hover:shadow-sm transition-shadow group"
      style={{ backgroundColor: '#ffffff', borderColor: config.borde }}
    >
      <FileText
        size={18}
        className="mb-3"
        style={{ color: config.acento }}
      />
      <h3
        className="text-base mb-1 leading-snug"
        style={{ fontFamily: config.serifDisplay, color: config.tinta, ...config.fraunces.titularDuro }}
      >
        {template.nombre}
      </h3>
      <p className="text-xs mb-2" style={{ color: config.tintaSuave }}>
        {template.descripcion}
      </p>
      <span
        className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
        style={{ backgroundColor: config.acentoSoft, color: config.acento }}
      >
        {template.rubro}
      </span>
    </button>
  );
}

function Campo({
  variable,
  value,
  onChange,
}: {
  variable: Variable;
  value: string;
  onChange: (v: string) => void;
}) {
  if (variable.tipo === 'longtext') {
    return (
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: config.tinta }}>
          {variable.label}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={variable.placeholder ?? ''}
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 transition-shadow"
          style={{ backgroundColor: '#ffffff', borderColor: config.borde, color: config.tinta }}
        />
      </div>
    );
  }

  return <CampoTexto label={variable.label} value={value} onChange={onChange} placeholder={variable.placeholder} tipo={variable.tipo} />;
}

function CampoTexto({
  label,
  value,
  onChange,
  placeholder,
  tipo = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tipo?: 'text' | 'date' | 'number';
}) {
  const inputType = tipo === 'number' ? 'number' : tipo === 'date' ? 'date' : 'text';
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: config.tinta }}>
        {label}
      </label>
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ''}
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-shadow"
        style={{ backgroundColor: '#ffffff', borderColor: config.borde, color: config.tinta }}
      />
    </div>
  );
}
