import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verificarRespuestaSecreta, restablecerPassword } from "../services/api";

function VerificarPregunta() {
    const [respuesta, setRespuesta] = useState("");
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [paso, setPaso] = useState(1); // 1: verificar respuesta, 2: nueva contraseña
    const [tokenReset, setTokenReset] = useState(""); // Almacenar el token

    const location = useLocation();
    const navigate = useNavigate();
    const { email, preguntaSecreta } = location.state;

    const manejarVerificacion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await verificarRespuestaSecreta({ email, respuesta });
            setMensaje(res.data.msg);
            setTokenReset(res.data.token); // Guardar el token
            setPaso(2);
        } catch (error) {
            setError(error.response?.data?.msg || "Error al verificar la respuesta");
        } finally {
            setLoading(false);
        }
    };

    const manejarRestablecimiento = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (nuevaPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        try {
            // Usar el token que ya tenemos
            await restablecerPassword({ token: tokenReset, nuevaPassword });
            setMensaje("Contraseña restablecida correctamente. Redirigiendo...");

            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            setError(error.response?.data?.msg || "Error al restablecer la contraseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Verificar Pregunta de Seguridad</h2>

            {paso === 1 ? (
                <form onSubmit={manejarVerificacion}>
                    <p><strong>Pregunta:</strong> {preguntaSecreta}</p>
                    <input
                        type="text"
                        placeholder="Tu respuesta"
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Verificando..." : "Verificar respuesta"}
                    </button>
                </form>
            ) : (
                <form onSubmit={manejarRestablecimiento}>
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={nuevaPassword}
                        onChange={(e) => setNuevaPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                    <input
                        type="password"
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Restableciendo..." : "Restablecer contraseña"}
                    </button>
                </form>
            )}

            {mensaje && <p className="success">{mensaje}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default VerificarPregunta;