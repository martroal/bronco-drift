import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import Modal from './Modal';
import { downloadCSV, parseCSV, TEMPLATE_CSV } from '../lib/csv';
import type { ResultadoParse } from '../lib/csv';
import { importBulk } from '../lib/queries';
import { config } from '../config';

export default function ModalImportCSV({
  open,
  onClose,
  userId,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  onImported: () => void;
}) {
  const [parseado, setParseado] = useState<ResultadoParse | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<{ clientesCreados: number; obligacionesCreadas: number } | null>(null);

  function reset() {
    setParseado(null);
    setError(null);
    setResumen(null);
  }

  function descargarTemplate() {
    downloadCSV('vencet-template.csv', TEMPLATE_CSV);
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResumen(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        setParseado(parseCSV(text));
      } catch (err) {
        setError((err as Error).message);
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  async function confirmar() {
    if (!parseado || parseado.filasValidas.length === 0) return;
    setImporting(true);
    setError(null);
    try {
      const res = await importBulk(userId, parseado.filasValidas);
      setResumen(res);
      onImported();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setImporting(false);
    }
  }

  function cerrar() {
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={cerrar} title="Importar CSV" size="lg">
      {!parseado && !resumen && (
        <div className="space-y-4">
          <p className="text-sm text-neutral-300">
            Subí un CSV con tus vencimientos. Cada fila es un vencimiento de un cliente. Si no tenés el archivo, descargá el template y completá con tu data.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={descargarTemplate}
              className="flex items-center gap-2 rounded-md border border-neutral-700 px-3 py-2 text-xs hover:border-neutral-500"
            >
              <Download size={14} />
              Descargar template CSV
            </button>
          </div>
          <div className="rounded-md border border-dashed border-neutral-700 p-6 text-center">
            <Upload className="mx-auto mb-2 text-neutral-500" size={24} />
            <p className="text-xs text-neutral-400 mb-3">Elegí tu archivo CSV</p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={onFileSelect}
              className="text-xs text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-xs file:text-white file:hover:bg-neutral-700"
            />
          </div>
        </div>
      )}

      {parseado && !resumen && (
        <div className="space-y-4">
          <div className="rounded-md bg-neutral-950 border border-neutral-800 p-3 text-xs space-y-1">
            <div>Total de filas leídas: <span className="font-mono">{parseado.totalFilas}</span></div>
            <div className="text-emerald-400">Filas válidas: <span className="font-mono">{parseado.filasValidas.length}</span></div>
            {parseado.errores.length > 0 && (
              <div className="text-red-400">Filas con error: <span className="font-mono">{parseado.errores.length}</span></div>
            )}
          </div>

          {parseado.filasValidas.length > 0 && (
            <div>
              <p className="text-xs text-neutral-400 mb-2">Preview de las primeras 5 filas válidas:</p>
              <div className="rounded-md border border-neutral-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-neutral-950 text-neutral-400">
                    <tr>
                      <th className="text-left px-2 py-1.5">Cliente</th>
                      <th className="text-left px-2 py-1.5">CUIT</th>
                      <th className="text-left px-2 py-1.5">Impuesto</th>
                      <th className="text-left px-2 py-1.5">Vence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseado.filasValidas.slice(0, 5).map((f, i) => (
                      <tr key={i} className="border-t border-neutral-800">
                        <td className="px-2 py-1.5 truncate max-w-[120px]">{f.nombre}</td>
                        <td className="px-2 py-1.5 font-mono">{f.cuit}</td>
                        <td className="px-2 py-1.5">{f.impuesto}</td>
                        <td className="px-2 py-1.5 font-mono">{f.proxima_fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {parseado.errores.length > 0 && (
            <div>
              <p className="text-xs text-red-400 mb-1">Filas que NO se van a importar:</p>
              <ul className="text-xs text-red-300/80 space-y-0.5 max-h-32 overflow-y-auto">
                {parseado.errores.slice(0, 10).map((e, i) => (
                  <li key={i}>Fila {e.fila}: {e.mensaje}</li>
                ))}
                {parseado.errores.length > 10 && (
                  <li className="text-neutral-500">y {parseado.errores.length - 10} más...</li>
                )}
              </ul>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={reset}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
            >
              Elegir otro archivo
            </button>
            <button
              onClick={confirmar}
              disabled={importing || parseado.filasValidas.length === 0}
              style={{ backgroundColor: config.acento }}
              className="px-4 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {importing ? 'Importando...' : `Confirmar ${parseado.filasValidas.length} filas`}
            </button>
          </div>
        </div>
      )}

      {resumen && (
        <div className="space-y-4 text-center py-4">
          <div className="text-emerald-400 text-2xl">✓</div>
          <div className="text-sm text-neutral-200">
            {resumen.clientesCreados} clientes y {resumen.obligacionesCreadas} obligaciones cargadas.
          </div>
          <button
            onClick={cerrar}
            style={{ backgroundColor: config.acento }}
            className="px-4 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Cerrar
          </button>
        </div>
      )}
    </Modal>
  );
}
