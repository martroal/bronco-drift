/**
 * Templates de contratos argentinos en español natural.
 * Cada template tiene variables `{{nombre}}` que se reemplazan en el editor.
 *
 * Para sumar uno nuevo: agregarlo al array TEMPLATES con su definición.
 * Las variables se detectan automáticamente desde el markdown.
 */

export type Variable = {
  key: string;
  label: string;
  placeholder?: string;
  tipo: 'text' | 'date' | 'number' | 'longtext';
};

export type Template = {
  slug: string;
  nombre: string;
  rubro: string;
  descripcion: string;
  variables: Variable[];
  contenido: string;
};

export const TEMPLATES: Template[] = [
  {
    slug: 'freelance',
    nombre: 'Contrato de prestación de servicios freelance',
    rubro: 'Servicios',
    descripcion: 'Para trabajos por proyecto o por entrega entre vos y un cliente.',
    variables: [
      { key: 'cliente_nombre', label: 'Nombre del cliente', tipo: 'text', placeholder: 'Estudio Pérez SRL' },
      { key: 'cliente_cuit', label: 'CUIT del cliente', tipo: 'text', placeholder: '30-71234567-8' },
      { key: 'proveedor_nombre', label: 'Tu nombre', tipo: 'text', placeholder: 'María López' },
      { key: 'proveedor_cuit', label: 'Tu CUIT/CUIL', tipo: 'text', placeholder: '27-22345678-9' },
      { key: 'descripcion_trabajo', label: 'Trabajo a realizar', tipo: 'longtext', placeholder: 'Diseño de identidad visual: logotipo, paleta, tipografía y aplicaciones.' },
      { key: 'monto', label: 'Monto total (ARS)', tipo: 'number', placeholder: '450000' },
      { key: 'fecha_entrega', label: 'Fecha de entrega', tipo: 'date' },
      { key: 'fecha_firma', label: 'Fecha de firma', tipo: 'date' },
    ],
    contenido: `# Contrato de prestación de servicios

En **Buenos Aires**, a los **{{fecha_firma}}**, entre **{{cliente_nombre}}** (CUIT {{cliente_cuit}}), en adelante "el Cliente", y **{{proveedor_nombre}}** (CUIT {{proveedor_cuit}}), en adelante "el Proveedor", convienen lo siguiente.

## 1. Objeto

El Proveedor se compromete a realizar para el Cliente el siguiente trabajo:

{{descripcion_trabajo}}

## 2. Plazo

La fecha de entrega del trabajo terminado es el **{{fecha_entrega}}**. Cualquier extensión deberá acordarse por escrito entre ambas partes.

## 3. Honorarios

El Cliente pagará al Proveedor la suma de **ARS {{monto}}** en concepto de honorarios totales por la prestación. El pago se realizará en la cuenta indicada por el Proveedor dentro de los 10 días corridos desde la entrega del trabajo.

## 4. Propiedad intelectual

El trabajo entregado quedará en propiedad del Cliente una vez efectuado el pago total. Hasta entonces, sigue siendo propiedad intelectual del Proveedor.

## 5. Confidencialidad

Ambas partes mantendrán reserva sobre cualquier información sensible intercambiada durante la prestación.

## 6. Solución de controversias

Cualquier diferencia se resolverá inicialmente de buena fe entre las partes. De no llegar a acuerdo, se someterán a la jurisdicción ordinaria de la Ciudad Autónoma de Buenos Aires.

---

**Firmado por:** {{cliente_nombre}} y {{proveedor_nombre}}`,
  },

  {
    slug: 'nda',
    nombre: 'Acuerdo de confidencialidad (NDA)',
    rubro: 'Confidencialidad',
    descripcion: 'Protege información sensible al compartirla con socios, freelancers o terceros.',
    variables: [
      { key: 'parte_a', label: 'Parte que comparte info', tipo: 'text', placeholder: 'Tu nombre o empresa' },
      { key: 'parte_a_cuit', label: 'CUIT', tipo: 'text', placeholder: '30-71234567-8' },
      { key: 'parte_b', label: 'Parte que recibe info', tipo: 'text', placeholder: 'Nombre de la otra parte' },
      { key: 'parte_b_cuit', label: 'CUIT', tipo: 'text', placeholder: '27-22345678-9' },
      { key: 'proposito', label: 'Propósito de la información', tipo: 'longtext', placeholder: 'Evaluar una colaboración comercial entre las partes.' },
      { key: 'duracion_anios', label: 'Años de duración', tipo: 'number', placeholder: '2' },
      { key: 'fecha_firma', label: 'Fecha de firma', tipo: 'date' },
    ],
    contenido: `# Acuerdo de confidencialidad

En **Buenos Aires**, a los **{{fecha_firma}}**, entre **{{parte_a}}** (CUIT {{parte_a_cuit}}), en adelante "la Parte Reveladora", y **{{parte_b}}** (CUIT {{parte_b_cuit}}), en adelante "la Parte Receptora", celebran el presente acuerdo.

## 1. Objeto

Con el fin de **{{proposito}}**, la Parte Reveladora compartirá información que considera confidencial.

## 2. Definición de información confidencial

Toda información, escrita o verbal, técnica o comercial, que la Parte Reveladora identifique como confidencial al momento de comunicarla.

## 3. Obligaciones

La Parte Receptora se compromete a:

- No divulgar la información a terceros.
- Utilizar la información únicamente para el propósito acordado.
- Tomar medidas razonables para protegerla.

## 4. Duración

Las obligaciones de este acuerdo se mantienen por **{{duracion_anios}} años** a partir de la fecha de firma.

## 5. Excepciones

No se considerará confidencial la información que ya sea de dominio público sin culpa de la Parte Receptora, o aquella que la Parte Receptora ya conocía con anterioridad.

## 6. Jurisdicción

Cualquier controversia se someterá a los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.

---

**Firmado por:** {{parte_a}} y {{parte_b}}`,
  },

  {
    slug: 'servicios',
    nombre: 'Contrato de servicios profesionales recurrentes',
    rubro: 'Servicios',
    descripcion: 'Para servicios mensuales o por iguala (coaching, marketing, asesoría).',
    variables: [
      { key: 'cliente_nombre', label: 'Nombre del cliente', tipo: 'text' },
      { key: 'cliente_cuit', label: 'CUIT del cliente', tipo: 'text', placeholder: '30-71234567-8' },
      { key: 'proveedor_nombre', label: 'Tu nombre', tipo: 'text' },
      { key: 'proveedor_cuit', label: 'Tu CUIT/CUIL', tipo: 'text' },
      { key: 'servicio', label: 'Servicio que prestás', tipo: 'longtext', placeholder: 'Acompañamiento de marketing digital: gestión de redes, reporte mensual, reunión semanal.' },
      { key: 'monto_mensual', label: 'Iguala mensual (ARS)', tipo: 'number', placeholder: '180000' },
      { key: 'fecha_inicio', label: 'Fecha de inicio', tipo: 'date' },
      { key: 'duracion_meses', label: 'Duración (meses)', tipo: 'number', placeholder: '3' },
      { key: 'fecha_firma', label: 'Fecha de firma', tipo: 'date' },
    ],
    contenido: `# Contrato de servicios profesionales

En **Buenos Aires**, a los **{{fecha_firma}}**, entre **{{cliente_nombre}}** (CUIT {{cliente_cuit}}), en adelante "el Cliente", y **{{proveedor_nombre}}** (CUIT {{proveedor_cuit}}), en adelante "el Prestador", celebran el siguiente acuerdo.

## 1. Servicio

El Prestador se compromete a brindar al Cliente el siguiente servicio profesional:

{{servicio}}

## 2. Vigencia

El servicio inicia el **{{fecha_inicio}}** y tiene una duración de **{{duracion_meses}} meses**, prorrogable por acuerdo escrito entre las partes.

## 3. Honorarios

El Cliente pagará al Prestador la suma de **ARS {{monto_mensual}}** mensuales, dentro de los primeros 5 días hábiles de cada mes, en la cuenta indicada por el Prestador.

## 4. Modalidad

Las partes podrán acordar reuniones, entregas y formas de trabajo. El Prestador podrá organizarse de la manera que considere más eficiente para cumplir con los objetivos.

## 5. Rescisión

Cualquier parte puede rescindir este contrato con un preaviso de 30 días corridos, sin penalidad. Los servicios prestados hasta la rescisión deberán abonarse.

## 6. Jurisdicción

Tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.

---

**Firmado por:** {{cliente_nombre}} y {{proveedor_nombre}}`,
  },

  {
    slug: 'locacion',
    nombre: 'Contrato de locación temporal (con fines turísticos o transitorios)',
    rubro: 'Inmuebles',
    descripcion: 'Para alquileres cortos: temporada, fines de semana, eventos.',
    variables: [
      { key: 'locador_nombre', label: 'Nombre del locador (dueño)', tipo: 'text' },
      { key: 'locador_cuit', label: 'CUIT/DNI del locador', tipo: 'text' },
      { key: 'locatario_nombre', label: 'Nombre del locatario (inquilino)', tipo: 'text' },
      { key: 'locatario_cuit', label: 'CUIT/DNI del locatario', tipo: 'text' },
      { key: 'inmueble_direccion', label: 'Dirección del inmueble', tipo: 'text', placeholder: 'Av. Corrientes 1234, 5to A, CABA' },
      { key: 'fecha_inicio', label: 'Inicio de la locación', tipo: 'date' },
      { key: 'fecha_fin', label: 'Fin de la locación', tipo: 'date' },
      { key: 'monto_total', label: 'Monto total (ARS)', tipo: 'number' },
      { key: 'deposito', label: 'Depósito en garantía (ARS)', tipo: 'number' },
      { key: 'fecha_firma', label: 'Fecha de firma', tipo: 'date' },
    ],
    contenido: `# Contrato de locación temporal

En **Buenos Aires**, a los **{{fecha_firma}}**, entre **{{locador_nombre}}** (CUIT/DNI {{locador_cuit}}), en adelante "el Locador", y **{{locatario_nombre}}** (CUIT/DNI {{locatario_cuit}}), en adelante "el Locatario", celebran el siguiente contrato de locación temporal en los términos del art. 1199 del Código Civil y Comercial.

## 1. Objeto

El Locador entrega al Locatario, en locación temporal con fines turísticos o transitorios, el inmueble ubicado en **{{inmueble_direccion}}**.

## 2. Plazo

La locación inicia el **{{fecha_inicio}}** y finaliza el **{{fecha_fin}}**, sin necesidad de aviso previo de desocupación.

## 3. Precio

El Locatario pagará al Locador la suma total de **ARS {{monto_total}}**, abonadero según las partes acuerden (al inicio o por parcialidades).

## 4. Depósito

El Locatario entrega al Locador la suma de **ARS {{deposito}}** en concepto de depósito en garantía, que será restituido al finalizar el contrato si el inmueble es devuelto en las mismas condiciones en que se entregó.

## 5. Estado del inmueble

El Locatario recibe el inmueble en perfectas condiciones de uso y habitabilidad, y se compromete a devolverlo de igual manera, salvo el desgaste natural por uso normal.

## 6. Obligaciones del Locatario

- No subarrendar.
- Cuidar el inmueble como propio.
- Permitir inspecciones razonables avisadas con 24h de anticipación.

## 7. Jurisdicción

Tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.

---

**Firmado por:** {{locador_nombre}} y {{locatario_nombre}}`,
  },
];

/**
 * Reemplaza las variables {{key}} en el contenido del template con sus valores.
 * Variables sin valor quedan como `{{key}}` para que sean visibles en el preview.
 */
export function aplicarVariables(contenido: string, variables: Record<string, string>): string {
  return contenido.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const valor = variables[key];
    if (valor && valor.trim() !== '') return valor;
    return match;
  });
}

/**
 * Verifica si todas las variables del template tienen valor no-vacío.
 */
export function variablesCompletas(template: Template, variables: Record<string, string>): boolean {
  return template.variables.every((v) => {
    const valor = variables[v.key];
    return valor !== undefined && valor.trim() !== '';
  });
}

/**
 * Devuelve solo las claves de variables que faltan completarse.
 */
export function variablesFaltantes(template: Template, variables: Record<string, string>): string[] {
  return template.variables
    .filter((v) => {
      const valor = variables[v.key];
      return valor === undefined || valor.trim() === '';
    })
    .map((v) => v.key);
}

/**
 * Busca un template por slug.
 */
export function obtenerTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
