import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { obtenerMascotaPorId, actualizarMascota } from "../services/api"; // 🆕 importar actualizarMascota

function DetalleMascota() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mascota, setMascota] = useState(null);

    useEffect(() => {
        const fetchMascota = async () => {
            try {
                const res = await obtenerMascotaPorId(id);
                setMascota(res.data);
            } catch (error) {
                alert("❌ No se pudo cargar la mascota");
                navigate("/");
            }
        };
        fetchMascota();
    }, [id, navigate]);

    // 🆕 Función para actualizar estado
    const actualizarEstado = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("⚠ Debes iniciar sesión para cambiar el estado");
                return;
            }
            const nuevoEstado = mascota.estado === "perdido" ? "encontrado" : "perdido";
            await actualizarMascota(mascota._id, { estado: nuevoEstado }, token);
            setMascota({ ...mascota, estado: nuevoEstado });
            alert("✅ Estado actualizado correctamente");
        } catch (error) {
            console.error(error);
            alert("❌ No se pudo actualizar el estado");
        }
    };

    if (!mascota) return <p style={{ textAlign: "center" }}>Cargando...</p>;

    return (
        <div className="detalle-container">
            <h1>{mascota.nombre}</h1>
            <img
                src={
                    mascota.fotoUrl.startsWith("http")
                        ? mascota.fotoUrl
                        : `http://localhost:4000${mascota.fotoUrl}`
                }
                alt={mascota.nombre}
                className="detalle-img"
            />
            <p><strong>Tipo:</strong> {mascota.tipo}</p>
            <p><strong>Raza:</strong> {mascota.raza}</p>
            <p><strong>Ciudad:</strong> {mascota.ciudad}</p>
            <p><strong>Descripción:</strong> {mascota.descripcion}</p>
            <p><strong>Estado:</strong> {mascota.estado === "perdido" ? "❌ Perdido" : "✅ Encontrado"}</p>
            <p><strong>Publicado el:</strong> {new Date(mascota.createdAt).toLocaleString()}</p>

            {/* 🆕 Botón para cambiar estado */}
            <button onClick={actualizarEstado} style={{ marginTop: "10px", backgroundColor: "#0077b6", color: "white", padding: "8px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Cambiar estado
            </button>

            <button onClick={() => navigate("/")} style={{ marginTop: "15px" }}>
                ⬅ Volver
            </button>
        </div>
    );
}

export default DetalleMascota;
