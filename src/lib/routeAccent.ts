/**
 * Mapeo de ruta a acento del módulo activo.
 *
 * Permite que componentes globales (AuthMenu, AuthBanner) usen el color
 * y el nombre comercial del módulo en el que está parado el usuario,
 * sin que cada módulo tenga que pasarles props.
 *
 * Cuando se agrega un módulo nuevo, sumarlo a la lista de abajo.
 */

import { config as freudConfig } from '@/proyectos/psicologos/config';
import { config as contadoresConfig } from '@/proyectos/contadores/config';

type AccentResolution = {
  acento: string;
  nombreProducto: string | undefined;
};

const PLATFORM_DEFAULT: AccentResolution = {
  // Neutro de la plataforma. NO usar cyan / colores de otro módulo.
  acento: '#a8a29e', // stone-400
  nombreProducto: undefined,
};

export function accentForPath(pathname: string): AccentResolution {
  if (pathname.startsWith('/freud')) {
    return { acento: freudConfig.acento, nombreProducto: freudConfig.nombre };
  }
  if (pathname.startsWith('/contadores')) {
    return { acento: contadoresConfig.acento, nombreProducto: contadoresConfig.nombre };
  }
  return PLATFORM_DEFAULT;
}
