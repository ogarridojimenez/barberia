-- Migración: Agregar estado 'completada' al enum cita_estado
-- Fecha: 2026-03-24
-- Descripción: Permite marcar citas como completadas para tracking de revenue

-- Agregar 'completada' al enum existente
ALTER TYPE cita_estado ADD VALUE IF NOT EXISTS 'completada';

-- Comentario: Después de ejecutar esta migración, el enum tendrá:
-- 'activa', 'cancelada', 'completada'
