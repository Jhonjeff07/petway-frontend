import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPreguntaSecreta } from "../services/api";

function RecuperarPassword() {
    const [email, setEmail] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await obtenerPreguntaSecreta(email);
            setMensaje("Pregunta de seguridad encontrada");
            
            // Navegar a la página de verificación de pregunta
            setTimeout(() => navigate("/verificar-pregunta", { 
                state: { email, preguntaSecreta: res.data.preguntaSecreta } 
            }), 1000);
        } catch (error) {
            setError(error.response?.data?.msg || "Error al obtener la pregunta de seguridad");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Recuperar Contraseña</h2>
            <form onSubmit={manejarSubmit}>
                <input
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Buscando..." : "Continuar"}
                </button>
            </form>
            {mensaje && <p className="success">{mensaje}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default RecuperarPassword;