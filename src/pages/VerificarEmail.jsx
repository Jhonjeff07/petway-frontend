import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyEmailCode, resendVerificationCode } from "../services/api";
import "../App.css";

function VerificarEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    // Si venimos desde registro, el email lo pasamos por state
    const initialEmail = location.state?.email || "";

    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage("");
        if (!email || !code) {
            setMessage("Por favor ingresa email y código.");
            return;
        }
        try {
            setLoading(true);
            await verifyEmailCode({ email, code });
            alert("✅ Correo verificado correctamente. Ahora puedes iniciar sesión.");
            navigate("/login");
        } catch (err) {
            console.error("Error verificando código:", err);
            setMessage(typeof err === "string" ? err : (err.response?.data?.msg || "Error verificando el código"));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setMessage("Ingresa tu email para reenviar el código.");
            return;
        }
        try {
            setResendLoading(true);
            await resendVerificationCode(email);
            setMessage("✅ Código reenviado. Revisa tu correo (puede tardar algunos segundos).");
        } catch (err) {
            console.error("Error reenvío:", err);
            setMessage(typeof err === "string" ? err : (err.response?.data?.msg || "Error reenviando código"));
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="form-page-container">
            <h1 className="form-page-title">📧 Verificar Email</h1>
            <p style={{ textAlign: "center" }}>
                Ingresa el código que te enviamos por correo para verificar tu cuenta.
            </p>

            {message && <div className="error-message" style={{ color: message.startsWith("✅") ? "green" : undefined }}>{message}</div>}

            <form onSubmit={handleVerify}>
                <input
                    type="email"
                    name="email"
                    placeholder="Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    name="code"
                    placeholder="Código (6 dígitos)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Verificando..." : "Verificar Código"}
                </button>
            </form>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                <button onClick={handleResend} disabled={resendLoading} style={{ padding: "8px 12px" }}>
                    {resendLoading ? "Reenviando..." : "Reenviar código"}
                </button>
                <Link to="/login" style={{ alignSelf: "center", color: "#0077b6" }}>
                    Volver a Iniciar Sesión
                </Link>
            </div>
        </div>
    );
}

export default VerificarEmail;
