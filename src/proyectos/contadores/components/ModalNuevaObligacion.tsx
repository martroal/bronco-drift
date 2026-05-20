import { useEffect, useState } from 'react';
import Modal from './Modal';
import { crearObligacion, listarClientes } from '../lib/queries';
import type { Cliente } from '../lib/queries';
import { parseFlexible, toISODate } from '../lib/fechas';
import { config } from '../config';

export default function ModalNuevaObligacion({
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
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [impuesto, setImpuesto] = useState('');
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    listarClientes(userId).then(setClientes).catch((err) => setError(err.message));
  }, [open, userId]);

  function reset() {
    setClienteId('');
    setImpuesto('');
    setFecha('');
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clienteId) return setError('Elegí un cliente.');
    if (!impuesto.trim()) return setError('El impuesto es obligatorio.');
    const parsed = parseFlexible(fecha);
    if (!parsed) return setError('Fecha inválida. Usá YYYY-MM-DD o DD/MM/YYYY.');

    setLoading(true);
    try {
      await crearObligacion(userId, {
        cliente_id: clienteId,
        impuesto: impuesto.trim(),
        proxima_fecha: toISODate(parsed),
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
    <Modal open={open} onClose={onClose} title="Nueva obligación">
      {clientes.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Primero necesitás cargar al menos un cliente. Cerrá este modal y usá "Nuevo cliente".
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Cliente</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm"
              autoFocus
            >
              <option value="">Elegir cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.cuit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Impuesto</label>
            <input
              value={impuesto}
              onChange={(e) => setImpuesto(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm"
              placeholder="IVA mensual, Ganancias, Monotributo..."
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Próximo vencimiento</label>
            <input
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm font-mono"
              placeholder="DD/MM/YYYY o YYYY-MM-DD"
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
              {loading ? 'Creando...' : 'Crear obligación'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
