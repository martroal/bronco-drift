/**
 * Tipos del módulo Freud. Compartidos entre la implementación Supabase
 * y la implementación localStorage.
 */

export type EstadoPaciente = 'activo' | 'pausa' | 'alta';

export type Paciente = {
  id: string;
  user_id: string;
  nombre: string;
  fecha_nacimiento: string | null;
  primera_sesion: string | null;
  motivo_consulta: string | null;
  estado: EstadoPaciente;
  proxima_sesion: string | null;
  created_at: string;
};

export type Sesion = {
  id: string;
  user_id: string;
  paciente_id: string;
  fecha: string;
  tema_central: string | null;
  tarea_propuesta: string | null;
  estado_emocional: string | null;
  notas_libres: string | null;
  plan_proxima: string | null;
  created_at: string;
};

export type Tag = {
  id: string;
  user_id: string;
  nombre: string;
  color: string;
  created_at: string;
};

export type SesionConTags = Sesion & {
  tags: Tag[];
};

export type SesionConPaciente = Sesion & {
  paciente: Pick<Paciente, 'id' | 'nombre' | 'estado'>;
};
