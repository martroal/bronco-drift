import Papa from 'papaparse';
import { parseFlexible, toISODate } from './fechas';
import type { FilaCSV, ObligacionConCliente } from './queries';

/**
 * Columnas esperadas en el CSV de import.
 */
export const COLUMNAS_CSV = ['nombre', 'cuit', 'email', 'impuesto', 'proxima_fecha'] as const;

export type FilaRaw = Record<(typeof COLUMNAS_CSV)[number], string>;

export type ResultadoParse = {
  filasValidas: FilaCSV[];
  errores: { fila: number; mensaje: string }[];
  totalFilas: number;
};

/**
 * Parsea un archivo CSV usando papaparse.
 * Devuelve filas válidas + lista de errores por fila para mostrar al usuario.
 */
export function parseCSV(text: string): ResultadoParse {
  const resultado = Papa.parse<FilaRaw>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const filasValidas: FilaCSV[] = [];
  const errores: { fila: number; mensaje: string }[] = [];

  (resultado.data as FilaRaw[]).forEach((rawFila, idx) => {
    const nroFila = idx + 2; // +1 por 0-index, +1 por la fila de header
    const validacion = validarFila(rawFila);
    if ('error' in validacion) {
      errores.push({ fila: nroFila, mensaje: validacion.error });
    } else {
      filasValidas.push(validacion.fila);
    }
  });

  return {
    filasValidas,
    errores,
    totalFilas: (resultado.data as FilaRaw[]).length,
  };
}

function validarFila(raw: FilaRaw): { fila: FilaCSV } | { error: string } {
  const nombre = (raw.nombre ?? '').trim();
  const cuitLimpio = (raw.cuit ?? '').replace(/[-\s]/g, '');
  const email = (raw.email ?? '').trim() || null;
  const impuesto = (raw.impuesto ?? '').trim();
  const fechaRaw = (raw.proxima_fecha ?? '').trim();

  if (!nombre) return { error: 'nombre vacío' };
  if (!/^\d{11}$/.test(cuitLimpio)) return { error: `cuit inválido: ${raw.cuit}` };
  if (!impuesto) return { error: 'impuesto vacío' };
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { error: `email inválido: ${email}` };

  const fecha = parseFlexible(fechaRaw);
  if (!fecha) return { error: `fecha inválida: ${fechaRaw} (esperado YYYY-MM-DD o DD/MM/YYYY)` };

  return {
    fila: {
      nombre,
      cuit: cuitLimpio,
      email,
      impuesto,
      proxima_fecha: toISODate(fecha),
    },
  };
}

/**
 * Convierte un array de obligaciones (con cliente embebido) a string CSV.
 * Misma estructura de columnas que el template de import.
 */
export function unparseCSV(obligaciones: ObligacionConCliente[]): string {
  const filas = obligaciones.map((o) => ({
    nombre: o.cliente.nombre,
    cuit: o.cliente.cuit,
    email: o.cliente.email ?? '',
    impuesto: o.impuesto,
    proxima_fecha: o.proxima_fecha,
    estado: o.estado,
  }));
  return Papa.unparse(filas, {
    columns: ['nombre', 'cuit', 'email', 'impuesto', 'proxima_fecha', 'estado'],
  });
}

/**
 * Template descargable para que el contador empiece desde algo.
 */
export const TEMPLATE_CSV = `nombre,cuit,email,impuesto,proxima_fecha
Estudio Pérez SRL,30712345678,perez@ejemplo.com,IVA mensual,2026-06-15
Estudio Pérez SRL,30712345678,perez@ejemplo.com,Ganancias,2026-09-30
Juan López,20223456789,juan@ejemplo.com,Monotributo,2026-06-20
`;

/**
 * Dispara descarga de un Blob CSV en el navegador.
 */
export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
