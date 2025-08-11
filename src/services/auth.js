// Obtener usuario actual desde localStorage
export const obtenerUsuarioActual = () => {
    const usuario = localStorage.getItem("usuario");
    return usuario ? JSON.parse(usuario) : null;
};

// Obtener ID del usuario actual desde token
export const obtenerIdUsuarioActual = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        // Decodificar el token manualmente
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(atob(base64));
        return decodedPayload.id;
    } catch (error) {
        console.error('❌ Error decodificando token:', error);
        return null;
    }
};

// Guardar usuario en localStorage al iniciar sesión
export const guardarUsuario = (usuario) => {
    localStorage.setItem("usuario", JSON.stringify(usuario));
};

// Eliminar usuario al cerrar sesión
export const eliminarUsuario = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token"); // 🔹 Asegurar eliminar token también
};