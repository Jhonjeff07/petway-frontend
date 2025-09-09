import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearMascota } from "../services/api";
import "../App.css";

function Publicar() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    raza: "",
    edad: "",
    descripcion: "",
    ciudad: "",
    telefono: "", // Cambiado de numeroContacto a telefono
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

      // Añadir todos los campos excepto 'foto' que se maneja por separado
      datos.append('nombre', formData.nombre);
      datos.append('tipo', formData.tipo);
      datos.append('raza', formData.raza);
      datos.append('edad', formData.edad);
      datos.append('descripcion', formData.descripcion);
      datos.append('ciudad', formData.ciudad);
      datos.append('telefono', formData.telefono); // Cambiado a 'telefono'

      // Añadir la foto si existe
      if (formData.foto) {
        datos.append('foto', formData.foto);
      }

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
    <div className="form-page-container">
      <h1 className="form-page-title">📢 Publicar Mascota</h1>
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
        {/* Campo actualizado a telefono */}
        <input
          type="tel"
          name="telefono"
          placeholder="Número de contacto (opcional)"
          value={formData.telefono}
          onChange={handleChange}
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