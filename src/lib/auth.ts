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
 * Magic-link login. Devuelve { error } si hubo problema.
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
