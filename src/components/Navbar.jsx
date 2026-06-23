import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eliminarUsuario } from "../services/auth";

function Navbar({ isAuth, setIsAuth }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('https://petway-backend.onrender.com/api/usuarios/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Error limpiando cookie:', e);
    }
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    eliminarUsuario();
    setIsAuth(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/Logo.png" alt="Logo PetWay" className="nav-logo" />
      </div>
      <div className="nav-center">
        <span className="nav-title">🐾 PetWay</span>
      </div>
      <button
        className="nav-toggle"
        aria-label="Abrir menú"
        onClick={() => setMenuOpen((s) => !s)}
      >
        ☰
      </button>
      <div className={`nav-right ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
        <Link to="/buscar" onClick={() => setMenuOpen(false)}>Buscar</Link>

        {/* Botón Hazte Premium - Visible para todos */}
        <Link
          to="/premium"
          onClick={() => setMenuOpen(false)}
          className="nav-premium-btn"
        >
          ✨ Hazte Premium
        </Link>

        {isAuth ? (
          <>
            <Link to="/publicar" onClick={() => setMenuOpen(false)}>Publicar</Link>
            <Link to="/mis-mascotas" onClick={() => setMenuOpen(false)}>Mis Mascotas</Link>
            <Link to="/cambiar-password" onClick={() => setMenuOpen(false)}>Cambiar Contraseña</Link>
            <button
              onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="nav-logout"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/registro" onClick={() => setMenuOpen(false)}>Registro</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Publicar</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;