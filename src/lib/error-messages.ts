/**
 * Sistema de mensajes de error unificado para la aplicación.
 * 
 * Los códigos de error están en inglés (para consistencia técnica).
 * Los mensajes están en español (para el usuario final).
 */

export const ERROR_MESSAGES: Record<string, string> = {
  // Autenticación
  MISSING_TOKEN: "Debes iniciar sesión para continuar",
  INVALID_TOKEN: "Tu sesión ha expirado, inicia sesión nuevamente",
  INVALID_CREDENTIALS: "Email o contraseña incorrectos",
  INVALID_CURRENT_PASSWORD: "La contraseña actual es incorrecta",
  FORBIDDEN: "No tienes permisos para realizar esta acción",
  RATE_LIMITED: "Demasiados intentos, espera unos minutos",

  // Validación
  INVALID_INPUT: "Los datos ingresados no son válidos",
  INVALID_EMAIL: "El formato del email es inválido",
  WEAK_PASSWORD: "La contraseña debe tener al menos 8 caracteres",

  // Citas
  HORARIO_NO_DISPONIBLE: "El horario seleccionado ya fue reservado por otro usuario",
  CITA_NOT_FOUND: "La cita no fue encontrada",
  CANCEL_TOO_LATE: "Solo puedes cancelar citas con al menos 2 horas de anticipación",
  INVALID_STATE: "No se puede realizar esta acción en el estado actual",

  // Usuarios
  USER_NOT_FOUND: "Usuario no encontrado",
  EMAIL_ALREADY_EXISTS: "Este email ya está registrado",

  // Base de datos
  DB_ERROR: "Error interno del servidor, intenta más tarde",
  INTERNAL_ERROR: "Error interno del servidor, intenta más tarde",

  // Barberos/Servicios
  BARBERO_NOT_FOUND: "Barbero no encontrado",
  SERVICIO_NOT_FOUND: "Servicio no encontrado",
};

/**
 * Obtiene el mensaje de error en español para un código de error.
 * Si no existe el código, retorna un mensaje genérico.
 */
export function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || "Ha ocurrido un error, intenta más tarde";
}

/**
 * Códigos de estado HTTP sugeridos para cada tipo de error
 */
export const ERROR_STATUS: Record<string, number> = {
  MISSING_TOKEN: 401,
  INVALID_TOKEN: 401,
  INVALID_CREDENTIALS: 401,
  FORBIDDEN: 403,
  RATE_LIMITED: 429,
  INVALID_INPUT: 400,
  INVALID_EMAIL: 400,
  WEAK_PASSWORD: 400,
  HORARIO_NO_DISPONIBLE: 409,
  CITA_NOT_FOUND: 404,
  CANCEL_TOO_LATE: 400,
  INVALID_STATE: 400,
  USER_NOT_FOUND: 404,
  EMAIL_ALREADY_EXISTS: 409,
  DB_ERROR: 500,
  INTERNAL_ERROR: 500,
  BARBERO_NOT_FOUND: 404,
  SERVICIO_NOT_FOUND: 404,
};
