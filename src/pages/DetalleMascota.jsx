// src/pages/DetalleMascota.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { obtenerMascotaPorId, cambiarEstadoMascota, eliminarMascota } from "../services/api";
import { obtenerIdUsuarioActual } from "../services/auth";

// --- Leaflet imports (añadidos) ---
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para iconos de Leaflet en Vite (evita marcadores rotos)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

function DetalleMascota() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [mascota, setMascota] = useState(null);
    const [idUsuarioActual, setIdUsuarioActual] = useState(null);
    const [loading, setLoading] = useState(true); // carga inicial
    const [actionLoading, setActionLoading] = useState(false); // para acciones (cambiar estado, eliminar)

    useEffect(() => {
        const fetchMascota = async () => {
            try {
                setLoading(true);
                const res = await obtenerMascotaPorId(id);
                setMascota(res.data);

                const usuarioId = obtenerIdUsuarioActual(); // asumimos que devuelve el _id string o null
                setIdUsuarioActual(usuarioId);
            } catch (error) {
                console.error("❌ Error cargando mascota:", error);
                alert("❌ No se pudo cargar la mascota. Serás redirigido al inicio.");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchMascota();
    }, [id, navigate]);

    // Construir ruta de imagen (soporta Cloudinary o rutas relativas /uploads)
    const buildImageSrc = (fotoUrl) => {
        const API = import.meta.env.VITE_API_URL || "https://petway-backend.onrender.com";
        if (!fotoUrl) return "/placeholder.jpg";
        return fotoUrl.startsWith("http") ? fotoUrl : `${API}${fotoUrl}`;
    };

    const actualizarEstado = async () => {
        try {
            setActionLoading(true);

            const token = localStorage.getItem("token");
            if (!token) {
                alert("⚠ Debes iniciar sesión para cambiar el estado");
                return;
            }

            if (!idUsuarioActual || !mascota?.usuario || idUsuarioActual !== mascota.usuario._id) {
                alert("⚠ Solo el dueño de la mascota puede cambiar su estado");
                return;
            }

            const nuevoEstado = mascota.estado === "perdido" ? "encontrado" : "perdido";
            await cambiarEstadoMascota(mascota._id, nuevoEstado); // axios añade token desde interceptor
            setMascota(prev => ({ ...prev, estado: nuevoEstado }));
            alert("✅ Estado actualizado correctamente");
        } catch (error) {
            console.error("❌ Error actualizando estado:", error);
            alert(typeof error === "string" ? error : "❌ No se pudo actualizar el estado");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEliminar = async () => {
        if (!window.confirm("⚠ ¿Seguro que deseas eliminar esta mascota? Esta acción no se puede deshacer.")) return;

        try {
            setActionLoading(true);

            const token = localStorage.getItem("token");
            if (!token) {
                alert("⚠ Debes iniciar sesión para eliminar");
                return;
            }

            // Comprueba dueño (redundante pero seguro)
            if (!idUsuarioActual || !mascota?.usuario || idUsuarioActual !== mascota.usuario._id) {
                alert("⚠ Solo el dueño puede eliminar esta mascota");
                return;
            }

            // FIX: corregido typo _1d -> _id
            await eliminarMascota(mascota._id);
            alert("✅ Mascota eliminada correctamente");
            navigate("/");
        } catch (error) {
            console.error("❌ Error eliminando mascota:", error);
            alert(typeof error === "string" ? error : "❌ No se pudo eliminar la mascota");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCopiarTelefono = async () => {
        if (!mascota?.telefono) {
            alert("No hay teléfono para copiar");
            return;
        }
        try {
            await navigator.clipboard.writeText(mascota.telefono);
            alert("📋 Teléfono copiado al portapapeles");
        } catch {
            alert("⚠ No se pudo copiar automáticamente. Por favor, selecciona y copia manualmente.");
        }
    };

    // --- NUEVO: utilidades de coordenadas / mapa ---
    const coords = mascota?.ubicacion?.coordinates;
    const hasLocation = Array.isArray(coords) && coords.length >= 2;
    const lat = hasLocation ? Number(coords[1]) : null;
    const lng = hasLocation ? Number(coords[0]) : null;

    // Determinar si el usuario actual es el dueño (para mostrar nota de precisión)
    const isOwner = Boolean(idUsuarioActual && mascota?.usuario && idUsuarioActual === mascota.usuario._id);

    const handleCopiarCoords = async () => {
        if (!hasLocation) return alert("No hay coordenadas para copiar");
        try {
            await navigator.clipboard.writeText(`${lat},${lng}`);
            alert("📋 Coordenadas copiadas");
        } catch {
            alert("⚠ No se pudo copiar las coordenadas automáticamente.");
        }
    };

    const abrirEnGoogleMaps = () => {
        if (!hasLocation) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, "_blank");
    };

    // Detectar si el usuario está logueado (pero no necesariamente el dueño)
    const isLoggedIn = Boolean(localStorage.getItem("token") || idUsuarioActual);

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: 30 }}>
                <p>Cargando mascota...</p>
            </div>
        );
    }

    if (!mascota) {
        return (
            <div style={{ textAlign: "center", padding: 30 }}>
                <p>No se encontró la mascota.</p>
            </div>
        );
    }

    return (
        <div className="detalle-mascota-container" style={{ display: "flex", gap: 20, padding: 20, flexWrap: "wrap" }}>
            {/* Imagen */}
            {mascota.fotoUrl ? (
                <img
                    src={buildImageSrc(mascota.fotoUrl)}
                    alt={mascota.nombre}
                    className="detalle-mascota-img"
                    style={{ maxWidth: 380, width: "100%", borderRadius: 8, objectFit: "cover" }}
                    onError={(e) => {
                        console.log("Error cargando imagen:", e.target.src);
                        e.target.onerror = null;
                        e.target.src = "/placeholder.jpg";
                    }}
                />
            ) : (
                <img src="/placeholder.jpg" alt="placeholder" className="detalle-mascota-img" style={{ maxWidth: 380 }} />
            )}

            {/* Info y acciones */}
            <div className="detalle-mascota-info" style={{ flex: 1, minWidth: 320 }}>
                <h1 className="form-page-title">{mascota.nombre}</h1>

                <p><strong>Tipo:</strong> {mascota.tipo}</p>

                {mascota.telefono ? (
                    <p>
                        <strong>Teléfono de contacto:</strong>{" "}
                        <a
                            href={`tel:${mascota.telefono}`}
                            style={{ color: "#0077b6", textDecoration: "none", marginRight: 10 }}
                        >
                            {mascota.telefono}
                        </a>
                        <button
                            onClick={handleCopiarTelefono}
                            style={{
                                marginLeft: 6,
                                padding: "6px 10px",
                                borderRadius: 6,
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: "#e9ecef"
                            }}
                        >
                            Copiar
                        </button>
                    </p>
                ) : (
                    // Si no hay teléfono (probablemente fue ocultado por backend a usuarios anónimos)
                    <>
                        {!isLoggedIn ? (
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <p><strong>Teléfono de contacto:</strong> (Inicia sesión para ver el número)</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{ padding: "6px 10px", borderRadius: 6, backgroundColor: "#0077b6", color: "#fff", border: "none", cursor: "pointer" }}
                                >
                                    Iniciar sesión
                                </button>
                                <button
                                    onClick={() => navigate('/registro')}
                                    style={{ padding: "6px 10px", borderRadius: 6, backgroundColor: "#e9ecef", border: "none", cursor: "pointer" }}
                                >
                                    Registrarme
                                </button>
                            </div>
                        ) : (
                            <p><strong>Teléfono de contacto:</strong> No especificado</p>
                        )}
                    </>
                )}

                <p><strong>Raza:</strong> {mascota.raza || 'No especificado'}</p>
                <p><strong>Edad:</strong> {mascota.edad || 'No especificada'}</p>
                <p><strong>Ciudad:</strong> {mascota.ciudad}</p>

                <p>
                    <strong>Estado:</strong>{" "}
                    {mascota.estado === 'encontrado' ? (
                        <span className="estado-encontrado"> Encontrado</span>
                    ) : (
                        <span className="estado-perdido"> Perdido</span>
                    )}
                </p>

                <p><strong>Descripción:</strong> {mascota.descripcion}</p>
                <p><strong>Publicado:</strong> {new Date(mascota.createdAt).toLocaleDateString()}</p>
                <p><strong>Publicado por:</strong> {mascota.usuario?.nombre || 'Usuario desconocido'}</p>

                {/* Mapa (si existen coordenadas) */}
                <div style={{ marginTop: 12 }}>
                    <h3>Ubicación</h3>
                    {hasLocation ? (
                        <>
                            {!isOwner && (
                                <p style={{ fontStyle: "italic", color: "#666", marginTop: -8 }}>
                                    (La ubicación mostrada puede ser aproximada por razones de privacidad)
                                </p>
                            )}
                            <div style={{ height: 300, borderRadius: 8, overflow: "hidden", marginTop: 8 }}>
                                <MapContainer center={[lat, lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[lat, lng]}>
                                        <Popup>
                                            <div style={{ textAlign: "center" }}>
                                                <strong>{mascota.nombre}</strong>
                                                <div>{mascota.tipo} — {mascota.ciudad}</div>
                                                <div style={{ marginTop: 6 }}>
                                                    <small>Lat: {lat.toFixed(5)} · Lng: {lng.toFixed(5)}</small>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>

                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button
                                    onClick={abrirEnGoogleMaps}
                                    style={{ padding: "8px 12px", borderRadius: 6, backgroundColor: "#0077b6", color: "white", border: "none", cursor: "pointer" }}
                                >
                                    Abrir en Google Maps
                                </button>
                                <button
                                    onClick={handleCopiarCoords}
                                    style={{ padding: "8px 12px", borderRadius: 6, backgroundColor: "#e9ecef", border: "none", cursor: "pointer" }}
                                >
                                    Copiar coordenadas
                                </button>
                            </div>
                        </>
                    ) : (
                        <p>La ubicación no está disponible para esta mascota.</p>
                    )}
                </div>

                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {idUsuarioActual && mascota.usuario && idUsuarioActual === mascota.usuario._id && (
                        <>
                            <button
                                onClick={actualizarEstado}
                                disabled={actionLoading}
                                style={{
                                    backgroundColor: "#0077b6",
                                    color: "white",
                                    padding: "10px",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: actionLoading ? "not-allowed" : "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                {actionLoading ? "Procesando..." : (mascota.estado === "perdido" ? "Marcar como encontrado" : "Marcar como perdido")}
                            </button>

                            <button
                                onClick={handleEliminar}
                                disabled={actionLoading}
                                style={{
                                    backgroundColor: "#e74c3c",
                                    color: "white",
                                    padding: "10px",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: actionLoading ? "not-allowed" : "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                {actionLoading ? "Procesando..." : "🗑 Eliminar mascota"}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => navigate("/")}
                        style={{
                            backgroundColor: "#6c757d",
                            color: "white",
                            padding: "10px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}
                    >
                        ⬅ Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DetalleMascota;
