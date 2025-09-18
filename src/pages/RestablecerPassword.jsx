import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { restablecerPassword } from "../services/api";
import "../App.css";

function RestablecerPassword() {
  const { token } = useParams(); // ✅ ahora usamos el token
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nuevaPassword: "",
    confirmPassword: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (formData.nuevaPassword !== formData.confirmPassword) {
      return setMensaje("❌ Las contraseñas no coinciden");
    }

    if (formData.nuevaPassword.length < 8) {
      return setMensaje("❌ La contraseña debe tener al menos 8 caracteres");
    }

    setIsLoading(true);

    try {
      const res = await restablecerPassword({
        token,
        nuevaPassword: formData.nuevaPassword
      });

      setMensaje(res.data?.msg || "✅ Contraseña restablecida con éxito");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.msg || error.message || "Error al restablecer la contraseña";
      setMensaje(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Restablecer Contraseña</h2>
      <form onSubmit={manejarSubmit}>
        <input
          type="password"
          name="nuevaPassword"
          placeholder="Nueva contraseña (mínimo 8 caracteres)"
          value={formData.nuevaPassword}
          onChange={handleChange}
          required
          minLength={8}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={8}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar"}
        </button>
      </form>
      {mensaje && (
        <p className={mensaje.includes("✅") ? "success" : "error"}>{mensaje}</p>
      )}
    </div>
  );
}

export default RestablecerPassword;
