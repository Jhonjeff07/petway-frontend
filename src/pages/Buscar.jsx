import { useEffect, useState } from "react";
import { obtenerMascotas } from "../services/api";
import { Link } from "react-router-dom";
import "../App.css";

function Buscar() {
  const [mascotas, setMascotas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        setLoading(true);
        const res = await obtenerMascotas();
        setMascotas(res.data);
      } catch (error) {
        console.error("Error al obtener mascotas:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarMascotas();
  }, []);

  const mascotasFiltradas = mascotas.filter((m) => {
    const searchString = `${m.nombre} ${m.tipo} ${m.ciudad} ${m.estado}`.toLowerCase();
    return searchString.includes(filtro.toLowerCase());
  });

  return (
    <div className="buscar-page">
      <h1 className="home-title">🔎 Buscar Mascotas</h1>

      <div className="intro-message">
        <p>Aquí podrás ver y buscar todas las mascotas registradas en la plataforma.</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por nombre, tipo, ciudad o estado..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-buscar"
        />
        <span className="search-icon">🔍</span>
      </div>

      <h2 className="home-title">🐾 Mascotas Registradas</h2>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando mascotas...</p>
        </div>
      ) : mascotasFiltradas.length > 0 ? (
        <div className="mascotas-container">
          {mascotasFiltradas.map((m) => (
            <Link
              key={m._id}
              to={`/mascota/${m._id}`}
              className="mascota-card"
            >
              {m.fotoUrl && (
                <img
                  src={
                    m.fotoUrl.startsWith("http")
                      ? m.fotoUrl
                      : `${import.meta.env.VITE_API_URL || "https://petway-backend.onrender.com"}${m.fotoUrl}`
                  }
                  alt={m.nombre}
                  className="mascota-img"
                  onError={(e) => {
                    console.log("Error cargando imagen:", e.target.src);
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
                  onLoad={() => console.log("Imagen cargada correctamente")}
                />
              )}
              <div className="mascota-info">
                <h3>{m.nombre}</h3>
                <p>
                  <strong>{m.tipo}</strong> - {m.ciudad}
                </p>
                <p className="mascota-estado">
                  {m.estado === "encontrado" ? (
                    <span className="estado-encontrado">✅ Encontrado</span>
                  ) : (
                    <span className="estado-perdido">❌ Perdido</span>
                  )}
                </p>
                <p className="mascota-fecha">
                  Publicado: {new Date(m.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="no-resultados">
          <p>No se encontraron mascotas con ese criterio.</p>
          {filtro && (
            <button
              className="btn-limpiar"
              onClick={() => setFiltro("")}
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Buscar;