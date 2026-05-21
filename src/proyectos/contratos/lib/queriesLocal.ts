import type { Contrato } from './types';

const LOCAL_USER_ID = '__local__';
const KEY_CONTRATOS = 'bronco_contratos_documentos';

function leer(): Contrato[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY_CONTRATOS) ?? '[]') as Contrato[];
  } catch {
    return [];
  }
}

function escribir(data: Contrato[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_CONTRATOS, JSON.stringify(data));
}

function ahora(): string {
  return new Date().toISOString();
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'local-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
}

export async function listarContratos(): Promise<Contrato[]> {
  return leer().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function obtenerContrato(id: string): Promise<Contrato | null> {
  return leer().find((c) => c.id === id) ?? null;
}

export async function crearContrato(payload: {
  titulo: string;
  template_slug: string | null;
  contenido_md: string;
  variables: Record<string, string>;
}): Promise<Contrato> {
  const contratos = leer();
  const nuevo: Contrato = {
    id: uuid(),
    user_id: LOCAL_USER_ID,
    titulo: payload.titulo,
    template_slug: payload.template_slug,
    contenido_md: payload.contenido_md,
    variables: payload.variables,
    estado: 'borrador',
    parte_a_nombre: null,
    parte_a_email: null,
    parte_a_firma_data: null,
    parte_a_firma_tipo: null,
    parte_a_firmado_at: null,
    parte_a_ip: null,
    parte_a_user_agent: null,
    parte_b_nombre: null,
    parte_b_email: null,
    parte_b_firma_data: null,
    parte_b_firma_tipo: null,
    parte_b_firmado_at: null,
    parte_b_ip: null,
    parte_b_user_agent: null,
    link_firma_token: null,
    hash_documento: null,
    created_at: ahora(),
  };
  contratos.push(nuevo);
  escribir(contratos);
  return nuevo;
}

export async function actualizarContrato(
  id: string,
  parche: Partial<Contrato>,
): Promise<Contrato> {
  const contratos = leer();
  const idx = contratos.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error('Contrato no encontrado');
  contratos[idx] = { ...contratos[idx], ...parche };
  escribir(contratos);
  return contratos[idx];
}

export async function eliminarContrato(id: string): Promise<void> {
  escribir(leer().filter((c) => c.id !== id));
}

export function dump(): Contrato[] {
  return leer();
}

export function wipe(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY_CONTRATOS);
}

export function tieneData(): boolean {
  return leer().length > 0;
}
