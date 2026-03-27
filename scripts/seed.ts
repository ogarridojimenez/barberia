/**
 * Script de Seed para datos de prueba
 * 
 * Ejecutar con: npx ts-node --esm scripts/seed.ts
 * 
 * Este script:
 * 1. Limpia datos existentes
 * 2. Crea usuarios de prueba con contraseñas hasheadas
 * 3. Crea citas de prueba
 */

import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BCRYPT_ROUNDS = 12;

interface TestUser {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  user_role: "cliente" | "barbero" | "admin";
}

const testUsers: TestUser[] = [
  // Admin
  {
    email: "admin@barberia.com",
    password: "admin123",
    nombre: "Carlos",
    apellidos: "Administrador",
    telefono: "+1 555 000 0001",
    user_role: "admin",
  },
  // Clientes de prueba
  {
    email: "cliente1@test.com",
    password: "password123",
    nombre: "Juan",
    apellidos: "Pérez García",
    telefono: "+1 555 200 0001",
    user_role: "cliente",
  },
  {
    email: "cliente2@test.com",
    password: "password123",
    nombre: "María",
    apellidos: "González López",
    telefono: "+1 555 200 0002",
    user_role: "cliente",
  },
  {
    email: "cliente3@test.com",
    password: "password123",
    nombre: "Pedro",
    apellidos: "Martínez Silva",
    telefono: "+1 555 200 0003",
    user_role: "cliente",
  },
  {
    email: "cliente4@test.com",
    password: "password123",
    nombre: "Ana",
    apellidos: "Rodríguez Díaz",
    telefono: "+1 555 200 0004",
    user_role: "cliente",
  },
  {
    email: "cliente5@test.com",
    password: "password123",
    nombre: "Luis",
    apellidos: "Fernández Ruiz",
    telefono: "+1 555 200 0005",
    user_role: "cliente",
  },
  // Barberos de prueba
  {
    email: "barbero1@barberia.com",
    password: "barbero123",
    nombre: "Miguel",
    apellidos: "Hernández Torres",
    telefono: "+1 555 100 0001",
    user_role: "barbero",
  },
  {
    email: "barbero2@barberia.com",
    password: "barbero123",
    nombre: "Roberto",
    apellidos: "García Mendoza",
    telefono: "+1 555 100 0002",
    user_role: "barbero",
  },
];

async function cleanDatabase() {
  console.log("🧹 Limpiando base de datos...");

  // Eliminar en orden correcto (respetando foreign keys)
  await supabase.from("citas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("horarios_disponibles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("app_users").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("✅ Base de datos limpia");
}

async function createUsers() {
  console.log("👥 Creando usuarios de prueba...");

  for (const user of testUsers) {
    const passwordHash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);

    const { data, error } = await supabase
      .from("app_users")
      .insert({
        email: user.email,
        password_hash: passwordHash,
        nombre: user.nombre,
        apellidos: user.apellidos,
        telefono: user.telefono,
        user_role: user.user_role,
      })
      .select("id, email, user_role")
      .single();

    if (error) {
      console.error(`❌ Error creando ${user.email}:`, error.message);
    } else {
      console.log(`✅ Creado: ${data.email} (${data.user_role})`);
    }
  }
}

async function seedBarberos() {
  console.log("💈 Creando barberos...");

  const barberos = [
    { nombre: "Miguel Hernández", especialidad: "Cortes clásicos", telefono: "+1 555 100 0001" },
    { nombre: "Roberto García", especialidad: "Barba y afeitado", telefono: "+1 555 100 0002" },
  ];

  for (const barbero of barberos) {
    const { error } = await supabase
      .from("barberos")
      .insert({
        nombre: barbero.nombre,
        especialidad: barbero.especialidad,
        telefono: barbero.telefono,
        activo: true,
      });

    if (error) {
      console.error(`❌ Error creando barbero ${barbero.nombre}:`, error.message);
    } else {
      console.log(`✅ Barbero creado: ${barbero.nombre}`);
    }
  }
}

async function seedServicios() {
  console.log("✂️ Creando servicios...");

  const servicios = [
    { nombre: "Corte de Cabello", descripcion: "Corte tradicional o moderno", duracion: 30, precio: 150 },
    { nombre: "Arreglo de Barba", descripcion: "Perfilado y arreglo de barba", duracion: 20, precio: 100 },
    { nombre: "Corte + Barba", descripcion: "Servicio completo", duracion: 45, precio: 220 },
    { nombre: "Afeitado Clásico", descripcion: "Afeitado con navaja", duracion: 25, precio: 120 },
    { nombre: "Corte Infantil", descripcion: "Corte para niños menores de 12", duracion: 20, precio: 100 },
    { nombre: "Tratamiento Capilar", descripcion: "Hidratación y tratamiento", duracion: 40, precio: 200 },
  ];

  for (const servicio of servicios) {
    const { error } = await supabase
      .from("servicios")
      .insert({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        duracion_minutos: servicio.duracion,
        precio: servicio.precio,
        activo: true,
      });

    if (error) {
      console.error(`❌ Error creando servicio ${servicio.nombre}:`, error.message);
    } else {
      console.log(`✅ Servicio creado: ${servicio.nombre}`);
    }
  }
}

async function main() {
  console.log("🚀 Iniciando seed de datos...\n");

  try {
    await cleanDatabase();
    await createUsers();
    await seedBarberos();
    await seedServicios();

    console.log("\n✅ Seed completado exitosamente!");
    console.log("\n📋 Credenciales de prueba:");
    console.log("   Admin: admin@barberia.com / admin123");
    console.log("   Clientes: cliente1@test.com a cliente5@test.com / password123");
    console.log("   Barberos: barbero1@barberia.com, barbero2@barberia.com / barbero123");
  } catch (error) {
    console.error("❌ Error durante el seed:", error);
    process.exit(1);
  }
}

main();
