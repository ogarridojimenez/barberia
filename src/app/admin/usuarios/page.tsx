"use client";

import { useEffect, useState, FormEvent } from "react";
import { fetchApi } from "@/lib/auth/client";
import { Modal, ModalFooter, Button, Input, Select, Pagination, TableWrapper, EmptyState, EmptyUsersIcon, PasswordStrength } from "@/components/ui";

interface Usuario {
  id: string;
  email: string;
  user_role: string;
  created_at: string;
  nombre: string | null;
  foto_url: string | null;
  telefono: string | null;
  especialidad: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const roleOptions = [
  { value: "cliente", label: "Cliente" },
  { value: "barbero", label: "Barbero" },
  { value: "admin", label: "Admin" },
];

const roleColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: "rgba(167, 139, 250, 0.1)", text: "#A78BFA" },
  barbero: { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" },
  cliente: { bg: "rgba(96, 165, 250, 0.1)", text: "#60A5FA" },
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [mensaje, setMensaje] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal de cambio de rol
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [newRole, setNewRole] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal de creación de usuario
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newApellidos, setNewApellidos] = useState("");
  const [newTelefono, setNewTelefono] = useState("");
  const [newUserRole, setNewUserRole] = useState("cliente");

  useEffect(() => {
    fetchUsuarios();
  }, [page, search, filterRole]);

  async function fetchUsuarios() {
    try {
      let url = `/api/admin/usuarios?page=${page}&limit=20`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (filterRole) url += `&role=${filterRole}`;

      const res = await fetchApi(url);
      if (!res.ok) throw new Error("Error al cargar");

      const data = await res.json();
      setUsuarios(data.usuarios || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleFilterRole(value: string) {
    setFilterRole(value);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Cambio de rol
  function openRoleModal(user: Usuario) {
    setSelectedUser(user);
    setNewRole(user.user_role);
    setShowRoleModal(true);
  }

  async function handleChangeRole() {
    if (!selectedUser || !newRole) return;

    setSavingRole(true);
    try {
      const res = await fetchApi(`/api/admin/usuarios/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify({ user_role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ type: "success", text: "Rol actualizado correctamente" });
        setShowRoleModal(false);
        fetchUsuarios();
      } else {
        setMensaje({ type: "error", text: data.message || data.error || "Error al actualizar rol" });
      }
    } catch (err) {
      setMensaje({ type: "error", text: "Error de conexión" });
    } finally {
      setSavingRole(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  }

  // Eliminación de usuario
  function openDeleteModal(user: Usuario) {
    setUserToDelete(user);
    setShowDeleteModal(true);
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      const res = await fetchApi(`/api/admin/usuarios/${userToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ type: "success", text: "Usuario eliminado correctamente" });
        setShowDeleteModal(false);
        fetchUsuarios();
      } else {
        setMensaje({ type: "error", text: data.message || data.error || "Error al eliminar usuario" });
      }
    } catch (err) {
      setMensaje({ type: "error", text: "Error de conexión" });
    } finally {
      setDeleting(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  }

  // Creación de usuario
  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();

    if (!newEmail || !newPassword) {
      setMensaje({ type: "error", text: "Email y contraseña son requeridos" });
      return;
    }

    if (newPassword.length < 8) {
      setMensaje({ type: "error", text: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }

    setCreating(true);
    try {
      const res = await fetchApi("/api/admin/usuarios/create", {
        method: "POST",
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          nombre: newNombre || undefined,
          apellidos: newApellidos || undefined,
          telefono: newTelefono || undefined,
          user_role: newUserRole,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ type: "success", text: "Usuario creado correctamente" });
        setShowCreateModal(false);
        setNewEmail("");
        setNewPassword("");
        setNewNombre("");
        setNewApellidos("");
        setNewTelefono("");
        setNewUserRole("cliente");
        fetchUsuarios();
      } else {
        setMensaje({ type: "error", text: data.message || data.error || "Error al crear usuario" });
      }
    } catch (err) {
      setMensaje({ type: "error", text: "Error de conexión" });
    } finally {
      setCreating(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <span style={{ color: "#71717A" }}>Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 8, color: "#FAFAFA" }}>
            Gestión de Usuarios
          </h1>
          <p style={{ color: "#71717A", fontSize: 15 }}>
            Administra los usuarios del sistema
            {pagination && ` (${pagination.totalItems} total)`}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Nuevo Usuario
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

      {/* Filtros */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          padding: 20,
          background: "#18181B",
          border: "1px solid #27272A",
          borderRadius: 12,
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#A1A1AA", marginBottom: 6, fontWeight: 500 }}>
            Buscar por email
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar..."
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 14,
              border: "1px solid #3F3F46",
              borderRadius: 8,
              background: "#27272A",
              color: "#FAFAFA",
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#A1A1AA", marginBottom: 6, fontWeight: 500 }}>
            Filtrar por rol
          </label>
          <select
            value={filterRole}
            onChange={(e) => handleFilterRole(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 14,
              border: "1px solid #3F3F46",
              borderRadius: 8,
              background: "#27272A",
              color: "#FAFAFA",
              outline: "none",
            }}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="barbero">Barbero</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 12, overflow: "hidden" }}>
        <TableWrapper>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #27272A", background: "#27272A" }}>
                {["Usuario", "Email", "Rol", "Registrado", "Acciones"].map((h) => (
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
              {usuarios.map((user) => {
                const roleColor = roleColors[user.user_role] || roleColors.cliente;
                const displayInitial = (user.nombre || user.email).charAt(0).toUpperCase();
                return (
                  <tr key={user.id} style={{ borderBottom: "1px solid #27272A" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {user.foto_url ? (
                          <img
                            src={user.foto_url}
                            alt={user.nombre || user.email}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: roleColor.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 600,
                              color: roleColor.text,
                            }}
                          >
                            {displayInitial}
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: "#FAFAFA" }}>
                            {user.nombre || "Sin nombre"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ fontSize: 14, color: "#A1A1AA" }}>{user.email}</span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: roleColor.bg,
                          color: roleColor.text,
                        }}
                      >
                        {user.user_role === "admin" ? "Admin" : user.user_role === "barbero" ? "Barbero" : "Cliente"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontSize: 14, color: "#71717A" }}>
                      {new Date(user.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => openRoleModal(user)}
                          aria-label={`Cambiar rol de ${user.email}`}
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
                          Rol
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          aria-label={`Eliminar ${user.email}`}
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
                );
              })}
            </tbody>
          </table>
        </TableWrapper>

        {usuarios.length === 0 && (
          <EmptyState
            icon={<EmptyUsersIcon />}
            title="No hay usuarios"
            description="No se encontraron usuarios con los filtros seleccionados"
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

      {/* Modal de cambio de rol */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Cambiar Rol">
        {selectedUser && (
          <>
            <p style={{ color: "#A1A1AA", marginBottom: 16 }}>
              Cambiar rol de <strong style={{ color: "#FAFAFA" }}>{selectedUser.email}</strong>
            </p>
            <Select
              label="Nuevo Rol"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={roleOptions}
            />
            <ModalFooter>
              <Button variant="ghost" onClick={() => setShowRoleModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleChangeRole} loading={savingRole}>
                Guardar
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmar Eliminación">
        {userToDelete && (
          <>
            <p style={{ color: "#A1A1AA", marginBottom: 16 }}>
              ¿Estás seguro de que deseas eliminar al usuario{" "}
              <strong style={{ color: "#FAFAFA" }}>{userToDelete.email}</strong>?
            </p>
            <p style={{ color: "#FCA5A5", fontSize: 14 }}>
              Esta acción no se puede deshacer.
            </p>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDeleteUser} loading={deleting}>
                Eliminar
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Modal de creación de usuario */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Crear Usuario" size="lg">
        <form onSubmit={handleCreateUser}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input
                label="Nombre"
                type="text"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                placeholder="Nombre"
              />
              <Input
                label="Apellidos"
                type="text"
                value={newApellidos}
                onChange={(e) => setNewApellidos(e.target.value)}
                placeholder="Apellidos"
              />
            </div>
            <Input
              label="Email *"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              required
            />
            <div>
              <Input
                label="Contraseña *"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
              />
              <PasswordStrength password={newPassword} />
            </div>
            <Input
              label="Teléfono"
              type="tel"
              value={newTelefono}
              onChange={(e) => setNewTelefono(e.target.value)}
              placeholder="+1 234 567 8900"
            />
            <Select
              label="Rol *"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              options={roleOptions}
            />
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={creating}>
              Crear Usuario
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
