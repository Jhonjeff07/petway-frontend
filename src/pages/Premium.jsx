import React from 'react';
import "./Premium.css";

const Premium = () => {
    return (
        <div className="premium-page">
            <div className="premium-container">
                <h1 className="premium-title">🐾 Petway Premium</h1>
                <p className="premium-subtitle">Dale más visibilidad a tu mascota perdida</p>

                <div className="premium-content">
                    <div className="benefits">
                        <h2>¿Qué incluye Petway Premium?</h2>
                        <ul>
                            <li>✅ Reporte destacado en el mapa principal</li>
                            <li>✅ Mayor visibilidad en búsquedas</li>
                            <li>✅ Comenta en publicaciones de otros usuarios</li>
                            <li>✅ Tu mascota aparece primero</li>
                            <li>✅ Soporte preferente</li>
                        </ul>
                    </div>

                    <div className="payment-section">
                        <h2>Activa Premium ahora</h2>

                        <p className="precio-premium">$5.000 <span>COP / mes</span></p>

                        <p>Escanea el código QR para realizar el pago:</p>

                        <div className="qr-container">
                            <img
                                src="/qr-pago.jpg"
                                alt="Código QR Pago Premium"
                                className="qr-code"
                            />
                        </div>

                        <div className="instructions">
                            <p><strong>Paso 1:</strong> Realiza el pago escaneando el QR</p>
                            <p><strong>Paso 2:</strong> Envía el comprobante por correo a:</p>
                            <p className="email-highlight">jhonatanjcd2000@gmail.com</p>
                            <p><strong>Paso 3:</strong> Incluye tu <strong>nombre de usuario</strong> o correo con el que te registraste</p>
                        </div>

                        <p className="note">
                            Una vez recibido el comprobante, activaremos tu cuenta Premium en un máximo de 24 horas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Premium;