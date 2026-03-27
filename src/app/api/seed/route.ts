import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

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
    nombre: "Carlos Administrador",
    apellidos: "",
    telefono: "+1 555 000 0001",
    user_role: "admin",
  },
  // Clientes de prueba
  {
    email: "cliente1@test.com",
    password: "password123",
    nombre: "Juan Pérez",
    apellidos: "",
    telefono: "+1 555 200 0001",
    user_role: "cliente",
  },
  {
    email: "cliente2@test.com",
    password: "password123",
    nombre: "María González",
    apellidos: "",
    telefono: "+1 555 200 0002",
    user_role: "cliente",
  },
  {
    email: "cliente3@test.com",
    password: "password123",
    nombre: "Pedro Martínez",
    apellidos: "",
    telefono: "+1 555 200 0003",
    user_role: "cliente",
  },
  {
    email: "cliente4@test.com",
    password: "password123",
    nombre: "Ana Rodríguez",
    apellidos: "",
    telefono: "+1 555 200 0004",
    user_role: "cliente",
  },
  {
    email: "cliente5@test.com",
    password: "password123",
    nombre: "Luis Fernández",
    apellidos: "",
    telefono: "+1 555 200 0005",
    user_role: "cliente",
  },
  // Barberos (son usuarios con rol barbero)
  {
    email: "miguel@barberia.com",
    password: "barbero123",
    nombre: "Miguel Hernández",
    apellidos: "",
    telefono: "+1 555 100 0001",
    user_role: "barbero",
  },
  {
    email: "roberto@barberia.com",
    password: "barbero123",
    nombre: "Roberto García",
    apellidos: "",
    telefono: "+1 555 100 0002",
    user_role: "barbero",
  },
];

// Perfiles de barbero (se crean después de los usuarios)
// Estos perfiles se usan para la gestión de citas y especialidades
const barberoProfiles = [
  { nombre: "Miguel Hernández", especialidad: "Cortes clásicos", telefono: "+1 555 100 0001" },
  { nombre: "Roberto García", especialidad: "Barba y afeitado", telefono: "+1 555 100 0002" },
];

const servicios = [
  { nombre: "Corte de Cabello", descripcion: "Corte tradicional o moderno", duracion: 30, precio: 150 },
  { nombre: "Arreglo de Barba", descripcion: "Perfilado y arreglo de barba", duracion: 20, precio: 100 },
  { nombre: "Corte + Barba", descripcion: "Servicio completo", duracion: 45, precio: 220 },
  { nombre: "Afeitado Clásico", descripcion: "Afeitado con navaja", duracion: 25, precio: 120 },
  { nombre: "Corte Infantil", descripcion: "Corte para niños menores de 12", duracion: 20, precio: 100 },
  { nombre: "Tratamiento Capilar", descripcion: "Hidratación y tratamiento", duracion: 40, precio: 200 },
];

export async function POST() {
  try {
    const supabase = createSupabaseAdminClient();
    const logs: string[] = [];

    // 1. Limpiar datos existentes
    logs.push("🧹 Limpiando base de datos...");
    await supabase.from("citas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("horarios_disponibles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("app_users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("barberos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("servicios").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    logs.push("✅ Base de datos limpia");

    // 2. Crear usuarios
    logs.push("👥 Creando usuarios...");
    for (const user of testUsers) {
      const passwordHash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
      const { error } = await supabase
        .from("app_users")
        .insert({
          email: user.email,
          password_hash: passwordHash,
          user_role: user.user_role,
        });

      if (error) {
        logs.push(`❌ Error creando ${user.email}: ${error.message}`);
      } else {
        logs.push(`✅ ${user.email} (${user.user_role})`);
      }
    }

    // 3. Crear perfiles de barbero
    // Nota: Los barberos son usuarios con rol "barbero" en app_users
    // Esta tabla es para información adicional (especialidad, horarios)
    logs.push("💈 Creando perfiles de barbero...");
    for (const barbero of barberoProfiles) {
      const { error } = await supabase
        .from("barberos")
        .insert({
          nombre: barbero.nombre,
          especialidad: barbero.especialidad,
          telefono: barbero.telefono,
          activo: true,
        });

      if (error) {
        logs.push(`❌ Error creando perfil barbero ${barbero.nombre}: ${error.message}`);
      } else {
        logs.push(`✅ Perfil barbero: ${barbero.nombre}`);
      }
    }

    // 4. Crear servicios
    logs.push("✂️ Creando servicios...");
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
        logs.push(`❌ Error creando servicio ${servicio.nombre}: ${error.message}`);
      } else {
        logs.push(`✅ ${servicio.nombre}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seed completado exitosamente",
      logs,
      credentials: {
        admin: { email: "admin@barberia.com", password: "admin123" },
        barberos: [
          { email: "miguel@barberia.com", password: "barbero123" },
          { email: "roberto@barberia.com", password: "barbero123" },
        ],
        clientes: [
          { email: "cliente1@test.com", password: "password123" },
          { email: "cliente2@test.com", password: "password123" },
          { email: "cliente3@test.com", password: "password123" },
          { email: "cliente4@test.com", password: "password123" },
          { email: "cliente5@test.com", password: "password123" },
        ],
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Error durante el seed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
