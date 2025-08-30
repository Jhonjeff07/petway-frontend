import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { restablecerPassword } from "../services/api";
import "../App.css";

function RestablecerPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setMensaje("Las contraseñas no coinciden");
    }

    if (password.length < 8) {
      return setMensaje("La contraseña debe tener al menos 8 caracteres");
    }

    setIsLoading(true);

    try {
      // 🔥 CORRECCIÓN: Enviar como objeto
      const res = await restablecerPassword({
        token: token,
        nuevaPassword: password
      });
      setMensaje(res.data.msg || "Contraseña restablecida con éxito");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.msg || error.message || "Error al restablecer la contraseña";
      setMensaje(errorMsg);
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
          placeholder="Nueva contraseña (mínimo 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar"}
        </button>
      </form>
      {mensaje && (
        <p className={mensaje.includes("éxito") || mensaje.includes("correctamente") ? "success" : "error"}>
          {mensaje}
        </p>
      )}
    </div>
  );
}

export default RestablecerPassword;