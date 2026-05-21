import type { FAQItem } from '@/components/FAQ';

/**
 * Preguntas frecuentes de Firma Digital Simple. Aparecen en /contratos/preguntas.
 * Cubren las dudas legales argentinas y de uso práctico de freelancers/pymes.
 */
export const sello_faq: FAQItem[] = [
  {
    pregunta: '¿La firma electrónica que genera Firma Digital Simple es legal en Argentina?',
    respuesta:
      'Sí. La Ley 25.506 (Firma Digital) distingue dos tipos:\n\n1. Firma digital con certificado emitido por entidad licenciada: equivale a manuscrita y tiene presunción de validez.\n2. Firma electrónica simple: válida con valor probatorio. Si la contraparte la impugna, vos tenés que probar autenticidad.\n\nFirma Digital Simple genera firma electrónica simple con audit trail completo (IP, fecha, hash criptográfico del documento, user-agent del navegador). Es suficiente para contratos privados entre freelancers, pymes y profesionales.',
  },
  {
    pregunta: '¿Qué diferencia hay entre firma digital y firma electrónica simple?',
    respuesta:
      'La firma digital con certificado licenciado (AFIP, ONTI, etc.) requiere infraestructura PKI y un token físico o token blando emitido por una entidad licenciada. Tiene presunción de autoría: si alguien la impugna, tiene que probar que NO firmó.\n\nLa firma electrónica simple es la que se hace con un click, un dibujo en pantalla o tipeando el nombre. Es válida pero NO tiene presunción: si te impugnan, vos demostrás autenticidad con el audit trail.\n\nPara la mayoría de los contratos comerciales privados (freelance, NDA, locación, servicios, préstamos entre particulares), la electrónica simple alcanza. Para escrituras públicas, ciertos laborales bajo convenio o testamentos, necesitás escribano.',
  },
  {
    pregunta: '¿Sirve si la otra parte dice que no firmó?',
    respuesta:
      'Tenés un audit trail con: la fecha y hora exactas de la firma, la dirección IP pública desde donde firmó, el user-agent del navegador y un hash SHA-256 del documento al momento de firmar.\n\nSi la otra parte impugna, presentás ese audit trail en una eventual disputa. Junto con el patrón de comunicaciones que tengas (WhatsApp, mails), tiene fuerza probatoria.\n\nDicho eso, para contratos de monto alto o donde anticipás conflicto, conviene firma digital con certificado licenciado o ir directo a escribano.',
  },
  {
    pregunta: '¿Puedo usarlo sin pagar nada?',
    respuesta:
      'Sí, es 100% gratis. Sin tarjeta, sin trial, sin límite de contratos.\n\nPodés crear y editar contratos sin registrarte (se guardan en tu navegador). Para enviar el link de firma a la otra parte sí necesitás cuenta gratuita, porque el documento tiene que vivir online para que el otro pueda verlo desde su browser.',
  },
  {
    pregunta: '¿Cómo guardo el PDF firmado?',
    respuesta:
      'Cuando ambas partes firmaron, en el detalle del contrato hay un botón "Descargar PDF". El PDF incluye el texto completo del contrato + las firmas de ambas partes con aclaración + DNI + el audit trail completo (hash, IPs, fechas).\n\nGuardalo en algún lugar seguro (Drive, Dropbox, disco). El contrato sigue accesible en tu cuenta, pero conviene tener una copia tuya.',
  },
  {
    pregunta: '¿Qué pasa si se pierde el link de firma?',
    respuesta:
      'Mientras el contrato esté en estado "enviado", podés volver al detalle y copiar el link otra vez (o mandarlo de nuevo por WhatsApp).\n\nSi querés cancelar un envío y empezar de cero, en v0.2 vamos a tener un botón "cancelar y reabrir como borrador". Por ahora, podés crear una versión nueva del contrato (botón "Crear versión nueva") y mandar ese nuevo link.',
  },
  {
    pregunta: '¿Puedo editar un contrato que ya envié?',
    respuesta:
      'No directamente, y es a propósito: una vez que mandaste el link para firmar, el contenido no se puede modificar porque rompe el audit trail.\n\nLo que sí podés hacer: usar el botón "Crear versión nueva" en el detalle. Eso duplica el contrato como un nuevo borrador con título (v2), donde sí podés editar. El original queda intacto como histórico.',
  },
  {
    pregunta: '¿Cuántos firmantes puede tener un contrato?',
    respuesta:
      'En v0.1, dos partes: vos (creador) y una otra persona (parte B).\n\nMulti-parte (3+ firmantes) está en v0.2. Si tu caso lo requiere ahora, una solución temporal: hacer dos contratos paralelos vinculados o usar el campo "notas libres" para registrar los acuerdos accesorios.',
  },
];
