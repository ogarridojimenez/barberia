"use client";

import { useEffect, useState, FormEvent } from "react";
import { fetchApi } from "@/lib/auth/client";
import { Button, Modal, ModalFooter, Input, TableWrapper, EmptyState, EmptyServiciosIcon, Pagination } from "@/components/ui";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  precio: number;
  activo: boolean;
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [page, setPage] = useState(1);
  const [mensaje, setMensaje] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal de crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracionMinutos, setDuracionMinutos] = useState(30);
  const [precio, setPrecio] = useState(0);

  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [servicioToDelete, setServicioToDelete] = useState<Servicio | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchServicios();
  }, [page]);

  async function fetchServicios() {
    try {
      const res = await fetchApi(`/api/admin/servicios?page=${page}&limit=20`);
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setServicios(data.servicios || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Crear/Editar
  function openCreateModal() {
    setEditingServicio(null);
    setNombre("");
    setDescripcion("");
    setDuracionMinutos(30);
    setPrecio(0);
    setShowModal(true);
  }

  function openEditModal(servicio: Servicio) {
    setEditingServicio(servicio);
    setNombre(servicio.nombre);
    setDescripcion(servicio.descripcion || "");
    setDuracionMinutos(servicio.duracion_minutos);
    setPrecio(Number(servicio.precio));
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingServicio ? `/api/admin/servicios/${editingServicio.id}` : "/api/admin/servicios";
      const method = editingServicio ? "PUT" : "POST";
      const res = await fetchApi(url, {
        method,
        body: JSON.stringify({ nombre, descripcion, duracion_minutos: duracionMinutos, precio }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ type: "success", text: editingServicio ? "Servicio actualizado correctamente" : "Servicio creado correctamente" });
        setShowModal(false);
        fetchServicios();
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
  async function handleToggleActivo(servicio: Servicio) {
    try {
      const res = await fetchApi(`/api/admin/servicios/${servicio.id}`, {
        method: "PUT",
        body: JSON.stringify({ activo: !servicio.activo }),
      });
      if (res.ok) {
        setMensaje({ type: "success", text: servicio.activo ? "Servicio desactivado" : "Servicio activado" });
        fetchServicios();
      }
    } catch (err) {
      setMensaje({ type: "error", text: "Error al actualizar" });
    } finally {
      setTimeout(() => setMensaje(null), 3000);
    }
  }

  // Eliminar
  function openDeleteModal(servicio: Servicio) {
    setServicioToDelete(servicio);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!servicioToDelete) return;
    setDeleting(true);
    try {
      const res = await fetchApi(`/api/admin/servicios/${servicioToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ type: "success", text: "Servicio eliminado correctamente" });
        setShowDeleteModal(false);
        setServicioToDelete(null);
        fetchServicios();
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
        <span style={{ color: "#71717A" }}>Cargando servicios...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8, color: "#FAFAFA" }}>
            Gestión de Servicios
          </h1>
          <p style={{ color: "#71717A", fontSize: 15 }}>
            Administra los servicios ofrecidos
            {pagination && ` (${pagination.totalItems} total)`}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          + Nuevo Servicio
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
                {["Nombre", "Descripción", "Duración", "Precio", "Estado", "Acciones"].map((h) => (
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
              {servicios.map((servicio) => (
                <tr key={servicio.id} style={{ borderBottom: "1px solid #27272A" }}>
                  <td style={{ padding: "16px", fontSize: 14, fontWeight: 500, color: "#FAFAFA" }}>
                    {servicio.nombre}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: 14,
                      color: "#A1A1AA",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {servicio.descripcion || "-"}
                  </td>
                  <td style={{ padding: "16px", fontSize: 14, color: "#FAFAFA" }}>
                    {servicio.duracion_minutos} min
                  </td>
                  <td style={{ padding: "16px", fontSize: 14, fontWeight: 500, color: "#D4AF37" }}>
                    ${Number(servicio.precio).toLocaleString()}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: servicio.activo ? "rgba(34, 197, 94, 0.1)" : "rgba(252, 165, 165, 0.1)",
                        color: servicio.activo ? "#22C55E" : "#FCA5A5",
                      }}
                    >
                      {servicio.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEditModal(servicio)}
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
                        onClick={() => handleToggleActivo(servicio)}
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
                        {servicio.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => openDeleteModal(servicio)}
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

        {servicios.length === 0 && (
          <EmptyState
            icon={<EmptyServiciosIcon />}
            title="No hay servicios"
            description="No se encontraron servicios registrados"
          />
        )}
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal de crear/editar */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingServicio ? "Editar Servicio" : "Nuevo Servicio"}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              label="Nombre *"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del servicio"
              required
            />
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#A1A1AA", marginBottom: 6, fontWeight: 500 }}>
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 14,
                  border: "1px solid #3F3F46",
                  borderRadius: 8,
                  background: "#27272A",
                  color: "#FAFAFA",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>
            <Input
              label="Duración (minutos) *"
              type="number"
              value={duracionMinutos}
              onChange={(e) => setDuracionMinutos(parseInt(e.target.value))}
              min={5}
              required
            />
            <Input
              label="Precio *"
              type="number"
              value={precio}
              onChange={(e) => setPrecio(parseFloat(e.target.value))}
              min={0}
              step="0.01"
              required
            />
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingServicio ? "Guardar" : "Crear Servicio"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmar Eliminación">
        {servicioToDelete && (
          <>
            <p style={{ color: "#A1A1AA", marginBottom: 16 }}>
              ¿Estás seguro de que deseas eliminar el servicio{" "}
              <strong style={{ color: "#FAFAFA" }}>{servicioToDelete.nombre}</strong>?
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
