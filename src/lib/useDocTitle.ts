import { useEffect } from 'react';

/**
 * Hook que setea `document.title` según el contexto de la ruta.
 * Se restaura al título por default cuando el componente se desmonta.
 *
 * Patrón: cada ruta principal llama useDocTitle('Algo · Módulo') al montar.
 */
export function useDocTitle(titulo: string): void {
  useEffect(() => {
    const previo = document.title;
    document.title = titulo;
    return () => {
      document.title = previo;
    };
  }, [titulo]);
}
