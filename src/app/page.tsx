"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(135deg, rgba(24,24,27,1) 0%, rgba(39,39,42,0.95) 50%, rgba(24,24,27,1) 100%),
            radial-gradient(ellipse at 20% 50%, rgba(212,175,55,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(212,175,55,0.1) 0%, transparent 40%)
          `,
          backgroundColor: "#18181B",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>Gentleman&apos;s Cut</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Link
              href="/login"
              style={{
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 500,
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 6,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              style={{
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 500,
                color: "#1a1a1a",
                background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
                borderRadius: 6,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              Registrarse
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 48px" }}>
          <div style={{ maxWidth: 700, textAlign: "center" }}>
            <div style={{ marginBottom: 24 }}>
              <span style={{ 
                display: "inline-block", 
                padding: "8px 16px", 
                background: "rgba(212, 175, 55, 0.2)", 
                border: "1px solid rgba(212, 175, 55, 0.4)", 
                borderRadius: 20,
                fontSize: 13,
                color: "#D4AF37",
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                ★ Barbería Premium
              </span>
            </div>
            
            <h1 style={{ 
              fontSize: 56, 
              fontWeight: 700, 
              color: "#fff", 
              letterSpacing: "-0.03em", 
              lineHeight: 1.1,
              marginBottom: 24,
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}>
              Donde el estilo <br />
              <span style={{ color: "#D4AF37" }}>encuentra la tradición</span>
            </h1>
            
            <p style={{ 
              fontSize: 18, 
              color: "rgba(255,255,255,0.8)", 
              lineHeight: 1.7, 
              marginBottom: 40,
              maxWidth: 500,
              margin: "0 auto 40px",
            }}>
              Experimenta el arte de la barbería clásica. Cortes de precisión, 
              afeitados tradicionales y un servicio personalizado para el caballero moderno.
            </p>

            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <Link
                href="/login"
                style={{
                  padding: "16px 32px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
                }}
              >
                Reservar Cita
              </Link>
              <Link
                href="/register"
                style={{
                  padding: "16px 32px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#fff",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        </main>

        <div style={{ 
          padding: "32px 48px", 
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.3)",
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: 32, 
            maxWidth: 1000, 
            margin: "0 auto" 
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✂️</div>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Cortes de Precision</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Estilos clásicos y modernos</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🪒</div>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Afeitado Tradicional</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Toalla caliente y navaja</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💈</div>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Barba Estilizada</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Diseño y mantenimiento</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Productos Premium</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Marcas de primera línea</div>
            </div>
          </div>
        </div>

        <div style={{ 
          padding: "20px 48px", 
          display: "flex", 
          justifyContent: "center", 
          gap: 32,
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}>
          <a href="#" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Instagram</a>
          <a href="#" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Facebook</a>
          <a href="#" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>WhatsApp</a>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>© 2026 Gentleman&apos;s Cut</span>
        </div>
      </div>
    </div>
  );
}