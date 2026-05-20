import { supabase } from './supabase';

/**
 * Verifica si el usuario está suscripto a un módulo (nicho).
 * Lee de la tabla compartida bronco_user_nichos.
 */
export async function estaSuscripto(userId: string, nicho: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('bronco_user_nichos')
    .select('id')
    .eq('user_id', userId)
    .eq('nicho', nicho)
    .maybeSingle();
  if (error) {
    console.error('estaSuscripto error', error);
    return false;
  }
  return data !== null;
}

/**
 * Suscribe al usuario al módulo. Idempotente (unique en (user_id, nicho)).
 */
export async function suscribir(userId: string, nicho: string): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error('Supabase no configurado') };
  const { error } = await supabase
    .from('bronco_user_nichos')
    .upsert({ user_id: userId, nicho }, { onConflict: 'user_id,nicho' });
  return { error };
}
