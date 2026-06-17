// src/pages/Publicar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearMascota } from "../services/api";
import "../App.css";
import MapSelector from "../components/MapSelector";

function Publicar() {
  const navigate = useNavigate();

  // Verificar si el usuario es premium
  const usuarioGuardado = localStorage.getItem("usuario");
  const esPremium = usuarioGuardado ? JSON.parse(usuarioGuardado).premium === true : false;

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

  const [coords, setCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [destacada, setDestacada] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number" || !isFinite(coords.lat) || !isFinite(coords.lng)) {
      alert("❌ Debes seleccionar la ubicación de la mascota en el mapa (latitud y longitud).");
      return;
    }

    try {
      setSubmitting(true);

      const datos = new FormData();
      datos.append('nombre', formData.nombre);
      datos.append('tipo', formData.tipo);
      datos.append('raza', formData.raza);
      datos.append('edad', formData.edad);
      datos.append('descripcion', formData.descripcion);
      datos.append('ciudad', formData.ciudad);
      datos.append('telefono', formData.telefono || '');
      datos.append('lat', String(coords.lat));
      datos.append('lng', String(coords.lng));
      datos.append('destacada', esPremium && destacada ? 'true' : 'false');

      if (formData.foto) {
        datos.append('foto', formData.foto);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ Debes iniciar sesión para publicar");
        navigate("/login");
        return;
      }

      await crearMascota(datos);
      alert("✅ Mascota publicada exitosamente");
      navigate("/");
    } catch (error) {
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

        {/* ✅ OPCIÓN DESTACADA — solo para premium */}
        {esPremium && (
          <div style={{
            background: "#fff8e1",
            border: "1px solid #ffd54f",
            borderRadius: 8,
            padding: 12,
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>
            <input
              type="checkbox"
              id="destacada"
              checked={destacada}
              onChange={(e) => setDestacada(e.target.checked)}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <label htmlFor="destacada" style={{ cursor: "pointer", fontWeight: "bold", color: "#795548" }}>
              ⭐ Publicación Destacada — aparece primero en el listado
            </label>
          </div>
        )}

        {/* MAP SELECTOR */}
        <div style={{ marginTop: 12 }}>
          <MapSelector
            initialLat={null}
            initialLng={null}
            onChange={(newCoords) => {
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