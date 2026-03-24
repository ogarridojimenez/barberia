/**
 * Constantes compartidas para la aplicación
 */

// Mapeo de estados de cita a colores y etiquetas
export const estadoCitaMap: Record<string, { label: string; color: string; bg: string }> = {
  activa: { label: "Activa", color: "#22C55E", bg: "rgba(34, 197, 94, 0.1)" },
  cancelada: { label: "Cancelada", color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
};

// Mapeo de roles de usuario a colores y etiquetas
export const roleMap: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "#A78BFA", bg: "rgba(167, 139, 250, 0.1)" },
  barbero: { label: "Barbero", color: "#22C55E", bg: "rgba(34, 197, 94, 0.1)" },
  cliente: { label: "Cliente", color: "#60A5FA", bg: "rgba(96, 165, 250, 0.1)" },
};

// Horarios de atención
export const HORARIOS_MANANA = ["08:00:00", "08:30:00", "09:00:00", "09:30:00", "10:00:00", "10:30:00", "11:00:00", "11:30:00"];
export const HORARIOS_TARDE = ["14:00:00", "14:30:00", "15:00:00", "15:30:00", "16:00:00", "16:30:00", "17:00:00", "17:30:00"];
export const TODOS_HORARIOS = [...HORARIOS_MANANA, ...HORARIOS_TARDE];

// Colores del tema
export const theme = {
  bg: "#1a1a1a",
  surface: "#18181B",
  border: "#27272A",
  text: "#FAFAFA",
  textMuted: "#71717A",
  gold: "#D4AF37",
  goldDark: "#B8860B",
};
