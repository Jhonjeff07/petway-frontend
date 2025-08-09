import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Buscar from "./pages/Buscar";
import Publicar from "./pages/Publicar";
import Registro from "./pages/Registro";
import DetalleMascota from "./pages/DetalleMascota"; // 🆕 Importamos la nueva página
import "./App.css";

function App() {
  // Estado global de autenticación
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Revisar localStorage al cargar
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
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/publicar"
            element={isAuth ? <Publicar /> : <Navigate to="/login" />}
          />
          <Route path="/mascota/:id" element={<DetalleMascota />} /> {/* 🆕 Nueva ruta */}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;

