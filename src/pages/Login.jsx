import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUsuario } from "../services/api";
import { guardarUsuario } from "../services/auth";
import "../App.css";

function Login({ setIsAuth }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Función para validar formato de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar formato de email
    if (!isValidEmail(formData.email)) {
      setError("❌ Por favor ingresa un correo electrónico válido");
      return;
    }

    // Validar que la contraseña no esté vacía
    if (!formData.password.trim()) {
      setError("❌ La contraseña es obligatoria");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUsuario(formData);

      // Guardar datos en localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("auth", "true");

      // 🆕 GUARDAR USUARIO EN LOCALSTORAGE
      guardarUsuario(res.data.usuario);

      // Actualizar estado global
      setIsAuth(true);

      // Si el usuario no está verificado, redirigimos a la pantalla de verificación
      if (res.data.usuario && res.data.usuario.verified === false) {
        alert("⚠ Tu correo no está verificado. Se te redirigirá a verificar tu email.");
        navigate("/verificar-email", { state: { email: formData.email } });
        return;
      }

      alert("✅ Inicio de sesión exitoso");
      navigate("/");
    } catch (err) {
      // Manejar diferentes tipos de errores
      const errorMsg = err.response?.data?.msg || err || "Error en el servidor";
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <h1 className="form-page-title">🔐 Iniciar Sesión</h1>

      {/* Mostrar mensaje de error */}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className={error.includes("correo") ? "input-error" : ""}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          className={error.includes("contraseña") ? "input-error" : ""}
        />
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>
      </form>

      {/* Enlace centrado para recuperar contraseña */}
      <div style={{
        textAlign: "center",
        marginTop: "15px",
        width: "100%"
      }}>
        <Link
          to="/recuperar-password"
          style={{
            color: "#0077b6",
            textDecoration: "underline",
            display: "inline-block"
          }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  );
}

export default Login;
