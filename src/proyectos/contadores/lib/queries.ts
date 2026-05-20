import { supabase } from '@/lib/supabase';

export type Cliente = {
  id: string;
  user_id: string;
  nombre: string;
  cuit: string;
  email: string | null;
  created_at: string;
};

export type Obligacion = {
  id: string;
  user_id: string;
  cliente_id: string;
  impuesto: string;
  proxima_fecha: string;
  estado: 'pendiente' | 'presentado';
  created_at: string;
};

/**
 * Obligación con datos del cliente embebidos. Es la forma que consume el panel.
 */
export type ObligacionConCliente = Obligacion & {
  cliente: Pick<Cliente, 'id' | 'nombre' | 'cuit' | 'email'>;
};

function assertSupabase() {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
}

/**
 * Lista todas las obligaciones pendientes del usuario, con datos del cliente,
 * ordenadas por proximidad de vencimiento.
 */
export async function listarPendientes(userId: string): Promise<ObligacionConCliente[]> {
  const sb = assertSupabase();
  const { data, error } = await sb
    .from('contadores_obligaciones')
    .select(`
      id, user_id, cliente_id, impuesto, proxima_fecha, estado, created_at,
      cliente:contadores_clientes!inner ( id, nombre, cuit, email )
    `)
    .eq('user_id', userId)
    .eq('estado', 'pendiente')
    .order('proxima_fecha', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ObligacionConCliente[];
}

/**
 * Crea un cliente. Devuelve el cliente con su id.
 */
export async function crearCliente(
  userId: string,
  payload: Pick<Cliente, 'nombre' | 'cuit' | 'email'>,
): Promise<Cliente> {
  const sb = assertSupabase();
  const { data, error } = await sb
    .from('contadores_clientes')
    .insert({ ...payload, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Cliente;
}

/**
 * Lista los clientes del usuario para el dropdown de "Nueva obligación".
 */
export async function listarClientes(userId: string): Promise<Cliente[]> {
  const sb = assertSupabase();
  const { data, error } = await sb
    .from('contadores_clientes')
    .select('*')
    .eq('user_id', userId)
    .order('nombre');
  if (error) throw error;
  return (data ?? []) as Cliente[];
}

/**
 * Crea una obligación nueva.
 */
export async function crearObligacion(
  userId: string,
  payload: Pick<Obligacion, 'cliente_id' | 'impuesto' | 'proxima_fecha'>,
): Promise<Obligacion> {
  const sb = assertSupabase();
  const { data, error } = await sb
    .from('contadores_obligaciones')
    .insert({ ...payload, user_id: userId, estado: 'pendiente' })
    .select()
    .single();
  if (error) throw error;
  return data as Obligacion;
}

/**
 * Marca una obligación como presentada.
 */
export async function marcarPresentado(id: string): Promise<void> {
  const sb = assertSupabase();
  const { error } = await sb
    .from('contadores_obligaciones')
    .update({ estado: 'presentado' })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Import bulk desde CSV ya parseado.
 * - Hace upsert de los clientes únicos (por user_id, cuit).
 * - Inserta las obligaciones referenciando el cliente_id resuelto.
 * Devuelve { clientesCreados, obligacionesCreadas }.
 */
export type FilaCSV = {
  nombre: string;
  cuit: string;
  email: string | null;
  impuesto: string;
  proxima_fecha: string; // ya en ISO YYYY-MM-DD
};

export async function importBulk(
  userId: string,
  filas: FilaCSV[],
): Promise<{ clientesCreados: number; obligacionesCreadas: number }> {
  const sb = assertSupabase();

  // Deduplicar clientes por CUIT (puede repetirse en el CSV).
  const clientesPorCuit = new Map<string, { nombre: string; cuit: string; email: string | null }>();
  for (const fila of filas) {
    if (!clientesPorCuit.has(fila.cuit)) {
      clientesPorCuit.set(fila.cuit, {
        nombre: fila.nombre,
        cuit: fila.cuit,
        email: fila.email,
      });
    }
  }
  const clientesNuevos = Array.from(clientesPorCuit.values()).map((c) => ({
    ...c,
    user_id: userId,
  }));

  // Upsert de clientes. RLS valida user_id.
  const { data: clientesUpserted, error: errClientes } = await sb
    .from('contadores_clientes')
    .upsert(clientesNuevos, { onConflict: 'user_id,cuit' })
    .select('id, cuit');
  if (errClientes) throw errClientes;

  const idPorCuit = new Map<string, string>();
  for (const c of clientesUpserted ?? []) {
    idPorCuit.set(c.cuit, c.id);
  }

  // Construir las obligaciones con cliente_id resuelto.
  const obligacionesNuevas = filas.map((fila) => ({
    user_id: userId,
    cliente_id: idPorCuit.get(fila.cuit) as string,
    impuesto: fila.impuesto,
    proxima_fecha: fila.proxima_fecha,
    estado: 'pendiente' as const,
  }));

  const { error: errObligaciones } = await sb
    .from('contadores_obligaciones')
    .insert(obligacionesNuevas);
  if (errObligaciones) throw errObligaciones;

  return {
    clientesCreados: clientesUpserted?.length ?? 0,
    obligacionesCreadas: obligacionesNuevas.length,
  };
}

/**
 * Export: devuelve TODAS las obligaciones del usuario (pendientes y presentadas)
 * con los datos del cliente, lista para convertir a CSV.
 */
export async function exportTodo(userId: string): Promise<ObligacionConCliente[]> {
  const sb = assertSupabase();
  const { data, error } = await sb
    .from('contadores_obligaciones')
    .select(`
      id, user_id, cliente_id, impuesto, proxima_fecha, estado, created_at,
      cliente:contadores_clientes!inner ( id, nombre, cuit, email )
    `)
    .eq('user_id', userId)
    .order('proxima_fecha', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ObligacionConCliente[];
}
