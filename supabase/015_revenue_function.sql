-- Migración: Función SQL para calcular revenue
-- Fecha: 2026-03-24
-- Descripción: Calcular ingresos de citas completadas directamente en DB (evita OOM)

-- Función para obtener estadísticas de revenue
CREATE OR REPLACE FUNCTION get_revenue_stats()
RETURNS TABLE (
  total_revenue NUMERIC,
  today_revenue NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.precio), 0) as total_revenue,
    COALESCE(
      SUM(CASE WHEN c.fecha = CURRENT_DATE THEN s.precio ELSE 0 END),
      0
    ) as today_revenue
  FROM citas c
  INNER JOIN servicios s ON s.id = c.servicio_id
  WHERE c.estado = 'completada';
END;
$$;

-- Comentario:
-- Esta función calcula el revenue directamente en SQL,
-- evitando cargar miles de registros en memoria (previene OOM).
