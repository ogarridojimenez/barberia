-- Enum para estado de citas
CREATE TYPE cita_estado AS ENUM ('pendiente', 'confirmada', 'completada', 'cancelada');

-- Tabla de citas
CREATE TABLE IF NOT EXISTS citas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  barbero_id UUID NOT NULL REFERENCES barberos(id) ON DELETE RESTRICT,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE RESTRICT,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME,
  estado cita_estado DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_citas_usuario ON citas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_citas_barbero ON citas(barbero_id);
CREATE INDEX IF NOT EXISTS idx_citas_servicio ON citas(servicio_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_barbero ON citas(fecha, barbero_id);

-- Comentarios
COMMENT ON TABLE citas IS 'Reservas de clientes';
COMMENT ON COLUMN citas.usuario_id IS 'ID del usuario que reservó';
COMMENT ON COLUMN citas.barbero_id IS 'ID del barbero asignado';
COMMENT ON COLUMN citas.servicio_id IS 'ID del servicio solicitado';
COMMENT ON COLUMN citas.fecha IS 'Fecha de la cita';
COMMENT ON COLUMN citas.hora_inicio IS 'Hora de inicio de la cita';
COMMENT ON COLUMN citas.hora_fin IS 'Hora de fin de la cita (calculada)';
COMMENT ON COLUMN citas.estado IS 'Estado de la cita';
COMMENT ON COLUMN citas.notas IS 'Notas adicionales del cliente';

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_citas_updated_at
  BEFORE UPDATE ON citas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
