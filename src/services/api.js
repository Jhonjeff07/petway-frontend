import axios from "axios";

// 🔹 Configuración base de Axios
const api = axios.create({
  baseURL: "http://localhost:4000/api",
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

// 🔹 Obtener pregunta secreta
export const obtenerPreguntaSecreta = (email) =>
  api.post("/usuarios/obtener-pregunta", { email });

// 🔹 Verificar respuesta secreta
export const verificarRespuestaSecreta = (datos) =>
  api.post("/usuarios/verificar-respuesta", datos);

// 🔹 Restablecer contraseña
export const restablecerPassword = (datos) =>
  api.post("/usuarios/restablecer-password", datos);

// 🔹 Cambiar contraseña (desde perfil de usuario)
export const cambiarPassword = (datos) =>
  api.post("/usuarios/cambiar-password", datos);

// 🔹 Verificar contraseña (para debugging)
export const verificarContraseña = (datos) =>
  api.post("/usuarios/verificar-contraseña", datos);

// Obtener todas las mascotas
export const obtenerMascotas = () => api.get("/mascotas");

// Obtener una mascota por ID
export const obtenerMascotaPorId = (id) => api.get(`/mascotas/${id}`);

// Crear nueva mascota
export const crearMascota = (datos) => api.post("/mascotas", datos, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// 🔹 Cambiar estado de mascota
export const cambiarEstadoMascota = (id, nuevoEstado) =>
  api.patch(`/mascotas/${id}/estado`, { estado: nuevoEstado });

// Eliminar mascota
export const eliminarMascota = (id) => api.delete(`/mascotas/${id}`);

// Manejo de errores mejorado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "Error en la API";

    if (error.response) {
      errorMessage = error.response.data.msg || `Error ${error.response.status}`;
      console.error(`❌ ${errorMessage}`, error.response.data);
    } else if (error.request) {
      errorMessage = "No se recibió respuesta del servidor";
      console.error("❌ No response received:", error.request);
    } else {
      errorMessage = `Error de configuración: ${error.message}`;
      console.error("❌ Request setup error:", error.message);
    }

    return Promise.reject(errorMessage);
  }
);

export default api;