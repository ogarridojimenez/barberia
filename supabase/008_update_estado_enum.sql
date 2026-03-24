-- Actualizar enum de estado de citas
-- Cambiar de: pendiente, confirmada, completada, cancelada
-- A: activa, cancelada

ALTER TYPE cita_estado ADD VALUE IF NOT EXISTS 'activa';

-- Actualizar registros existentes que tienen 'pendiente' o 'confirmada' a 'activa'
UPDATE citas SET estado = 'activa' WHERE estado = 'pendiente';
UPDATE citas SET estado = 'activa' WHERE estado = 'confirmada';

-- Eliminar los valores antiguos del enum
ALTER TYPE cita_estado DROP VALUE IF EXISTS 'pendiente';
ALTER TYPE cita_estado DROP VALUE IF EXISTS 'confirmada';
ALTER TYPE cita_estado DROP VALUE IF EXISTS 'completada';