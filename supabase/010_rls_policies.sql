-- Migración: Políticas RLS (Row Level Security)
-- Fecha: 2026-03-24
-- Descripción: Habilitar RLS y crear políticas de seguridad para todas las tablas
-- NOTA: Estas políticas son para uso futuro con anon key. Actualmente se usa service role key.

-- =====================================================
-- TABLA: app_users
-- =====================================================
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "users_select_own" ON app_users
  FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own" ON app_users
  FOR UPDATE USING (auth.uid() = id);

-- Los admins pueden ver todos los usuarios
CREATE POLICY "users_select_admin" ON app_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Los admins pueden actualizar todos los usuarios
CREATE POLICY "users_update_admin" ON app_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- =====================================================
-- TABLA: barberos
-- =====================================================
ALTER TABLE barberos ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver barberos activos (para booking)
CREATE POLICY "barberos_select_all" ON barberos
  FOR SELECT USING (true);

-- Solo admins pueden modificar barberos
CREATE POLICY "barberos_insert_admin" ON barberos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

CREATE POLICY "barberos_update_admin" ON barberos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

CREATE POLICY "barberos_delete_admin" ON barberos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- =====================================================
-- TABLA: servicios
-- =====================================================
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver servicios activos
CREATE POLICY "servicios_select_all" ON servicios
  FOR SELECT USING (true);

-- Solo admins pueden modificar servicios
CREATE POLICY "servicios_insert_admin" ON servicios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

CREATE POLICY "servicios_update_admin" ON servicios
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

CREATE POLICY "servicios_delete_admin" ON servicios
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- =====================================================
-- TABLA: citas
-- =====================================================
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias citas
CREATE POLICY "citas_select_own" ON citas
  FOR SELECT USING (usuario_id = auth.uid());

-- Los barberos pueden ver sus citas asignadas
CREATE POLICY "citas_select_barbero" ON citas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM barberos b
      JOIN app_users u ON u.id = auth.uid()
      WHERE b.id = citas.barbero_id AND u.user_role = 'barbero'
    )
  );

-- Los admins pueden ver todas las citas
CREATE POLICY "citas_select_admin" ON citas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Los usuarios autenticados pueden crear citas
CREATE POLICY "citas_insert_auth" ON citas
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Los usuarios pueden cancelar sus propias citas
CREATE POLICY "citas_update_own" ON citas
  FOR UPDATE USING (usuario_id = auth.uid());

-- Los barberos pueden actualizar citas asignadas
CREATE POLICY "citas_update_barbero" ON citas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM barberos b
      JOIN app_users u ON u.id = auth.uid()
      WHERE b.id = citas.barbero_id AND u.user_role = 'barbero'
    )
  );

-- Los admins pueden actualizar todas las citas
CREATE POLICY "citas_update_admin" ON citas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- =====================================================
-- TABLA: horarios_disponibles
-- =====================================================
ALTER TABLE horarios_disponibles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver horarios
CREATE POLICY "horarios_select_all" ON horarios_disponibles
  FOR SELECT USING (true);

-- Solo admins pueden modificar horarios
CREATE POLICY "horarios_insert_admin" ON horarios_disponibles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

CREATE POLICY "horarios_update_admin" ON horarios_disponibles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Comentario: Las políticas RLS están listas pero NO se activarán
-- porque la app usa service_role_key que bypassa RLS.
-- Para activar RLS, cambiar a anon key en las API routes.
