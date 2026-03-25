-- Migración: Índices compuestos para optimizar queries
-- Fecha: 2026-03-24
-- Descripción: Agregar índices para las queries más comunes

-- Índice compuesto para filtrar citas por estado y fecha
CREATE INDEX IF NOT EXISTS idx_citas_estado_fecha ON citas(estado, fecha);

-- Índice para buscar citas por usuario
CREATE INDEX IF NOT EXISTS idx_citas_usuario ON citas(usuario_id);

-- Índice para buscar citas por barbero
CREATE INDEX IF NOT EXISTS idx_citas_barbero ON citas(barbero_id);

-- Comentario:
-- Estos índices optimizan las queries más frecuentes:
-- - Admin citas: filtro por estado + fecha
-- - Citas usuario: historial por usuario
-- - Barbero citas: citas asignadas a barbero
