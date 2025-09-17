// pages/MisMascotas.jsx
import { useEffect, useState } from "react";
import { obtenerMisMascotas } from "../services/api";
import { Link } from "react-router-dom";

function MisMascotas() {
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarMisMascotas = async () => {
            try {
                setLoading(true);
                const res = await obtenerMisMascotas();
                setMascotas(res.data);
            } catch (error) {
                console.error("❌ Error al obtener mis mascotas:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarMisMascotas();
    }, []);

    if (loading) {
        return <p style={{ textAlign: "center" }}>Cargando tus mascotas...</p>;
    }

    return (
        <div className="mis-mascotas-page">
            <h1 className="home-title">📋 Mis Mascotas</h1>

            {mascotas.length === 0 ? (
                <p style={{ textAlign: "center" }}>
                    Aún no has publicado ninguna mascota.
                    <Link to="/publicar" style={{ color: "blue" }}> ¡Publica una ahora!</Link>
                </p>
            ) : (
                <div className="mascotas-container">
                    {mascotas.map((m) => (
                        <Link key={m._id} to={`/mascota/${m._id}`} className="mascota-card">
                            {m.fotoUrl && (
                                <img
                                    src={m.fotoUrl}
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
            )}
        </div>
    );
}

export default MisMascotas;
