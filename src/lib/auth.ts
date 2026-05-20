import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Hook compartido para conocer el estado de auth en cualquier ruta.
 * Reactivo: se actualiza cuando el usuario hace login o logout.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

/**
 * Sign in con email + password. Devuelve { error } si las credenciales no son válidas.
 */
export async function signIn(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase no configurado') };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

/**
 * Crear cuenta con email + password.
 * Requiere que "Confirm email" esté desactivado en Supabase Auth Settings
 * para que el usuario quede logueado automáticamente tras el signUp.
 */
export async function signUp(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase no configurado') };
  const { error } = await supabase.auth.signUp({ email, password });
  return { error };
}

/**
 * Magic-link login. No se usa por default (decisión: evitar dependencia de SMTP).
 * Se conserva para un eventual flow de "olvidé mi password" en v0.2.
 */
export async function loginWithMagicLink(email: string) {
  if (!supabase) return { error: new Error('Supabase no configurado') };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });
  return { error };
}

export async function logout() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
