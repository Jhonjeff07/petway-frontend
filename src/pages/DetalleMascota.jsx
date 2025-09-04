import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { obtenerMascotaPorId, cambiarEstadoMascota, eliminarMascota } from "../services/api";
import { obtenerIdUsuarioActual } from "../services/auth";

function DetalleMascota() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mascota, setMascota] = useState(null);
    const [idUsuarioActual, setIdUsuarioActual] = useState(null);

    useEffect(() => {
        const fetchMascota = async () => {
            try {
                const res = await obtenerMascotaPorId(id);
                setMascota(res.data);

                const usuarioId = obtenerIdUsuarioActual();
                setIdUsuarioActual(usuarioId);
            } catch (error) {
                alert("❌ No se pudo cargar la mascota");
                navigate("/");
            }
        };
        fetchMascota();
    }, [id, navigate]);

    const actualizarEstado = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("⚠ Debes iniciar sesión para cambiar el estado");
                return;
            }

            if (!idUsuarioActual || !mascota || !mascota.usuario || idUsuarioActual !== mascota.usuario._id) {
                alert("⚠ Solo el dueño de la mascota puede cambiar su estado");
                return;
            }

            const nuevoEstado = mascota.estado === "perdido" ? "encontrado" : "perdido";

            await cambiarEstadoMascota(mascota._id, nuevoEstado, token);

            setMascota({ ...mascota, estado: nuevoEstado });
            alert("✅ Estado actualizado correctamente");
        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            let errorMsg = "❌ No se pudo actualizar el estado";
            if (error.response) {
                errorMsg += `: ${error.response.data.msg || error.response.status}`;
            } else if (error.message) {
                errorMsg += `: ${error.message}`;
            }
            alert(errorMsg);
        }
    };

    const handleEliminar = async () => {
        if (window.confirm("⚠ ¿Seguro que deseas eliminar esta mascota?")) {
            try {
                await eliminarMascota(mascota._id);
                alert("✅ Mascota eliminada correctamente");
                navigate("/"); // Redirige al inicio
            } catch (error) {
                console.error("❌ Error eliminando mascota:", error);
                alert("❌ No se pudo eliminar la mascota");
            }
        }
    };

    if (!mascota) return <p style={{ textAlign: "center" }}>Cargando...</p>;

    return (
        <div className="detalle-mascota-container">
            {mascota.fotoUrl && (
                <img
                    src={
                        mascota.fotoUrl.startsWith("http")
                            ? mascota.fotoUrl
                            : `http://localhost:4000${mascota.fotoUrl}`
                    }
                    alt={mascota.nombre}
                    className="detalle-mascota-img"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.jpg";
                    }}
                />
            )}

            <div className="detalle-mascota-info">
                <h1 className="form-page-title">{mascota.nombre}</h1>

                <p><strong>Tipo:</strong> {mascota.tipo}</p>
                <p><strong>Teléfono de contacto:</strong> {mascota.telefono}</p>
                <p><strong>Raza:</strong> {mascota.raza || 'No especificado'}</p>
                <p><strong>Edad:</strong> {mascota.edad || 'No especificada'}</p>
                <p><strong>Ciudad:</strong> {mascota.ciudad}</p>
                <p>
                    <strong>Estado:</strong>
                    {mascota.estado === 'encontrado' ? (
                        <span className="estado-encontrado"> Encontrado</span>
                    ) : (
                        <span className="estado-perdido"> Perdido</span>
                    )}
                </p>
                <p><strong>Descripción:</strong> {mascota.descripcion}</p>
                <p><strong>Publicado:</strong> {new Date(mascota.createdAt).toLocaleDateString()}</p>
                <p><strong>Publicado por:</strong> {mascota.usuario?.nombre || 'Usuario desconocido'}</p>

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {idUsuarioActual && mascota.usuario && idUsuarioActual === mascota.usuario._id && (
                        <>
                            <button
                                onClick={actualizarEstado}
                                style={{
                                    backgroundColor: "#0077b6",
                                    color: "white",
                                    padding: "10px",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                Cambiar estado
                            </button>

                            <button
                                onClick={handleEliminar}
                                style={{
                                    backgroundColor: "#e74c3c",
                                    color: "white",
                                    padding: "10px",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                🗑 Eliminar mascota
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
