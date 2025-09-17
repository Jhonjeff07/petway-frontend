import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cambiarPassword } from "../services/api";
import "../App.css";

function CambiarPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuestionFields, setShowQuestionFields] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.password) {
      setError("La nueva contraseña es obligatoria");
      return false;
    }

    if (formData.password.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    if (showQuestionFields && !formData.securityAnswer.trim()) {
      setError("Debes proporcionar una respuesta para la pregunta de seguridad");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const updateData = { password: formData.password };

      if (showQuestionFields && formData.securityQuestion && formData.securityAnswer) {
        updateData.preguntaSecreta = formData.securityQuestion;
        updateData.respuestaSecreta = formData.securityAnswer;
      }

      await cambiarPassword(updateData);
      setSuccess("✅ Datos actualizados correctamente. Redirigiendo...");

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      const errorMsg = error.response?.data?.msg || "Error al actualizar los datos";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <h1 className="form-page-title">🔒 Cambiar Contraseña y Pregunta de Seguridad</h1>

      {error && <div className="error-message"><strong>Error:</strong> {error}</div>}
      {success && <div className="success-message"><strong>Éxito:</strong> {success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">Nueva contraseña *</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Ingresa tu nueva contraseña (mínimo 8 caracteres)"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            minLength={8}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar nueva contraseña *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirma tu nueva contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            minLength={8}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={showQuestionFields}
              onChange={() => setShowQuestionFields(!showQuestionFields)}
              disabled={loading}
            />
            ¿Deseas cambiar tu pregunta de seguridad?
          </label>
        </div>

        {showQuestionFields && (
          <>
            <div className="form-group">
              <label htmlFor="securityQuestion">Nueva pregunta de seguridad</label>
              <select
                id="securityQuestion"
                name="securityQuestion"
                value={formData.securityQuestion}
                onChange={handleChange}
                disabled={loading}
                required={showQuestionFields}
              >
                <option value="">-- Selecciona una pregunta --</option>
                <option value="¿Cuál es el nombre de tu primera mascota?">¿Cuál es el nombre de tu primera mascota?</option>
                <option value="¿En qué ciudad naciste?">¿En qué ciudad naciste?</option>
                <option value="¿Cuál es el nombre de tu madre?">¿Cuál es el nombre de tu madre?</option>
                <option value="¿Cuál es tu comida favorita?">¿Cuál es tu comida favorita?</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="securityAnswer">Nueva respuesta de seguridad *</label>
              <input
                type="text"
                id="securityAnswer"
                name="securityAnswer"
                placeholder="Ingresa la nueva respuesta"
                value={formData.securityAnswer}
                onChange={handleChange}
                disabled={loading}
                required={showQuestionFields}
              />
              <small>Se almacenará de forma segura</small>
            </div>
          </>
        )}

        <div className="form-buttons">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "🔄 Guardando..." : "💾 Guardar cambios"}
          </button>
          <button type="button" className="cancel-button" onClick={() => navigate("/")} disabled={loading}>
            ↩️ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CambiarPassword;
