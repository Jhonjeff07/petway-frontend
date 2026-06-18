// src/pages/DetalleMascota.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { obtenerMascotaPorId, cambiarEstadoMascota, eliminarMascota, obtenerComentarios, crearComentario, eliminarComentario } from "../services/api";
import { obtenerIdUsuarioActual } from "../services/auth";
import { QRCodeSVG } from 'qrcode.react';

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
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [comentarioLoading, setComentarioLoading] = useState(false);
    const [usuarioPremium, setUsuarioPremium] = useState(false);

    useEffect(() => {
        const fetchMascota = async () => {
            try {
                setLoading(true);
                const res = await obtenerMascotaPorId(id);
                setMascota(res.data);
                const usuarioId = obtenerIdUsuarioActual();
                setIdUsuarioActual(usuarioId);
                const resComentarios = await obtenerComentarios(id);
                setComentarios(resComentarios.data);
                const usuarioGuardado = localStorage.getItem("usuario");
                if (usuarioGuardado) {
                    const u = JSON.parse(usuarioGuardado);
                    setUsuarioPremium(u.premium === true);
                }
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
            alert(typeof error === "string" ? error : "❌ No se pudo eliminar la mascota");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEnviarComentario = async () => {
        if (!nuevoComentario.trim()) return;
        try {
            setComentarioLoading(true);
            const res = await crearComentario(id, nuevoComentario);
            setComentarios(prev => [res.data, ...prev]);
            setNuevoComentario("");
        } catch (error) {
            if (error?.response?.data?.needsPremium) {
                alert("⭐ Función Premium — actualiza tu plan para comentar");
            } else {
                alert(error?.response?.data?.msg || "❌ Error al enviar comentario");
            }
        } finally {
            setComentarioLoading(false);
        }
    };

    const handleEliminarComentario = async (comentarioId) => {
        if (!window.confirm("¿Eliminar este comentario?")) return;
        try {
            await eliminarComentario(id, comentarioId);
            setComentarios(prev => prev.filter(c => c._id !== comentarioId));
        } catch {
            alert("❌ No se pudo eliminar el comentario");
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

    const urlMascota = `https://petway-frontend.onrender.com/mascota/${id}`;
    const estadoTexto = mascota.estado === "perdido" ? "está perdido 🐾" : "fue encontrado 🎉";
    const estadoColor = mascota.estado === "perdido" ? "#e74c3c" : "#2ecc71";

    return (
        <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 16px" }}>

            {/* ✅ TÍTULO EMOTIVO */}
            <h1 style={{
                textAlign: "center",
                fontSize: "1.8rem",
                marginBottom: 20,
                color: estadoColor
            }}>
                {mascota.nombre} {estadoTexto}
            </h1>

            {/* ✅ TARJETA PRINCIPAL — imagen + QR izquierda, info derecha */}
            <div style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                padding: 24,
                marginBottom: 24
            }}>
                {/* Columna izquierda: imagen + QR */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flex: "0 0 auto" }}>
                    <img
                        src={buildImageSrc(mascota.fotoUrl)}
                        alt={mascota.nombre}
                        style={{
                            width: 220,
                            height: 220,
                            objectFit: "cover",
                            borderRadius: 12,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
                        }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }}
                    />
                    {/* QR */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        padding: 12,
                        background: "#f8f9fa",
                        borderRadius: 10,
                        border: "1px solid #eee"
                    }}>
                        <QRCodeSVG
                            value={urlMascota}
                            size={120}
                            bgColor="#f8f9fa"
                            fgColor="#023e8a"
                            level="H"
                        />
                        <p style={{ fontSize: 10, color: "#999", margin: 0, textAlign: "center" }}>
                            Escanea para ver en PetWay
                        </p>
                    </div>
                </div>

                {/* Columna derecha: info */}
                <div style={{ flex: 1, minWidth: 220 }}>
                    {/* Datos en tabla */}
                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                        <tbody>
                            {[
                                { label: "Tipo", value: mascota.tipo },
                                { label: "Raza", value: mascota.raza || "No especificado" },
                                { label: "Edad", value: mascota.edad || "No especificada" },
                                { label: "Ciudad", value: mascota.ciudad },
                                {
                                    label: "Estado", value: mascota.estado === "encontrado"
                                        ? <span style={{ color: "#2ecc71", fontWeight: "bold" }}>✅ Encontrado</span>
                                        : <span style={{ color: "#e74c3c", fontWeight: "bold" }}>❌ Perdido</span>
                                },
                                { label: "Descripción", value: mascota.descripcion },
                                { label: "Publicado", value: new Date(mascota.createdAt).toLocaleDateString() },
                                { label: "Publicado por", value: mascota.usuario?.nombre || "Usuario desconocido" },
                            ].map(({ label, value }) => (
                                <tr key={label} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "8px 12px 8px 0", fontWeight: "bold", color: "#023e8a", whiteSpace: "nowrap", width: 130 }}>
                                        {label}:
                                    </td>
                                    <td style={{ padding: "8px 0", color: "#333" }}>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Contacto */}
                    <div style={{ marginTop: 8 }}>
                        <strong style={{ color: "#023e8a" }}>Contacto:</strong>{" "}
                        {mascota.telefono ? (
                            <button
                                onClick={abrirWhatsApp}
                                style={{
                                    display: "inline-flex", alignItems: "center",
                                    padding: "6px 10px", borderRadius: 8,
                                    border: "none", cursor: "pointer",
                                    backgroundColor: "#25D366", verticalAlign: "middle",
                                    marginLeft: 8
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="white">
                                    <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.83.74 5.49 2.04 7.8L.5 31.5l7.93-2.08A15.45 15.45 0 0016 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5zm0 28.3a12.76 12.76 0 01-6.5-1.78l-.47-.28-4.7 1.23 1.26-4.6-.3-.48A12.8 12.8 0 1116 28.8zm7.02-9.57c-.38-.19-2.26-1.12-2.61-1.24-.35-.13-.6-.19-.86.19-.25.38-.98 1.24-1.2 1.5-.22.25-.44.28-.82.09-.38-.19-1.6-.59-3.05-1.88-1.13-1-1.89-2.24-2.11-2.62-.22-.38-.02-.58.17-.77.17-.17.38-.44.57-.66.19-.22.25-.38.38-.63.13-.25.06-.47-.03-.66-.09-.19-.86-2.07-1.18-2.83-.31-.74-.63-.64-.86-.65h-.73c-.25 0-.66.09-1.01.47-.35.38-1.33 1.3-1.33 3.17s1.36 3.68 1.55 3.93c.19.25 2.68 4.09 6.49 5.74.91.39 1.62.63 2.17.8.91.29 1.74.25 2.4.15.73-.11 2.26-.92 2.58-1.81.32-.89.32-1.65.22-1.81-.09-.16-.35-.25-.73-.44z" />
                                </svg>
                            </button>
                        ) : (
                            <span>
                                <span style={{ color: "#666", fontSize: 14 }}>Inicia sesión para contactar — </span>
                                <button onClick={() => navigate('/login')} style={{ padding: "4px 10px", borderRadius: 6, backgroundColor: "#0077b6", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 13, marginRight: 6 }}>
                                    Iniciar sesión
                                </button>
                                <button onClick={() => navigate('/registro')} style={{ padding: "4px 10px", borderRadius: 6, backgroundColor: "#e9ecef", border: "none", cursor: "pointer", fontSize: 13 }}>
                                    Registrarme
                                </button>
                            </span>
                        )}
                    </div>

                    {/* Acciones del dueño */}
                    {idUsuarioActual && mascota.usuario && idUsuarioActual === mascota.usuario._id && (
                        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                            <button onClick={actualizarEstado} disabled={actionLoading} style={{ backgroundColor: "#0077b6", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: actionLoading ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                                {actionLoading ? "Procesando..." : (mascota.estado === "perdido" ? "Marcar como encontrado" : "Marcar como perdido")}
                            </button>
                            <button onClick={handleEliminar} disabled={actionLoading} style={{ backgroundColor: "#e74c3c", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: actionLoading ? "not-allowed" : "pointer", fontWeight: "bold" }}>
                                {actionLoading ? "Procesando..." : "🗑 Eliminar mascota"}
                            </button>
                        </div>
                    )}
                    <button onClick={() => navigate("/")} style={{ marginTop: 8, backgroundColor: "#6c757d", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%" }}>
                        ⬅ Volver al inicio
                    </button>
                </div>
            </div>

            {/* MAPA */}
            {hasLocation && (
                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: 20, marginBottom: 24 }}>
                    <h3 style={{ color: "#023e8a", marginBottom: 8 }}>📍 Ubicación</h3>
                    {!isOwner && (
                        <p style={{ fontStyle: "italic", color: "#666", fontSize: 13, marginBottom: 8 }}>
                            (La ubicación mostrada puede ser aproximada por razones de privacidad)
                        </p>
                    )}
                    <div style={{ height: 300, borderRadius: 8, overflow: "hidden" }}>
                        <MapContainer center={[lat, lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[lat, lng]}>
                                <Popup>
                                    <div style={{ textAlign: "center" }}>
                                        <strong>{mascota.nombre}</strong>
                                        <div>{mascota.tipo} — {mascota.ciudad}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button onClick={abrirEnGoogleMaps} style={{ padding: "8px 12px", borderRadius: 6, backgroundColor: "#0077b6", color: "white", border: "none", cursor: "pointer" }}>
                            Abrir en Google Maps
                        </button>
                        <button onClick={handleCopiarCoords} style={{ padding: "8px 12px", borderRadius: 6, backgroundColor: "#e9ecef", border: "none", cursor: "pointer" }}>
                            Copiar coordenadas
                        </button>
                    </div>
                </div>
            )}

            {/* COMENTARIOS */}
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: 20 }}>
                <h3 style={{ color: "#023e8a", marginBottom: 12 }}>💬 Comentarios ({comentarios.length})</h3>

                {idUsuarioActual ? (
                    usuarioPremium ? (
                        <div style={{ marginBottom: 20 }}>
                            <textarea
                                value={nuevoComentario}
                                onChange={(e) => setNuevoComentario(e.target.value)}
                                placeholder="Escribe un comentario..."
                                maxLength={500}
                                rows={3}
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, resize: "vertical", fontFamily: "inherit" }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                                <span style={{ fontSize: 12, color: "#999" }}>{nuevoComentario.length}/500</span>
                                <button onClick={handleEnviarComentario} disabled={comentarioLoading || !nuevoComentario.trim()} style={{ padding: "8px 18px", borderRadius: 6, backgroundColor: "#0077b6", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                                    {comentarioLoading ? "Enviando..." : "Comentar"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 8, padding: 14, marginBottom: 16, textAlign: "center" }}>
                            <p style={{ margin: 0, color: "#795548", fontWeight: "bold" }}>⭐ Función Premium</p>
                            <p style={{ margin: "6px 0 0", color: "#795548", fontSize: 13 }}>Actualiza tu plan para poder comentar en las publicaciones</p>
                        </div>
                    )
                ) : (
                    <div style={{ background: "#f0f4ff", border: "1px solid #c5d0f5", borderRadius: 8, padding: 14, marginBottom: 16, textAlign: "center" }}>
                        <p style={{ margin: 0, color: "#023e8a" }}>
                            <button onClick={() => navigate('/login')} style={{ background: "none", border: "none", color: "#0077b6", cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
                                Inicia sesión
                            </button>
                            {" "}para ver y escribir comentarios
                        </p>
                    </div>
                )}

                {comentarios.length === 0 ? (
                    <p style={{ color: "#999", textAlign: "center", fontSize: 14 }}>No hay comentarios aún. ¡Sé el primero!</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {comentarios.map(c => (
                            <div key={c._id} style={{ background: "#f8f9fa", borderRadius: 8, padding: 12, border: "1px solid #eee" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <strong style={{ color: "#023e8a", fontSize: 14 }}>{c.usuario?.nombre || 'Usuario'}</strong>
                                        {c.usuario?.premium && (
                                            <span style={{ background: "#ffd700", color: "#795548", fontSize: 11, padding: "2px 6px", borderRadius: 4, fontWeight: "bold" }}>⭐ Premium</span>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 12, color: "#999" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                                        {idUsuarioActual && c.usuario?._id === idUsuarioActual && (
                                            <button onClick={() => handleEliminarComentario(c._id)} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 13 }}>🗑</button>
                                        )}
                                    </div>
                                </div>
                                <p style={{ margin: 0, fontSize: 14, color: "#333", lineHeight: 1.5 }}>{c.texto}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetalleMascota;