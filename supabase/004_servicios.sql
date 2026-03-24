-- Tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  duracion_minutos INTEGER NOT NULL,
  precio DECIMAL(10,2),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_servicios_activo ON servicios(activo);
CREATE INDEX IF NOT EXISTS idx_servicios_nombre ON servicios(nombre);

-- Comentarios
COMMENT ON TABLE servicios IS 'Servicios ofrecidos por la barbería';
COMMENT ON COLUMN servicios.nombre IS 'Nombre del servicio (ej: Corte de cabello)';
COMMENT ON COLUMN servicios.descripcion IS 'Descripción detallada del servicio';
COMMENT ON COLUMN servicios.duracion_minutos IS 'Duración del servicio en minutos';
COMMENT ON COLUMN servicios.precio IS 'Precio del servicio';
COMMENT ON COLUMN servicios.activo IS 'Indica si el servicio está disponible';
