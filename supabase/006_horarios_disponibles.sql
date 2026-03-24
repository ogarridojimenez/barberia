-- Tabla de horarios disponibles
CREATE TABLE IF NOT EXISTS horarios_disponibles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbero_id UUID NOT NULL REFERENCES barberos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  disponible BOOLEAN DEFAULT true,
  cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_horarios_barbero ON horarios_disponibles(barbero_id);
CREATE INDEX IF NOT EXISTS idx_horarios_fecha ON horarios_disponibles(fecha);
CREATE INDEX IF NOT EXISTS idx_horarios_disponible ON horarios_disponibles(disponible);
CREATE INDEX IF NOT EXISTS idx_horarios_fecha_barbero ON horarios_disponibles(fecha, barbero_id);
CREATE INDEX IF NOT EXISTS idx_horarios_cita ON horarios_disponibles(cita_id);

-- Comentarios
COMMENT ON TABLE horarios_disponibles IS 'Slots de tiempo disponibles para citas';
COMMENT ON COLUMN horarios_disponibles.barbero_id IS 'ID del barbero';
COMMENT ON COLUMN horarios_disponibles.fecha IS 'Fecha del horario';
COMMENT ON COLUMN horarios_disponibles.hora_inicio IS 'Hora de inicio del slot';
COMMENT ON COLUMN horarios_disponibles.hora_fin IS 'Hora de fin del slot';
COMMENT ON COLUMN horarios_disponibles.disponible IS 'Indica si el horario está disponible';
COMMENT ON COLUMN horarios_disponibles.cita_id IS 'ID de la cita asignada (si no está disponible)';

-- Constraint para asegurar que hora_fin > hora_inicio
ALTER TABLE horarios_disponibles
  ADD CONSTRAINT check_horario_valido
  CHECK (hora_fin > hora_inicio);

-- Constraint para asegurar que si no está disponible, tiene cita_id
ALTER TABLE horarios_disponibles
  ADD CONSTRAINT check_disponible_cita
  CHECK (
    (disponible = true AND cita_id IS NULL) OR
    (disponible = false AND cita_id IS NOT NULL)
  );
