-- Migración: Constraint unique para evitar doble reserva
-- Fecha: 2026-03-24
-- Descripción: Prevenir que dos citas activas ocupen el mismo horario con el mismo barbero

-- Crear índice único parcial: solo aplica a citas activas
-- Esto previene double-booking a nivel de base de datos
CREATE UNIQUE INDEX idx_citas_unique_slot 
  ON citas (barbero_id, fecha, hora_inicio) 
  WHERE estado = 'activa';

-- Comentario: 
-- - Este índice previene que se creen dos citas activas para el mismo barbero
--   en la misma fecha y hora.
-- - Las citas canceladas o completadas NO afectan este constraint.
-- - Si se intenta insertar una cita duplicada, la DB retornará error de unique violation.
