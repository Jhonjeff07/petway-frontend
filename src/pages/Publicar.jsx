// src/pages/Publicar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearMascota } from "../services/api";
import "../App.css";
import MapSelector from "../components/MapSelector";

function Publicar() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    raza: "",
    edad: "",
    descripcion: "",
    ciudad: "",
    telefono: "",
    foto: null,
  });

  // Coordenadas seleccionadas por el usuario (obj: {lat, lng} o null)
  const [coords, setCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Actualizar valores del formulario
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones antes de enviar
    if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number" || !isFinite(coords.lat) || !isFinite(coords.lng)) {
      alert("❌ Debes seleccionar la ubicación de la mascota en el mapa (latitud y longitud).");
      return;
    }

    try {
      setSubmitting(true);

      // Preparar datos para enviar (FormData)
      const datos = new FormData();
      datos.append('nombre', formData.nombre);
      datos.append('tipo', formData.tipo);
      datos.append('raza', formData.raza);
      datos.append('edad', formData.edad);
      datos.append('descripcion', formData.descripcion);
      datos.append('ciudad', formData.ciudad);
      datos.append('telefono', formData.telefono || '');
      // lat y lng (como strings) — backend espera lat & lng
      datos.append('lat', String(coords.lat));
      datos.append('lng', String(coords.lng));

      // Añadir la foto si existe
      if (formData.foto) {
        datos.append('foto', formData.foto);
      }

      // El token lo maneja el interceptor de api (si existe en localStorage)
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ Debes iniciar sesión para publicar");
        navigate("/login");
        return;
      }

      // Llamada a la API
      await crearMascota(datos);

      alert("✅ Mascota publicada exitosamente");
      navigate("/");
    } catch (error) {
      // el interceptor puede devolver un string o un objeto Error
      const message =
        typeof error === "string"
          ? error
          : error?.response?.data?.msg || error?.message || "Ocurrió un error al publicar la mascota";
      console.error("❌ Error al publicar:", error);
      alert(`❌ ${message}`);
    } finally {
      setSubmitting(false);
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

        {/* MAP SELECTOR */}
        <div style={{ marginTop: 12 }}>
          <MapSelector
            initialLat={null}
            initialLng={null}
            onChange={(newCoords) => {
              // newCoords puede ser null (limpiar) o {lat, lng}
              setCoords(newCoords);
            }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Publicar;
