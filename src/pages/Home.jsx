import { useEffect, useState } from "react";
import { obtenerMascotas } from "../services/api";
import { Link } from "react-router-dom";
import "../App.css";

function Home() {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        setLoading(true);
        const res = await obtenerMascotas();
        setMascotas(res.data);
      } catch (error) {
        console.error("❌ Error al obtener mascotas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMascotas();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando mascotas...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <h1 className="home-title">🐾 Mascotas registradas</h1>

      <div className="mascotas-container">
        {mascotas.length === 0 ? (
          <p>No hay mascotas registradas aún</p>
        ) : (
          mascotas.map((m) => (
            <Link
              key={m._id}
              to={`/mascota/${m._id}`}
              className="mascota-card"
            >
              {m.fotoUrl && (
                <img
                  src={
                    m.fotoUrl.startsWith("http")
                      ? m.fotoUrl.replace("http://localhost:4000", import.meta.env.VITE_API_URL || "https://petway-backend.onrender.com")
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
          ))
        )}
      </div>
    </div>
  );
}

export default Home;