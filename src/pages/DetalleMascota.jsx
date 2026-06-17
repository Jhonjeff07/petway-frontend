// src/pages/DetalleMascota.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { obtenerMascotaPorId, cambiarEstadoMascota, eliminarMascota } from "../services/api";
import { obtenerIdUsuarioActual } from "../services/auth";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchMascota = async () => {
            try {
                setLoading(true);
                const res = await obtenerMascotaPorId(id);
                setMascota(res.data);
                const usuarioId = obtenerIdUsuarioActual();
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

    const buildImageSrc = (fotoUrl) => {
        const API = import.meta.env.VITE_API_URL || "https://petway-backend.onrender.com";
        if (!fotoUrl) return "/placeholder.jpg";
        return fotoUrl.startsWith("http") ? fotoUrl : `${API}${fotoUrl}`;
    };

    const actualizarEstado = async () => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem("token");
            if (!token) { alert("⚠ Debes iniciar sesión para cambiar el estado"); return; }
            if (!idUsuarioActual || !mascota?.usuario || idUsuarioActual !== mascota.usuario._id) {
                alert("⚠ Solo el dueño de la mascota puede cambiar su estado"); return;
            }
            const nuevoEstado = mascota.estado === "perdido" ? "encontrado" : "perdido";
            await cambiarEstadoMascota(mascota._id, nuevoEstado);
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
        if (!window.confirm("⚠ ¿Seguro que deseas eliminar esta mascota?")) return;
        try {
            setActionLoading(true);
            const token = localStorage.getItem("token");
            if (!token) { alert("⚠ Debes iniciar sesión para eliminar"); return; }
            if (!idUsuarioActual || !mascota?.usuario || idUsuarioActual !== mascota.usuario._id) {
                alert("⚠ Solo el dueño puede eliminar esta mascota"); return;
            }
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

    const abrirWhatsApp = () => {
        if (!mascota?.telefono) return;
        const numero = mascota.telefono.replace(/\D/g, '');
        const mensaje = encodeURIComponent(
            `Hola, vi tu publicación en PetWay sobre "${mascota.nombre}" (${mascota.tipo} - ${mascota.ciudad}). ¿Podemos hablar?`
        );
        window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
    };

    const coords = mascota?.ubicacion?.coordinates;
    const hasLocation = Array.isArray(coords) && coords.length >= 2;
    const lat = hasLocation ? Number(coords[1]) : null;
    const lng = hasLocation ? Number(coords[0]) : null;
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
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    if (loading) return <div style={{ textAlign: "center", padding: 30 }}><p>Cargando mascota...</p></div>;
    if (!mascota) return <div style={{ textAlign: "center", padding: 30 }}><p>No se encontró la mascota.</p></div>;

    return (
        <div className="detalle-mascota-container" style={{ display: "flex", gap: 20, padding: 20, flexWrap: "wrap" }}>
            {/* Imagen */}
            {mascota.fotoUrl ? (
                <img
                    src={buildImageSrc(mascota.fotoUrl)}
                    alt={mascota.nombre}
                    className="detalle-mascota-img"
                    style={{ maxWidth: 380, width: "100%", borderRadius: 8, objectFit: "cover" }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }}
                />
            ) : (
                <img src="/placeholder.jpg" alt="placeholder" className="detalle-mascota-img" style={{ maxWidth: 380 }} />
            )}

            {/* Info */}
            <div className="detalle-mascota-info" style={{ flex: 1, minWidth: 320 }}>
                <h1 className="form-page-title">{mascota.nombre}</h1>

                <p><strong>Tipo:</strong> {mascota.tipo}</p>

                {/* CONTACTO */}
                {mascota.telefono ? (
                    <div style={{ marginBottom: 12 }}>
                        <p style={{ marginBottom: 8 }}><strong>Contacto:</strong></p>
                        <button
                            onClick={abrirWhatsApp}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 20px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: "#25D366",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 15
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 32 32" fill="white">
                                <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.83.74 5.49 2.04 7.8L.5 31.5l7.93-2.08A15.45 15.45 0 0016 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5zm0 28.3a12.76 12.76 0 01-6.5-1.78l-.47-.28-4.7 1.23 1.26-4.6-.3-.48A12.8 12.8 0 1116 28.8zm7.02-9.57c-.38-.19-2.26-1.12-2.61-1.24-.35-.13-.6-.19-.86.19-.25.38-.98 1.24-1.2 1.5-.22.25-.44.28-.82.09-.38-.19-1.6-.59-3.05-1.88-1.13-1-1.89-2.24-2.11-2.62-.22-.38-.02-.58.17-.77.17-.17.38-.44.57-.66.19-.22.25-.38.38-.63.13-.25.06-.47-.03-.66-.09-.19-.86-2.07-1.18-2.83-.31-.74-.63-.64-.86-.65h-.73c-.25 0-.66.09-1.01.47-.35.38-1.33 1.3-1.33 3.17s1.36 3.68 1.55 3.93c.19.25 2.68 4.09 6.49 5.74.91.39 1.62.63 2.17.8.91.29 1.74.25 2.4.15.73-.11 2.26-.92 2.58-1.81.32-.89.32-1.65.22-1.81-.09-.16-.35-.25-.73-.44z" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div style={{ marginBottom: 12 }}>
                        <p style={{ marginBottom: 8 }}>
                            <strong>Contacto:</strong>{" "}
                            <span style={{ color: "#666" }}>Inicia sesión para contactar al dueño</span>
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => navigate('/login')}
                                style={{
                                    padding: "8px 16px", borderRadius: 6,
                                    backgroundColor: "#0077b6", color: "#fff",
                                    border: "none", cursor: "pointer", fontWeight: "bold"
                                }}
                            >
                                Iniciar sesión
                            </button>
                            <button
                                onClick={() => navigate('/registro')}
                                style={{
                                    padding: "8px 16px", borderRadius: 6,
                                    backgroundColor: "#e9ecef",
                                    border: "none", cursor: "pointer"
                                }}
                            >
                                Registrarme
                            </button>
                        </div>
                    </div>
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

                {/* Mapa */}
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

                {/* Acciones del dueño */}
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {idUsuarioActual && mascota.usuario && idUsuarioActual === mascota.usuario._id && (
                        <>
                            <button
                                onClick={actualizarEstado}
                                disabled={actionLoading}
                                style={{
                                    backgroundColor: "#0077b6", color: "white",
                                    padding: "10px", border: "none", borderRadius: "5px",
                                    cursor: actionLoading ? "not-allowed" : "pointer", fontWeight: "bold"
                                }}
                            >
                                {actionLoading ? "Procesando..." : (mascota.estado === "perdido" ? "Marcar como encontrado" : "Marcar como perdido")}
                            </button>
                            <button
                                onClick={handleEliminar}
                                disabled={actionLoading}
                                style={{
                                    backgroundColor: "#e74c3c", color: "white",
                                    padding: "10px", border: "none", borderRadius: "5px",
                                    cursor: actionLoading ? "not-allowed" : "pointer", fontWeight: "bold"
                                }}
                            >
                                {actionLoading ? "Procesando..." : "🗑 Eliminar mascota"}
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            backgroundColor: "#6c757d", color: "white",
                            padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer"
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