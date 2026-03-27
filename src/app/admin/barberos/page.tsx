"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { fetchApi } from "@/lib/auth/client";
import { Button, Modal, ModalFooter, Input, TableWrapper, EmptyState } from "@/components/ui";

interface Barbero {
  id: string;
  nombre: string;
  especialidad: string;
  telefono: string;
  foto_url: string;
  activo: boolean;
}

export default function BarberosPage() {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal de crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editingBarbero, setEditingBarbero] = useState<Barbero | null>(null);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [barberoToDelete, setBarberoToDelete] = useState<Barbero | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBarberos();
  }, []);

  async function fetchBarberos() {
    try {
      const res = await fetchApi("/api/admin/barberos");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setBarberos(data.barberos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Crear/Editar
  function openCreateModal() {
    setEditingBarbero(null);
    setNombre("");
    setEmail("");
    setPassword("");
    setEspecialidad("");
    setTelefono("");
    setFotoUrl("");
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowModal(true);
  }

  function openEditModal(barbero: Barbero) {
    setEditingBarbero(barbero);
    setNombre(barbero.nombre);
    setEspecialidad(barbero.especialidad || "");
    setTelefono(barbero.telefono || "");
    setFotoUrl(barbero.foto_url || "");
    setPreviewImage(barbero.foto_url || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowModal(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFotoUrl(base64String);
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  }

  function removeImage() {
    setFotoUrl("");
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingBarbero ? `/api/admin/barberos/${editingBarbero.id}` : "/api/admin/barberos";
      const method = editingBarbero ? "PUT" : "POST";
      
      // Al crear, incluir email y password. Al editar, no enviar credenciales
      const body = editingBarbero 
        ? { nombre, especialidad, telefono, foto_url: fotoUrl }
        : { nombre, email, password, especialidad, telefono, foto_url: fotoUrl };
      
      const res = await fetchApi(url, {
        method,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ type: "success", text: editingBarbero ? "Barbero actualizado correctamente" : "Barbero creado correctamente" });
        setShowModal(false);
        fetchBarberos();
      } else {
        setMensaje({ type: "error", text: data.message || data.error || "Error al guardar" });
      }
    } catch (err) {
      setMensaje({ type: "error", text: "Error de conexión" });
    } finally {
      setSaving(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  }

  // Toggle activo
  async function handleToggleActivo(barbero: Barbero) {
    try {
      const res = await fetchApi(`/api/admin/barberos/${barbero.id}`, {
        method: "PUT",
        body: JSON.stringify({ activo: !barbero.activo }),
      });
      if (res.ok) {
        setMensaje({ type: "success", text: barbero.activo ? "Barbero desactivado" : "Barbero activado" });
        fetchBarberos();
      }
    } catch (err) {
      setMensaje({ type: "error", text: "Error al actualizar" });
    } finally {
      setTimeout(() => setMensaje(null), 3000);
    }
  }

  // Eliminar
  function openDeleteModal(barbero: Barbero) {
    setBarberoToDelete(barbero);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!barberoToDelete) return;
    setDeleting(true);
    try {
      const res = await fetchApi(`/api/admin/barberos/${barberoToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ type: "success", text: "Barbero eliminado correctamente" });
        setShowDeleteModal(false);
        setBarberoToDelete(null);
        fetchBarberos();
      } else {
        setMensaje({ type: "error", text: data.message || data.error || "Error al eliminar" });
      }
    } catch (err) {
      setMensaje({ type: "error", text: "Error de conexión" });
    } finally {
      setDeleting(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <span style={{ color: "#71717A" }}>Cargando barberos...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8, color: "#FAFAFA" }}>
            Gestión de Barberos
          </h1>
          <p style={{ color: "#71717A", fontSize: 15 }}>
            Administra el personal de la barbería
          </p>
        </div>
        <Button onClick={openCreateModal}>
          + Nuevo Barbero
        </Button>
      </div>

      {/* Mensaje de feedback */}
      {mensaje && (
        <div
          role="alert"
          style={{
            padding: 14,
            borderRadius: 8,
            fontSize: 14,
            background: mensaje.type === "success" ? "#14532D" : "#450A0A",
            color: mensaje.type === "success" ? "#86EFAC" : "#FCA5A5",
            border: `1px solid ${mensaje.type === "success" ? "#22C55E" : "#EF4444"}`,
          }}
        >
          {mensaje.text}
        </div>
      )}

      {/* Tabla */}
      <div style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 12, overflow: "hidden" }}>
        <TableWrapper>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #27272A", background: "#27272A" }}>
                {["Foto", "Nombre", "Especialidad", "Teléfono", "Estado", "Acciones"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#A1A1AA",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {barberos.map((barbero) => (
                <tr key={barbero.id} style={{ borderBottom: "1px solid #27272A" }}>
                  <td style={{ padding: "12px 16px" }}>
                    {barbero.foto_url ? (
                      <img src={barbero.foto_url} alt={barbero.nombre} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#3F3F46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#A1A1AA" }}>
                        {barbero.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "16px", fontSize: 14, fontWeight: 500, color: "#FAFAFA" }}>
                    {barbero.nombre}
                  </td>
                  <td style={{ padding: "16px", fontSize: 14, color: "#A1A1AA" }}>
                    {barbero.especialidad || "-"}
                  </td>
                  <td style={{ padding: "16px", fontSize: 14, color: "#A1A1AA" }}>
                    {barbero.telefono || "-"}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: barbero.activo ? "rgba(34, 197, 94, 0.1)" : "rgba(252, 165, 165, 0.1)",
                        color: barbero.activo ? "#22C55E" : "#FCA5A5",
                      }}
                    >
                      {barbero.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEditModal(barbero)}
                        style={{
                          fontSize: 12,
                          color: "#D4AF37",
                          background: "rgba(212, 175, 55, 0.1)",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px 10px",
                          borderRadius: 6,
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActivo(barbero)}
                        style={{
                          fontSize: 12,
                          color: "#F59E0B",
                          background: "rgba(245, 158, 11, 0.1)",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px 10px",
                          borderRadius: 6,
                        }}
                      >
                        {barbero.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => openDeleteModal(barbero)}
                        style={{
                          fontSize: 12,
                          color: "#FCA5A5",
                          background: "rgba(252, 165, 165, 0.1)",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px 10px",
                          borderRadius: 6,
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>

        {barberos.length === 0 && (
          <EmptyState
            title="No hay barberos"
            description="No se encontraron barberos registrados"
          />
        )}
      </div>

      {/* Modal de crear/editar */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBarbero ? "Editar Barbero" : "Nuevo Barbero"} size="lg">
        <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              label="Nombre *"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del barbero"
              required
            />
            {!editingBarbero && (
              <>
                <Input
                  label="Email *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@barberia.com"
                  required
                />
                <Input
                  label="Contraseña *"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </>
            )}
            <Input
              label="Especialidad"
              type="text"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              placeholder="Ej: Corte clásico, barba"
            />
            <Input
              label="Teléfono"
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+1 234 567 8900"
            />
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#A1A1AA", marginBottom: 6, fontWeight: 500 }}>
                Foto
              </label>
              {previewImage ? (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <img src={previewImage} alt="Preview" style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover", border: "2px solid #3F3F46" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#FAFAFA", background: "#3F3F46", border: "none", borderRadius: 6, cursor: "pointer", textAlign: "center", display: "inline-block" }}>
                      Cambiar foto
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#FCA5A5", background: "rgba(252, 165, 165, 0.1)", border: "none", borderRadius: 6, cursor: "pointer" }}
                    >
                      Quitar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ border: "2px dashed #3F3F46", borderRadius: 8, padding: 24, textAlign: "center", background: "#27272A" }}>
                  <div style={{ marginBottom: 12 }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="1.5" style={{ margin: "0 auto" }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <label style={{ padding: "10px 20px", fontSize: 14, fontWeight: 500, color: "#18181B", background: "#D4AF37", border: "none", borderRadius: 6, cursor: "pointer", display: "inline-block" }}>
                    Seleccionar archivo
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                  <p style={{ fontSize: 12, color: "#71717A", marginTop: 12 }}>Formatos: JPG, PNG, GIF. Máx: 1MB</p>
                </div>
              )}
            </div>
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingBarbero ? "Guardar" : "Crear Barbero"}
            </Button>
          </ModalFooter>
          </form>
        </div>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmar Eliminación">
        {barberoToDelete && (
          <>
            <p style={{ color: "#A1A1AA", marginBottom: 16 }}>
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong style={{ color: "#FAFAFA" }}>{barberoToDelete.nombre}</strong>?
            </p>
            <p style={{ color: "#FCA5A5", fontSize: 14 }}>
              Esta acción no se puede deshacer.
            </p>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmDelete} loading={deleting}>
                Eliminar
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
