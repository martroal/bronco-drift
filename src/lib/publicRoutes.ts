/**
 * Rutas "públicas standalone": pages a las que llega un usuario externo por un
 * link compartido (token de firma de contratos, futuras shareables como
 * "ver paciente compartido", etc.). En estas rutas el shell de Bronco Drift
 * (header global + AuthBanner) NO debe renderizarse, porque el usuario no
 * está navegando la plataforma, está accediendo a una pieza standalone.
 *
 * Para agregar una nueva ruta pública, sumar el regex acá.
 */
const PATRONES_PUBLICOS: RegExp[] = [
  /^\/contratos\/firmar\/[^/]+$/,
];

export function esRutaPublica(pathname: string): boolean {
  return PATRONES_PUBLICOS.some((re) => re.test(pathname));
}
