-- Tabla de barberos
CREATE TABLE IF NOT EXISTS barberos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  especialidad TEXT,
  foto_url TEXT,
  telefono TEXT,
  horario_atencion JSONB,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_barberos_activo ON barberos(activo);
CREATE INDEX IF NOT EXISTS idx_barberos_nombre ON barberos(nombre);

-- Comentarios
COMMENT ON TABLE barberos IS 'Perfiles de barberos que trabajan en la barbería';
COMMENT ON COLUMN barberos.nombre IS 'Nombre completo del barbero';
COMMENT ON COLUMN barberos.especialidad IS 'Especialidad del barbero (ej: corte, barba, etc.)';
COMMENT ON COLUMN barberos.foto_url IS 'URL de la foto del barbero';
COMMENT ON COLUMN barberos.telefono IS 'Número de teléfono del barbero';
COMMENT ON COLUMN barberos.horario_atencion IS 'Horario de atención en formato JSON (días y horas)';
COMMENT ON COLUMN barberos.activo IS 'Indica si el barbero está activo';
