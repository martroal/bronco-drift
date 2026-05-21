import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { crearPaciente } from '../lib/queries';
import { config } from '../config';

export default function ModalNuevoPaciente({
  open,
  onClose,
  userId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onCreated: (pacienteId: string) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [motivo, setMotivo] = useState('');
  const [primeraSesion, setPrimeraSesion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setNombre('');
    setMotivo('');
    setPrimeraSesion('');
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return setError('El nombre del paciente es obligatorio.');
    setLoading(true);
    setError(null);
    try {
      const paciente = await crearPaciente(userId, {
        nombre: nombre.trim(),
        motivo_consulta: motivo.trim() || null,
        primera_sesion: primeraSesion || null,
      });
      reset();
      onCreated(paciente.id);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-xl shadow-xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center justify-between border-b border-stone-800 px-5 py-3"
            style={{ backgroundColor: config.acentoSoft }}
          >
            <h2 className="text-sm font-semibold" style={{ fontFamily: config.serif, color: config.acento }}>
              Nuevo paciente
            </h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white" aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>

        <form onSubmit={submit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Mariana G."
              className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-2 text-sm"
              autoFocus
              required
            />
            <p className="text-[10px] text-neutral-600 mt-1">
              Podés usar nombre + apellido inicial para mantener privacidad.
            </p>
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Motivo de consulta (opcional)</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ansiedad laboral, vínculo de pareja, etc."
              className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-2 text-sm h-20 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Primera sesión (opcional)</label>
            <input
              type="date"
              value={primeraSesion}
              onChange={(e) => setPrimeraSesion(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
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
              {loading ? 'Creando...' : 'Crear paciente'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
