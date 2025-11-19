import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Buscar from "./pages/Buscar";
import Publicar from "./pages/Publicar";
import Registro from "./pages/Registro";
import DetalleMascota from "./pages/DetalleMascota";
import RecuperarPassword from "./pages/RecuperarPassword";
import RestablecerPassword from "./pages/RestablecerPassword";
import VerificarPregunta from './pages/VerificarPregunta';
import CambiarPassword from './pages/CambiarPassword';
import VerificarEmail from './pages/VerificarEmail';
import MisMascotas from './pages/MisMascotas'; // ✅ nuevo
import "./App.css";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(localStorage.getItem("auth") === "true");
  }, []);

  return (
    <div className="app-container">
      <Navbar setIsAuth={setIsAuth} />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />
          <Route path="/verificar-pregunta" element={<VerificarPregunta />} />
          <Route path="/restablecer-password/:token" element={<RestablecerPassword />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/cambiar-password" element={isAuth ? <CambiarPassword /> : <Navigate to="/login" />} />
          <Route path="/publicar" element={isAuth ? <Publicar /> : <Navigate to="/login" />} />
          <Route path="/mascota/:id" element={<DetalleMascota />} />
          <Route path="/verificar-email" element={<VerificarEmail />} />
          <Route path="/mis-mascotas" element={isAuth ? <MisMascotas /> : <Navigate to="/login" />} /> {/* ✅ nueva ruta */}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
