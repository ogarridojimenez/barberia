"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/auth/client";
import Link from "next/link";

interface Barbero { id: string; nombre: string; especialidad: string; }
interface Servicio { id: string; nombre: string; duracion_minutos: number; precio: number; }
interface Horario { id: string; hora_inicio: string; hora_fin: string; disponible: boolean; }
interface CitaExistente { hora_inicio: string; hora_fin: string; }

export default function NuevaCitaPage() {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [citasExistentes, setCitasExistentes] = useState<CitaExistente[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horarioError, setHorarioError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ barbero_id: "", servicio_id: "", fecha: "", horario_id: "", notas: "" });

  useEffect(() => { fetchDatos(); }, []);
  useEffect(() => { if (formData.barbero_id && formData.fecha) fetchHorarios(); }, [formData.barbero_id, formData.fecha]);

  async function fetchDatos() {
    try {
      const [barberosRes, serviciosRes] = await Promise.all([
        fetchApi("/api/barberos"),
        fetchApi("/api/servicios"),
      ]);
      const barberosData = await barberosRes.json();
      const serviciosData = await serviciosRes.json();
      setBarberos(barberosData.barberos || []);
      setServicios(serviciosData.servicios || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  }

  async function fetchHorarios() {
    try {
      setHorarioError(null);
      const res = await fetchApi(`/api/barberos/${formData.barbero_id}/horarios?fecha=${formData.fecha}`);
      const data = await res.json();
      
      if (data.error) {
        setHorarioError(data.details || data.error);
        setHorarios([]);
        setCitasExistentes([]);
        return;
      }
      
      setHorarios(data.horarios || []);
      setCitasExistentes(data.citas || []);
    } catch (err) { 
      console.error(err); 
      setHorarioError("Error al cargar horarios");
    }
  }

  function getMinDate() {
    const today = new Date();
    const day = today.getDay();
    if (day === 0) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split("T")[0];
    }
    if (day === 6) {
      const monday = new Date(today);
      monday.setDate(monday.getDate() + 2);
      return monday.toISOString().split("T")[0];
    }
    return today.toISOString().split("T")[0];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const horarioSeleccionado = horarios.find((h) => h.id === formData.horario_id);
      if (!horarioSeleccionado) throw new Error("Selecciona un horario");
      if (!horarioSeleccionado.disponible) throw new Error("Este horario ya está ocupado");
      
      const res = await fetchApi("/api/citas", {
        method: "POST",
        body: JSON.stringify({ barbero_id: formData.barbero_id, servicio_id: formData.servicio_id, fecha: formData.fecha, hora_inicio: horarioSeleccionado.hora_inicio, hora_fin: horarioSeleccionado.hora_fin, notas: formData.notas || undefined }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Error al crear la cita");
      
      window.location.href = "/citas";
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSubmitting(false); }
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 64 }}><span style={{ color: "#71717A" }}>Cargando...</span></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", color: "#FAFAFA" }}>Nueva Cita</h1>
        <Link href="/citas" style={{ fontSize: 14, color: "#71717A" }}>Volver</Link>
      </div>
      
      {error && <div style={{ padding: 14, background: "#450A0A", color: "#FCA5A5", borderRadius: 8, fontSize: 14, border: "1px solid #EF4444" }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 8, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Barbero</label>
          <select required value={formData.barbero_id} onChange={(e) => setFormData({ ...formData, barbero_id: e.target.value, horario_id: "", fecha: "" })} style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid #3F3F46", borderRadius: 8, background: "#27272A", color: "#FAFAFA" }}>
            <option value="">Selecciona un barbero</option>
            {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre} - {b.especialidad}</option>)}
          </select>
        </div>
        
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 8, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Servicio</label>
          <select required value={formData.servicio_id} onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })} style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid #3F3F46", borderRadius: 8, background: "#27272A", color: "#FAFAFA" }}>
            <option value="">Selecciona un servicio</option>
            {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} - ${s.precio} ({s.duracion_minutos} min)</option>)}
          </select>
        </div>
        
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 8, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fecha (Lunes - Viernes)</label>
          <input 
            type="date" 
            required 
            value={formData.fecha} 
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value, horario_id: "" })} 
            min={getMinDate()} 
            style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid #3F3F46", borderRadius: 8, background: "#27272A", color: "#FAFAFA" }} 
          />
        </div>
        
        {formData.barbero_id && formData.fecha && (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 8, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Horario Disponible</label>
            
            {horarioError ? (
              <div style={{ padding: 14, background: "#450A0A", color: "#FCA5A5", borderRadius: 8, fontSize: 14, border: "1px solid #EF4444" }}>
                {horarioError}
              </div>
            ) : (
              <>
                {citasExistentes.length > 0 && (
                  <div style={{ marginBottom: 16, padding: 12, background: "#18181B", border: "1px solid #27272A", borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#D4AF37", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Citas ya reservadas en este día:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {citasExistentes.map((cita, i) => (
                        <span key={i} style={{ padding: "4px 8px", background: "#450A0A", color: "#FCA5A5", borderRadius: 4, fontSize: 12 }}>
                          {cita.hora_inicio.substring(0, 5)} - {cita.hora_fin.substring(0, 5)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {horarios.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      disabled={!h.disponible}
                      onClick={() => setFormData({ ...formData, horario_id: h.id })}
                      style={{
                        padding: "12px 8px",
                        fontSize: 13,
                        fontWeight: 500,
                        border: formData.horario_id === h.id ? "2px solid #D4AF37" : "1px solid #3F3F46",
                        borderRadius: 8,
                        background: h.disponible 
                          ? (formData.horario_id === h.id ? "#D4AF37" : "#27272A") 
                          : "#1a1a1a",
                        color: h.disponible 
                          ? (formData.horario_id === h.id ? "#18181B" : "#FAFAFA") 
                          : "#71717A",
                        cursor: h.disponible ? "pointer" : "not-allowed",
                        textDecoration: !h.disponible ? "line-through" : "none",
                        opacity: h.disponible ? 1 : 0.5,
                      }}
                    >
                      {h.hora_inicio.substring(0, 5)} - {h.hora_fin.substring(0, 5)}
                      {!h.disponible && <span style={{ display: "block", fontSize: 10 }}>Ocupado</span>}
                    </button>
                  ))}
                </div>
                
                {horarios.filter(h => h.disponible).length === 0 && (
                  <p style={{ fontSize: 14, color: "#EF4444", marginTop: 8 }}>
                    No hay horarios disponibles para este día
                  </p>
                )}
              </>
            )}
          </div>
        )}
        
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 8, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notas (opcional)</label>
          <textarea value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} rows={3} placeholder="Alguna preferencia..." style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid #3F3F46", borderRadius: 8, background: "#27272A", color: "#FAFAFA" }} />
        </div>
        
        <button 
          type="submit" 
          disabled={submitting || !formData.horario_id || !horarios.find(h => h.id === formData.horario_id)?.disponible} 
          style={{ 
            width: "100%", 
            padding: "14px", 
            fontSize: 14, 
            fontWeight: 600, 
            color: "#18181B", 
            background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)", 
            border: "none", 
            borderRadius: 8, 
            cursor: submitting || !formData.horario_id ? "not-allowed" : "pointer", 
            opacity: submitting || !formData.horario_id ? 0.6 : 1, 
            boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)" 
          }}
        >
          {submitting ? "Agendando..." : "Agendar Cita"}
        </button>
      </form>
    </div>
  );
}
