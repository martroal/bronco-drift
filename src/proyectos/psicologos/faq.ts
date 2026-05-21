import type { FAQItem } from '@/components/FAQ';

/**
 * Preguntas frecuentes de Freud. Aparecen en /freud/preguntas.
 * Pensadas para captar búsquedas long-tail de psicólogos clínicos
 * en Argentina que están evaluando herramientas digitales.
 */
export const freudFAQ: FAQItem[] = [
  {
    pregunta: '¿Puedo usar Freud sin crear cuenta?',
    respuesta:
      'Sí. Podés cargar pacientes, escribir sesiones y ver tu cuaderno sin registrarte. Los datos se guardan en tu navegador.\n\nSi después creás cuenta, lo que cargaste se sube automáticamente a tu cuenta y queda sincronizado entre dispositivos.',
  },
  {
    pregunta: '¿Mis notas son privadas? ¿Quién puede verlas?',
    respuesta:
      'Solo vos. Las notas se guardan en una base de datos con reglas de seguridad a nivel fila (Row Level Security) que aseguran que cada psicólogo solo accede a sus propios datos.\n\nNi nosotros como administradores del sistema vemos contenido específico de tus sesiones, salvo en casos de soporte donde vos lo solicites explícitamente.',
  },
  {
    pregunta: '¿Cómo exporto mis datos si quiero migrar a otra app?',
    respuesta:
      'Por ahora la exportación es una funcionalidad pendiente de v0.2. Como tus datos están en tu navegador (modo anónimo) o en tu cuenta (modo logueado), podés solicitar un export en JSON o CSV cuando lo necesites.\n\nLa idea es que nunca quedes encerrado en Freud: la herramienta es solo tan útil como su capacidad de dejarte ir.',
  },
  {
    pregunta: '¿Es legal guardar historia clínica online en Argentina?',
    respuesta:
      'En Argentina, la Ley 26.529 (derechos del paciente) y la Ley 25.326 (protección de datos personales) regulan la historia clínica. Almacenarla en formato digital es legal siempre que se garantice integridad, seguridad y confidencialidad.\n\nFreud cumple con las prácticas estándar de seguridad. Recomendamos consultar con un asesor legal antes de migrar toda tu práctica clínica digital si trabajás con obras sociales o ART que tienen requisitos específicos.',
  },
  {
    pregunta: '¿Qué pasa si me olvido la contraseña?',
    respuesta:
      'Por ahora el flujo de "olvidé mi contraseña" automático no está habilitado. Estamos validando la fiabilidad del sistema de mails antes de activarlo (más vale no tener feature que tener feature roto).\n\nMientras tanto, si te pasa, escribinos y reseteamos tu contraseña manualmente. Después configurás una nueva al loguearte.',
  },
  {
    pregunta: '¿Cuántos pacientes puedo cargar?',
    respuesta:
      'No hay límite definido. La app está pensada para escalar a estudios chicos y medianos (50-300 pacientes activos). Si tu práctica es más grande y notás problemas, contanos: optimizamos.',
  },
  {
    pregunta: '¿Freud reemplaza a una historia clínica formal?',
    respuesta:
      'No. Freud es una herramienta de trabajo del psicólogo: notas, planes, recap pre-sesión. La historia clínica formal que pueda requerir una obra social o un proceso judicial sigue siendo un documento separado que vos confeccionás.\n\nLo que sí podés hacer: usar Freud como base para escribir esas historias clínicas formales cuando hagan falta, ya que tenés todas las sesiones documentadas.',
  },
];
