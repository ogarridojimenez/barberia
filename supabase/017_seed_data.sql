-- Script: Limpieza y seed de datos de prueba
-- Fecha: 2026-03-24
-- Descripción: Limpia usuarios y crea datos de prueba para testing

-- 1. LIMPIAR DATOS EXISTENTES
-- Eliminar citas primero (por foreign keys)
DELETE FROM citas;

-- Eliminar horarios disponibles
DELETE FROM horarios_disponibles;

-- Eliminar todos los usuarios excepto admin
DELETE FROM app_users WHERE email != 'admin@barberia.com';

-- 2. ACTUALIZAR ADMIN con nombre
UPDATE app_users 
SET 
  nombre = 'Carlos',
  apellidos = 'Administrador',
  telefono = '+1 555 000 0001',
  user_role = 'admin'
WHERE email = 'admin@barberia.com';

-- 3. CREAR USUARIOS CLIENTES DE PRUEBA
-- Nota: Las contraseñas deben hashearse desde la app, aquí usamos un placeholder
-- Los usuarios se crearán mediante el script seed.ts

-- 4. VERIFICAR BARBEROS EXISTENTES
-- Si no hay barberos, crear algunos de prueba
INSERT INTO barberos (id, nombre, especialidad, telefono, activo)
SELECT 
  gen_random_uuid(),
  'Miguel Hernández',
  'Cortes clásicos',
  '+1 555 100 0001',
  true
WHERE NOT EXISTS (SELECT 1 FROM barberos LIMIT 1);

INSERT INTO barberos (id, nombre, especialidad, telefono, activo)
SELECT 
  gen_random_uuid(),
  'Roberto García',
  'Barba y afeitado',
  '+1 555 100 0002',
  true
WHERE (SELECT COUNT(*) FROM barberos) < 2;

-- 5. VERIFICAR SERVICIOS EXISTENTES
-- Si no hay servicios, crear algunos de prueba
INSERT INTO servicios (id, nombre, descripcion, duracion_minutos, precio, activo)
SELECT 
  gen_random_uuid(),
  'Corte de Cabello',
  'Corte tradicional o moderno',
  30,
  150,
  true
WHERE NOT EXISTS (SELECT 1 FROM servicios LIMIT 1);

INSERT INTO servicios (id, nombre, descripcion, duracion_minutos, precio, activo)
SELECT 
  gen_random_uuid(),
  'Arreglo de Barba',
  'Perfilado y arreglo de barba',
  20,
  100,
  true
WHERE (SELECT COUNT(*) FROM servicios) < 2;

INSERT INTO servicios (id, nombre, descripcion, duracion_minutos, precio, activo)
SELECT 
  gen_random_uuid(),
  'Corte + Barba',
  'Servicio completo',
  45,
  220,
  true
WHERE (SELECT COUNT(*) FROM servicios) < 3;

INSERT INTO servicios (id, nombre, descripcion, duracion_minutos, precio, activo)
SELECT 
  gen_random_uuid(),
  'Afeitado Clásico',
  'Afeitado con navaja',
  25,
  120,
  true
WHERE (SELECT COUNT(*) FROM servicios) < 4;

INSERT INTO servicios (id, nombre, descripcion, duracion_minutos, precio, activo)
SELECT 
  gen_random_uuid(),
  'Corte Infantil',
  'Corte para niños menores de 12',
  20,
  100,
  true
WHERE (SELECT COUNT(*) FROM servicios) < 5;

INSERT INTO servicios (id, nombre, descripcion, duracion_minutos, precio, activo)
SELECT 
  gen_random_uuid(),
  'Tratamiento Capilar',
  'Hidratación y tratamiento',
  40,
  200,
  true
WHERE (SELECT COUNT(*) FROM servicios) < 6;
