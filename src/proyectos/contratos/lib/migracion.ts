import { supabase } from '@/lib/supabase';
import * as local from './queriesLocal';

/**
 * Migra los contratos creados en localStorage a Supabase cuando el user
 * acaba de loguearse. Mismo patrón que Freud.
 */
export async function migrarLocalASupabase(userId: string): Promise<{ migrados: number }> {
  if (!supabase) throw new Error('Supabase no configurado');
  if (!local.tieneData()) return { migrados: 0 };

  const contratos = local.dump();

  // Solo subimos borradores. Los demás estados no aplican en local (no se pueden firmar sin Supabase).
  const borradores = contratos.filter((c) => c.estado === 'borrador');
  if (borradores.length === 0) {
    local.wipe();
    return { migrados: 0 };
  }

  const parsedRows = borradores.map((c) => ({
    id: c.id,
    user_id: userId,
    titulo: c.titulo,
    template_slug: c.template_slug,
    contenido_md: c.contenido_md,
    variables: c.variables,
    estado: 'borrador' as const,
    created_at: c.created_at,
  }));

  const { error } = await supabase
    .from('contratos_documentos')
    .upsert(parsedRows, { onConflict: 'id' });

  if (error) throw new Error(`Migración falló: ${error.message}`);

  local.wipe();
  return { migrados: borradores.length };
}
