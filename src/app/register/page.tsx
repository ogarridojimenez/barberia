"use client";

import { useRef, useState, FormEvent } from "react";
import Link from "next/link";
import { ImageUpload } from "@/components/ui";

async function registerUser(
  email: string,
  password: string,
  nombre?: string,
  apellidos?: string,
  foto_url?: string
) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, nombre, apellidos, foto_url }),
  });
  return res.json();
}

export default function RegisterPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const nombreRef = useRef<HTMLInputElement>(null);
  const apellidosRef = useRef<HTMLInputElement>(null);
  const [fotoUrl, setFotoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";
    const nombre = nombreRef.current?.value || "";
    const apellidos = apellidosRef.current?.value || "";

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const data = await registerUser(
      email,
      password,
      nombre || undefined,
      apellidos || undefined,
      fotoUrl || undefined
    );

    setLoading(false);

    if (data.error) {
      setError(getErrorMessage(data.error));
      return;
    }

    // Registro exitoso, redirigir al login para que inicie sesión
    window.location.replace("/login");
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    fontSize: 14,
    border: "1px solid #3F3F46",
    borderRadius: 8,
    background: "#27272A",
    color: "#FAFAFA",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 8,
    color: "#A1A1AA",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a1a",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 450 }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#18181B"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              marginBottom: 8,
              color: "#FAFAFA",
            }}
          >
            Gentleman&apos;s Cut
          </h1>
          <p style={{ color: "#71717A", fontSize: 14 }}>Crea tu cuenta</p>
        </div>

        <div
          style={{
            background: "#18181B",
            border: "1px solid #27272A",
            borderRadius: 16,
            padding: 32,
          }}
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  padding: 14,
                  marginBottom: 20,
                  background: "#450A0A",
                  color: "#FCA5A5",
                  borderRadius: 8,
                  fontSize: 14,
                  border: "1px solid #EF4444",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Foto de perfil */}
              <ImageUpload
                label="Foto de perfil (opcional)"
                value={fotoUrl}
                onChange={setFotoUrl}
              />

              {/* Nombre y Apellidos en fila */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label htmlFor="nombre" style={labelStyle}>
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    ref={nombreRef}
                    placeholder="Tu nombre"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="apellidos" style={labelStyle}>
                    Apellidos
                  </label>
                  <input
                    id="apellidos"
                    name="apellidos"
                    type="text"
                    ref={apellidosRef}
                    placeholder="Tus apellidos"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" style={labelStyle}>
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  ref={emailRef}
                  placeholder="tu@email.com"
                  style={inputStyle}
                />
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" style={labelStyle}>
                  Contraseña *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  ref={passwordRef}
                  placeholder="Mínimo 8 caracteres"
                  style={inputStyle}
                />
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label htmlFor="confirmPassword" style={labelStyle}>
                  Confirmar contraseña *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  ref={confirmPasswordRef}
                  placeholder="Repite tu contraseña"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 28,
                padding: "14px",
                fontSize: 14,
                fontWeight: 600,
                color: "#18181B",
                background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
                border: "none",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
              }}
            >
              {loading ? "Cargando..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/login" style={{ fontSize: 14, color: "#71717A" }}>
            ¿Ya tienes cuenta?{" "}
            <span style={{ color: "#D4AF37", fontWeight: 500 }}>
              Inicia sesión
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    INVALID_INPUT: "Datos de entrada inválidos.",
    EMAIL_ALREADY_EXISTS: "Este email ya está registrado.",
    DB_ERROR: "Error de base de datos. Intenta más tarde.",
    INTERNAL_ERROR: "Error interno del servidor. Intenta más tarde.",
  };
  return messages[errorCode] || `Error: ${errorCode}`;
}
