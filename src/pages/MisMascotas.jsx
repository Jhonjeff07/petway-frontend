import { useEffect, useState } from "react";
import { obtenerMascotas, eliminarMascota } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { obtenerIdUsuarioActual } from "../services/auth";
import "../App.css";

function MisMascotas() {
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [idUsuario, setIdUsuario] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMascotas = async () => {
            try {
                setLoading(true);
                const res = await obtenerMascotas();
                const usuarioId = obtenerIdUsuarioActual();
                setIdUsuario(usuarioId);

                if (usuarioId) {
                    // Filtrar solo las del usuario autenticado
                    const propias = res.data.filter(
                        (m) => m.usuario && m.usuario._id === usuarioId
                    );
                    setMascotas(propias);
                } else {
                    setMascotas([]);
                }
            } catch (error) {
                console.error("❌ Error al obtener mascotas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMascotas();
    }, []);

    const handleEliminar = async (id) => {
        if (window.confirm("⚠ ¿Seguro que deseas eliminar esta mascota?")) {
            try {
                await eliminarMascota(id);
                setMascotas(mascotas.filter((m) => m._id !== id));
                alert("✅ Mascota eliminada correctamente");
            } catch (error) {
                console.error("❌ Error eliminando mascota:", error);
                alert("❌ No se pudo eliminar la mascota");
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando tus mascotas...</p>
            </div>
        );
    }

    return (
        <div className="home-page">
            <h1 className="home-title">🐾 Mis Mascotas Publicadas</h1>

            {mascotas.length === 0 ? (
                <div className="no-resultados">
                    <p>No has publicado mascotas aún.</p>
                    <button
                        className="btn-limpiar"
                        onClick={() => navigate("/publicar")}
                    >
                        ➕ Publicar mascota
                    </button>
                </div>
            ) : (
                <div className="mascotas-container">
                    {mascotas.map((m) => (
                        <div key={m._id} className="mascota-card">
                            {m.fotoUrl && (
                                <img
                                    src={
                                        m.fotoUrl.startsWith("http")
                                            ? m.fotoUrl.replace(
                                                "http://localhost:4000",
                                                import.meta.env.VITE_API_URL ||
                                                "https://petway-backend.onrender.com"
                                            )
                                            : `${import.meta.env.VITE_API_URL ||
                                            "https://petway-backend.onrender.com"
                                            }${m.fotoUrl}`
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

                                <div className="acciones-mascota">
                                    <Link to={`/mascota/${m._id}`} className="btn-detalle">
                                        🔍 Ver detalle
                                    </Link>
                                    <button
                                        className="btn-eliminar"
                                        onClick={() => handleEliminar(m._id)}
                                    >
                                        🗑 Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MisMascotas;
