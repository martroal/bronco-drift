export type EstadoContrato = 'borrador' | 'enviado' | 'firmado' | 'cancelado';
export type FirmaTipo = 'dibujo' | 'tipeo';

export type Contrato = {
  id: string;
  user_id: string | null;
  titulo: string;
  template_slug: string | null;
  contenido_md: string;
  variables: Record<string, string>;
  estado: EstadoContrato;

  parte_a_nombre: string | null;
  parte_a_email: string | null;
  parte_a_firma_data: string | null;
  parte_a_firma_tipo: FirmaTipo | null;
  parte_a_firmado_at: string | null;
  parte_a_ip: string | null;
  parte_a_user_agent: string | null;

  parte_b_nombre: string | null;
  parte_b_email: string | null;
  parte_b_firma_data: string | null;
  parte_b_firma_tipo: FirmaTipo | null;
  parte_b_firmado_at: string | null;
  parte_b_ip: string | null;
  parte_b_user_agent: string | null;

  link_firma_token: string | null;
  hash_documento: string | null;
  created_at: string;
};

export type AuditTrailEntry = {
  evento: string;
  fecha: string;
  ip: string | null;
  user_agent: string | null;
};
