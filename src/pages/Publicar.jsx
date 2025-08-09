import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearMascota } from "../services/api";

function Publicar() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    raza: "",
    edad: "",
    descripcion: "",
    ciudad: "",
    foto: null,
  });

  // Actualizar valores del formulario
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Preparar datos para enviar (FormData)
      const datos = new FormData();
      Object.keys(formData).forEach((key) => {
        datos.append(key, formData[key]);
      });

      // Obtener token
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ Debes iniciar sesión para publicar");
        navigate("/login");
        return;
      }

      // Crear mascota
      await crearMascota(datos, token);

      alert("✅ Mascota publicada exitosamente");
      navigate("/");
    } catch (error) {
      console.error("❌ Error al publicar:", error.response?.data || error.message);
      alert(error.response?.data?.msg || "❌ Ocurrió un error al publicar la mascota");
    }
  };

  return (
    <div className="home-container">
      <h1>📢 Publicar Mascota</h1>
      <p>Completa el formulario para registrar una mascota perdida o encontrada.</p>

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
          type="text"
          name="tipo"
          placeholder="Tipo (perro, gato, etc.)"
          value={formData.tipo}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="raza"
          placeholder="Raza"
          value={formData.raza}
          onChange={handleChange}
        />
        <input
          type="number"
          name="edad"
          placeholder="Edad"
          value={formData.edad}
          onChange={handleChange}
        />
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
        />
        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          value={formData.ciudad}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="foto"
          accept="image/*"
          onChange={handleChange}
        />

        <button type="submit">Publicar</button>
      </form>
    </div>
  );
}

export default Publicar;
