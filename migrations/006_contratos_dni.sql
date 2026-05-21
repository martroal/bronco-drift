-- 006_contratos_dni.sql
-- 2026-05-21: Agregar campos DNI a las partes firmantes.
-- En contratos argentinos el bloque de firma estándar lleva "Aclaración: <nombre>"
-- y "DNI: <número>" debajo de la línea de firma. Sin DNI la firma es más débil
-- como prueba de identidad.
--
-- Campos nullable para no romper contratos existentes; la UI requiere DNI
-- en firmas nuevas.

alter table contratos_documentos
  add column if not exists parte_a_dni text,
  add column if not exists parte_b_dni text;
