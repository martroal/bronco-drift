import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import {
  actualizarSesion,
  crearSesion,
  crearTag,
  eliminarSesion,
  listarTags,
  type Sesion,
  type SesionConTags,
  type Tag,
} from '../lib/queries';
import { config } from '../config';
import { toISODate } from '../lib/recap';

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
  pacienteId: string;
  sesionExistente?: SesionConTags | null;
  onSaved: () => void;
  onDeleted?: () => void;
};

/**
 * Modal para crear o editar una sesión. La diferencia entre crear y editar
 * es solo si se pasó `sesionExistente`. La UX es la misma — un form
 * estructurado con prompts clínicos.
 */
export default function ModalSesion({
  open,
  onClose,
  userId,
  pacienteId,
  sesionExistente,
  onSaved,
  onDeleted,
}: Props) {
  const esEdicion = Boolean(sesionExistente);

  const [fecha, setFecha] = useState(toISODate(new Date()));
  const [tema, setTema] = useState('');
  const [tarea, setTarea] = useState('');
  const [estado, setEstado] = useState('');
  const [notas, setNotas] = useState('');
  const [plan, setPlan] = useState('');

  const [tagsDisponibles, setTagsDisponibles] = useState<Tag[]>([]);
  const [tagsSeleccionados, setTagsSeleccionados] = useState<Tag[]>([]);
  const [tagNuevo, setTagNuevo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  // Cargar tags del user al abrir.
  useEffect(() => {
    if (!open) return;
    listarTags(userId)
      .then(setTagsDisponibles)
      .catch((err) => setError(err.message));
  }, [open, userId]);

  // Cargar valores de la sesión existente.
  useEffect(() => {
    if (open && sesionExistente) {
      setFecha(sesionExistente.fecha);
      setTema(sesionExistente.tema_central ?? '');
      setTarea(sesionExistente.tarea_propuesta ?? '');
      setEstado(sesionExistente.estado_emocional ?? '');
      setNotas(sesionExistente.notas_libres ?? '');
      setPlan(sesionExistente.plan_proxima ?? '');
      setTagsSeleccionados(sesionExistente.tags);
    } else if (open && !sesionExistente) {
      setFecha(toISODate(new Date()));
      setTema('');
      setTarea('');
      setEstado('');
      setNotas('');
      setPlan('');
      setTagsSeleccionados([]);
    }
    setError(null);
    setConfirmarBorrar(false);
  }, [open, sesionExistente]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        paciente_id: pacienteId,
        fecha,
        tema_central: tema.trim() || null,
        tarea_propuesta: tarea.trim() || null,
        estado_emocional: estado.trim() || null,
        notas_libres: notas.trim() || null,
        plan_proxima: plan.trim() || null,
      };
      const tagIds = tagsSeleccionados.map((t) => t.id);

      if (esEdicion && sesionExistente) {
        const parche: Partial<Sesion> = {
          fecha,
          tema_central: payload.tema_central,
          tarea_propuesta: payload.tarea_propuesta,
          estado_emocional: payload.estado_emocional,
          notas_libres: payload.notas_libres,
          plan_proxima: payload.plan_proxima,
        };
        await actualizarSesion(sesionExistente.id, parche, tagIds);
      } else {
        await crearSesion(userId, { ...payload, tagIds });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function borrar() {
    if (!sesionExistente) return;
    setLoading(true);
    setError(null);
    try {
      await eliminarSesion(sesionExistente.id);
      onDeleted?.();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function toggleTag(tag: Tag) {
    setTagsSeleccionados((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag],
    );
  }

  async function agregarTagNuevo(e: React.FormEvent) {
    e.preventDefault();
    const nombre = tagNuevo.trim();
    if (!nombre) return;
    try {
      const tag = await crearTag(userId, nombre, config.acento);
      if (!tagsDisponibles.find((t) => t.id === tag.id)) {
        setTagsDisponibles((prev) => [...prev, tag].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      }
      setTagsSeleccionados((prev) =>
        prev.find((t) => t.id === tag.id) ? prev : [...prev, tag],
      );
      setTagNuevo('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center justify-between border-b border-neutral-800 px-5 py-3 sticky top-0 z-10"
            style={{ backgroundColor: config.acentoSoft }}
          >
            <h2 className="text-sm font-semibold" style={{ fontFamily: config.serif, color: config.acento }}>
              {esEdicion ? 'Editar sesión' : 'Nueva sesión'}
            </h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white" aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>

        <form onSubmit={submit} className="px-5 py-4 space-y-5">
          {/* Fecha */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Campos estructurados con prompts clínicos */}
          <CampoPrompt
            etiqueta="Tema central"
            placeholder="¿Sobre qué giró la sesión?"
            valor={tema}
            onChange={setTema}
            autoFocus
          />
          <CampoPrompt
            etiqueta="Estado emocional observado"
            placeholder="Cómo llegó, qué cambió durante la sesión."
            valor={estado}
            onChange={setEstado}
          />
          <CampoPrompt
            etiqueta="Tarea propuesta"
            placeholder="¿Qué le pediste para la próxima?"
            valor={tarea}
            onChange={setTarea}
          />
          <CampoPrompt
            etiqueta="Notas libres"
            placeholder="Cualquier cosa más que quieras recordar."
            valor={notas}
            onChange={setNotas}
            multilinea
          />
          <CampoPrompt
            etiqueta="Plan próxima sesión"
            placeholder="¿Sobre qué querés volver la próxima vez?"
            valor={plan}
            onChange={setPlan}
          />

          {/* Tags */}
          <div>
            <label className="block text-xs text-neutral-400 mb-2">Tags de tema</label>
            {tagsDisponibles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tagsDisponibles.map((tag) => {
                  const activo = !!tagsSeleccionados.find((t) => t.id === tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${activo ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
                      style={{
                        backgroundColor: `${tag.color}1f`,
                        color: tag.color,
                        border: `1px solid ${tag.color}55`,
                      }}
                    >
                      {tag.nombre}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                value={tagNuevo}
                onChange={(e) => setTagNuevo(e.target.value)}
                placeholder="Crear nuevo tag (ej: trabajo, ansiedad...)"
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    agregarTagNuevo(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={agregarTagNuevo}
                className="rounded-md border border-neutral-700 px-2.5 py-1.5 text-xs hover:border-neutral-500"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
            {esEdicion ? (
              confirmarBorrar ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">¿Seguro?</span>
                  <button
                    type="button"
                    onClick={borrar}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Sí, borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmarBorrar(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-300"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmarBorrar(true)}
                  className="text-xs text-neutral-500 hover:text-red-400"
                >
                  Borrar sesión
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: config.acento }}
                className="px-4 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear sesión'}
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

function CampoPrompt({
  etiqueta,
  placeholder,
  valor,
  onChange,
  multilinea,
  autoFocus,
}: {
  etiqueta: string;
  placeholder: string;
  valor: string;
  onChange: (s: string) => void;
  multilinea?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1" style={{ fontFamily: config.serif }}>
        {etiqueta}
      </label>
      {multilinea ? (
        <textarea
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm h-28 resize-y focus:border-neutral-600 focus:outline-none transition-colors"
        />
      ) : (
        <input
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm focus:border-neutral-600 focus:outline-none transition-colors"
        />
      )}
    </div>
  );
}
