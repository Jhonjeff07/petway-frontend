import { useEffect, useState } from "react";
import { obtenerMascotas, obtenerMascotasCerca } from "../services/api";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "../App.css";
import "leaflet/dist/leaflet.css";

// 🔧 Fix para íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

function MoverMapa({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

function Buscar() {
  const [mascotas, setMascotas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [radius, setRadius] = useState(5000); // 🔹 Valor por defecto 5km

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

  const center = userLocation || [4.6097, -74.0817]; // Bogotá por defecto

  // 📍 Buscar mascotas cercanas
  const handleBuscarCerca = () => {
    if (!navigator.geolocation) {
      setErrorMsg("La geolocalización no está soportada por tu navegador.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation([lat, lng]);
        try {
          const res = await obtenerMascotasCerca(lat, lng, radius);
          setMascotas(res.data);
        } catch (error) {
          console.error("Error al buscar mascotas cerca:", error);
          setErrorMsg("Error al buscar mascotas cercanas.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setErrorMsg("No se pudo obtener tu ubicación. Permite el acceso a la ubicación.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="buscar-page">
      <h1 className="home-title">🔎 Buscar Mascotas</h1>

      <div className="intro-message">
        <p>Aquí podrás ver y buscar todas las mascotas registradas en la plataforma.</p>
      </div>

      {/* 🔹 Barra de búsqueda */}
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

      {/* 🔹 Selector de distancia + botón */}
      <div style={{ textAlign: "center", margin: "15px 0" }}>
        <label htmlFor="radius" style={{ marginRight: "10px", fontWeight: "500" }}>
          Distancia:
        </label>
        <select
          id="radius"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{
            padding: "6px 10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        >
          <option value={1000}>1 km</option>
          <option value={5000}>5 km</option>
          <option value={10000}>10 km</option>
          <option value={20000}>20 km</option>
        </select>

        <button onClick={handleBuscarCerca} className="btn-geolocalizar">
          📍 Buscar mascotas cerca de mí
        </button>

        {errorMsg && <p style={{ color: "red", marginTop: "10px" }}>{errorMsg}</p>}
      </div>

      {/* 🔹 Mapa */}
      {!loading && mascotasFiltradas.length > 0 && (
        <div style={{ height: "400px", width: "100%", margin: "20px 0", borderRadius: "10px", overflow: "hidden" }}>
          <MapContainer center={center} zoom={userLocation ? 13 : 6} style={{ height: "100%", width: "100%" }}>
            <MoverMapa center={center} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />

            {userLocation && (
              <Marker position={userLocation}>
                <Popup>📍 Tú estás aquí</Popup>
              </Marker>
            )}

            {mascotasFiltradas
              .filter((m) => m.ubicacion && m.ubicacion.coordinates)
              .map((m) => (
                <Marker
                  key={m._id}
                  position={[
                    m.ubicacion.coordinates[1], // lat
                    m.ubicacion.coordinates[0], // lng
                  ]}
                >
                  <Popup>
                    <div style={{ textAlign: "center" }}>
                      <h4>{m.nombre}</h4>
                      <p>{m.tipo} - {m.ciudad}</p>
                      <p>{m.estado === "encontrado" ? "✅ Encontrado" : "❌ Perdido"}</p>
                      <Link to={`/mascota/${m._id}`}>Ver más</Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      )}

      {/* 🔹 Listado de mascotas */}
      <h2 className="home-title">🐾 Mascotas Registradas</h2>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando mascotas...</p>
        </div>
      ) : mascotasFiltradas.length > 0 ? (
        <div className="mascotas-container">
          {mascotasFiltradas.map((m) => (
            <Link key={m._id} to={`/mascota/${m._id}`} className="mascota-card">
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
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
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
            <button className="btn-limpiar" onClick={() => setFiltro("")}>
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Buscar;
