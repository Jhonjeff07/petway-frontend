import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registrarUsuario } from "../services/api";

function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registrarUsuario(formData);
      alert("✅ Registro exitoso. Inicia sesión.");
      navigate("/login");
    } catch (error) {
      alert("❌ Error al registrar: " + (error.response?.data?.msg || "Error desconocido"));
      console.error(error);
    }
  };

  return (
    <div className="home-container">
      <h1>📝 Registro</h1>
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
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default Registro;
