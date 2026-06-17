import axios from "axios";

// 🔹 Configuración base de Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://petway-backend.onrender.com";
const api = axios.create({
  baseURL: API_BASE_URL + "/api",
  withCredentials: true,
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Registrar usuario
export const registrarUsuario = (datos) => api.post("/usuarios", datos);

// Iniciar sesión
export const loginUsuario = (datos) => api.post("/usuarios/login", datos);

// Obtener pregunta secreta
export const obtenerPreguntaSecreta = (email) =>
  api.post("/usuarios/obtener-pregunta", { email });

// Verificar respuesta secreta
export const verificarRespuestaSecreta = (datos) =>
  api.post("/usuarios/verificar-respuesta", datos);

// Restablecer contraseña (olvidada)
export const restablecerPassword = (datos) =>
  api.post("/usuarios/restablecer-password", datos);

// Cambiar contraseña (usuario autenticado)
export const cambiarPassword = (datos) =>
  api.post("/usuarios/cambiar-password", datos);

// Verificar contraseña (debugging)
export const verificarContraseña = (datos) =>
  api.post("/usuarios/verificar-contraseña", datos);

// Obtener todas las mascotas
export const obtenerMascotas = () => api.get("/mascotas");

// Obtener mis mascotas (usuario autenticado)
export const obtenerMisMascotas = () => api.get("/mascotas/mias");

// Obtener una mascota por ID
export const obtenerMascotaPorId = (id) => api.get(`/mascotas/${id}`);

// Crear nueva mascota
export const crearMascota = (datos) => api.post("/mascotas", datos, {
  headers: { "Content-Type": "multipart/form-data" },
});

// Cambiar estado de mascota
export const cambiarEstadoMascota = (id, nuevoEstado) =>
  api.patch(`/mascotas/${id}/estado`, { estado: nuevoEstado });

// Eliminar mascota
export const eliminarMascota = (id) => api.delete(`/mascotas/${id}`);

// Buscar mascotas cercanas
export const obtenerMascotasCerca = (lat, lng, radius = 5000) =>
  api.get(`/mascotas/near?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}`);

// =====================
// COMENTARIOS
// =====================
export const obtenerComentarios = (mascotaId) =>
  api.get(`/mascotas/${mascotaId}/comentarios`);

export const crearComentario = (mascotaId, texto) =>
  api.post(`/mascotas/${mascotaId}/comentarios`, { texto });

export const eliminarComentario = (mascotaId, comentarioId) =>
  api.delete(`/mascotas/${mascotaId}/comentarios/${comentarioId}`);

// Manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "Error en la API";

    if (error.response) {
      errorMessage = error.response.data.msg || `Error ${error.response.status}`;
      console.error(`❌ ${errorMessage}`, error.response.data);

      const serverMsg = (error.response.data && error.response.data.msg) ? String(error.response.data.msg) : "";
      const status = error.response.status;

      if (
        serverMsg.toLowerCase().includes("token expir") ||
        serverMsg.toLowerCase().includes("token inválido") ||
        status === 401
      ) {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("auth");
          localStorage.removeItem("usuario");
          alert("Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente.");
          window.location.href = "/login";
        } catch (e) {
          console.warn("No se pudo limpiar sesión automáticamente:", e);
        }
      }
    } else if (error.request) {
      errorMessage = "No se recibió respuesta del servidor";
      console.error("❌ No response received:", error.request);
    } else {
      errorMessage = `Error de configuración: ${error.message}`;
      console.error("❌ Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Obtener usuario autenticado (perfil)
export const obtenerUsuarioActual = () => api.get("/usuarios/me");

// Actualizar perfil de usuario
export const actualizarUsuario = (datos) => api.put("/usuarios/me", datos, {
  headers: { "Content-Type": "multipart/form-data" }
});

// Cerrar sesión
export const logoutUsuario = () => api.post("/usuarios/logout");

// Verificación de email
export const verifyEmailCode = (data) => api.post('/usuarios/verify-email', data);
export const resendVerificationCode = (email) => api.post('/usuarios/resend-verification', { email });

export default api;