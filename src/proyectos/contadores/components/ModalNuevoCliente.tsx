import { useState } from 'react';
import Modal from './Modal';
import { crearCliente } from '../lib/queries';
import { config } from '../config';

export default function ModalNuevoCliente({
  open,
  onClose,
  userId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  onCreated: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [cuit, setCuit] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setNombre('');
    setCuit('');
    setEmail('');
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cuitLimpio = cuit.replace(/[-\s]/g, '');
    if (!nombre.trim()) return setError('El nombre es obligatorio.');
    if (!/^\d{11}$/.test(cuitLimpio)) return setError('El CUIT debe tener 11 dígitos.');

    setLoading(true);
    try {
      await crearCliente(userId, {
        nombre: nombre.trim(),
        cuit: cuitLimpio,
        email: email.trim() || null,
      });
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo cliente">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Nombre o razón social</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm"
            placeholder="Estudio Pérez SRL"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">CUIT (11 dígitos)</label>
          <input
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm font-mono"
            placeholder="30712345678"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Email (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm"
            placeholder="contacto@ejemplo.com"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex items-center justify-end gap-2 pt-2">
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
            {loading ? 'Creando...' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
