import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ setIsAuth }) {
  const navigate = useNavigate();
  const isAuth = localStorage.getItem("auth") === "true";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setIsAuth(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        {/* IMPORTANTE: coloca Logo.png en la carpeta public (ruta /Logo.png) */}
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

        {isAuth ? (
          <>
            <Link to="/publicar" onClick={() => setMenuOpen(false)}>Publicar</Link>
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="nav-logout">
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
