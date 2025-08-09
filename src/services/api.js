import axios from "axios";

// 🔹 Configuración base de Axios
const api = axios.create({
  baseURL: "http://localhost:4000/api", // URL del backend
});

// ======================
// USUARIOS
// ======================

// Registrar usuario
export const registrarUsuario = (datos) => api.post("/usuarios", datos);

// Iniciar sesión
export const loginUsuario = (datos) => api.post("/usuarios/login", datos);

// ======================
// MASCOTAS
// ======================

// Obtener todas las mascotas
export const obtenerMascotas = () => api.get("/mascotas");

// Obtener una mascota por ID
export const obtenerMascotaPorId = (id) => api.get(`/mascotas/${id}`);

// Crear nueva mascota (con token e imagen)
export const crearMascota = (datos, token) =>
  api.post("/mascotas", datos, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Ahora el token se envía con Bearer
      "Content-Type": "multipart/form-data",
    },
  });

// Actualizar mascota
export const actualizarMascota = (id, datos, token) =>
  api.put(`/mascotas/${id}`, datos, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Se envía con Bearer
    },
  });

// Eliminar mascota
export const eliminarMascota = (id, token) =>
  api.delete(`/mascotas/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Se envía con Bearer
    },
  });

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Error en la API:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
