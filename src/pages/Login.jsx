import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../services/api";

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

      // Actualizar estado global
      setIsAuth(true);

      alert("✅ Inicio de sesión exitoso");
      navigate("/");
    } catch (error) {
      // Manejar diferentes tipos de errores
      const errorMsg = error.response?.data?.msg || "Error en el servidor";
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <h1>🔐 Iniciar Sesión</h1>

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
        textAlign: "center", // Esto centra el contenido
        marginTop: "15px",
        width: "100%"
      }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Función en desarrollo");
          }}
          style={{
            color: "#0077b6",
            textDecoration: "underline",
            display: "inline-block" // Esto evita que ocupe todo el ancho
          }}
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </div>
  );
}

export default Login;