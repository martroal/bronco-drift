/**
 * Hash SHA-256 del contenido del contrato.
 * Usa la SubtleCrypto API nativa del browser, no requiere librerías.
 * El hash forma parte del audit trail: si el contenido cambia, el hash
 * cambia y queda evidencia.
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Obtiene la IP pública del cliente desde un servicio gratis.
 * Falla silenciosa si no hay conexión.
 */
export async function obtenerIPPublica(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) return null;
    const data = (await res.json()) as { ip: string };
    return data.ip ?? null;
  } catch {
    return null;
  }
}

/**
 * Token UUID v4 para el link público de firma.
 */
export function generarToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'token-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
}
