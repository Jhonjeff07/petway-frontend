import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registrarUsuario } from "../services/api";
import "../App.css";

function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    preguntaSecreta: "", // Añade este campo
    respuestaSecreta: ""  // Añade este campo
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await registrarUsuario(formData);
      alert("✅ Registro exitoso. Revisa tu correo para el código de verificación.");
      // Enviamos al usuario a la página de verificación con su email para facilitar el flujo
      navigate("/verificar-email", { state: { email: formData.email } });
    } catch (error) {
      alert("❌ Error al registrar: " + (error.response?.data?.msg || error || "Error desconocido"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <h1 className="form-page-title">📝 Registro</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select
          name="preguntaSecreta"
          value={formData.preguntaSecreta}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una pregunta de seguridad</option>
          <option value="¿Cuál es el nombre de tu primera mascota?">¿Cuál es el nombre de tu primera mascota?</option>
          <option value="¿En qué ciudad naciste?">¿En qué ciudad naciste?</option>
          <option value="¿Cuál es el nombre de tu madre?">¿Cuál es el nombre de tu madre?</option>
          <option value="¿Cuál es tu comida favorita?">¿Cuál es tu comida favorita?</option>
        </select>

        <input
          type="text"
          name="respuestaSecreta"
          placeholder="Tu respuesta secreta"
          value={formData.respuestaSecreta}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}

export default Registro;
