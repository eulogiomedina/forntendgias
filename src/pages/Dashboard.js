// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import AhorroSelector from "./AhorroSelector";
import ResumenAhorro from "./ResumenAhorro";
import API_URL from "../apiConfig";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [ahorroSeleccionado, setAhorroSeleccionado] = useState(null);
  const [credencial, setCredencial] = useState(null);
  const [facebook, setFacebook] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [userId, setUserId] = useState(null);
  const [historialAhorros, setHistorialAhorros] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.id) {
      setUserId(storedUser.id);
      fetch(`${API_URL}/api/ahorros-usuarios/${storedUser.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("No se encontraron ahorros.");
          return res.json();
        })
        .then((data) => {
          setHistorialAhorros(data);
        })
        .catch((err) => console.error("Error al obtener historial:", err));
    }
  }, []);

  const handleAgregarOtro = () => {
    setMostrarSelector(true);
  };

  const handleSelectAhorro = (plan) => {
    setAhorroSeleccionado(plan);
    setMostrarSelector(false);
    setMostrarConfirmacion(true);
  };

  const confirmarSeleccion = () => {
    setMostrarConfirmacion(false);
    setMostrarModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("No se seleccionó ningún archivo.");
      return;
    }
    const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedFormats.includes(file.type)) {
      alert("Formato no válido. Solo se permiten JPG, JPEG y PNG.");
      return;
    }
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. El tamaño máximo es 2MB.");
      return;
    }
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 300 || img.height < 200) {
        alert("La imagen es demasiado pequeña. Debe ser al menos 300x200 píxeles.");
        return;
      }
      setCredencial(file);
    };
  };

  const handleSubmit = async () => {
    if (historialAhorros.length === 0 && !credencial) {
      alert("Por favor, sube una foto de tu credencial.");
      return;
    }
    if (!userId) {
      alert("Error: No se encontró el usuario logueado.");
      return;
    }
    if (!ahorroSeleccionado) {
      alert("Debes seleccionar un tipo de ahorro.");
      return;
    }
  
    // Extraer monto y tipo del ahorro seleccionado
    const [montoStr, tipo] = ahorroSeleccionado.split(" ");
    const monto = parseFloat(montoStr);
  
    if (isNaN(monto)) {
      alert("Error: El monto no es un número válido.");
      return;
    }
  
    console.log("📌 Enviando datos a /api/tandas:");
    console.log("➡️ userId:", userId);
    console.log("➡️ monto:", monto);
    console.log("➡️ tipo:", tipo);
  
    try {
      // Registro individual (AhorroUsuario)
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("monto", monto);
      formData.append("tipo", tipo);
  
      if (historialAhorros.length === 0) {
        formData.append("credencial", credencial);
        formData.append("facebook", facebook);
      }
  
      const response = await fetch(`${API_URL}/api/ahorros-usuarios`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error al guardar el ahorro.");
      }
  
      alert("Ahorro registrado exitosamente.");
      setMostrarModal(false);
      setHistorialAhorros((prev) => [...prev, result.ahorro]);
      setAhorroSeleccionado(null);
      setCredencial(null);
      setFacebook("");
  
      // **Registro en la tanda** (sin `diaPago` ni `fechaInicio`)
      const tandaResponse = await fetch(`${API_URL}/api/tandas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          monto,
          tipo,
        }),
      });
  
      const tandaResult = await tandaResponse.json();
      if (!tandaResponse.ok) {
        throw new Error(tandaResult.message || "Error al registrar en la tanda.");
      }
  
      console.log("✅ Tanda registrada/unida:", tandaResult);
  
    } catch (error) {
      console.error("❌ Error al guardar el ahorro:", error);
      alert(`Hubo un error al guardar el ahorro: ${error.message}`);
    }
  };
  
  return (
    <div className="p-5 max-w-[600px] mt-[110px] mx-auto bg-white shadow-md rounded-[10px] relative text-center">
      <h1 className="text-center text-gray-800">Bienvenido al Dashboard</h1>
      <p>Esta es la página principal para el usuario ya logueado.</p>

      {historialAhorros.length > 0 ? (
        <>
          <ResumenAhorro ahorros={historialAhorros} setAhorroSeleccionado={setAhorroSeleccionado} />
          <div className="flex justify-center gap-4 mt-4">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              onClick={handleAgregarOtro}
            >
              ➕ Agregar otro ahorro
            </button>
            {/* Enlace a la pantalla de Gestión de Cuenta (tanda grupal) */}
            <Link 
              to="/gestion-cuenta" 
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
            >
              Ir a Gestión de Cuenta
            </Link>
          </div>
        </>
      ) : (
        !mostrarSelector && <AhorroSelector onSelect={handleSelectAhorro} />
      )}

      {mostrarSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center max-w-[400px] w-[90%] mx-auto mt-[50px]">
            <h3 className="text-lg font-semibold mb-4">Selecciona el tipo de ahorro</h3>
            <AhorroSelector onSelect={handleSelectAhorro} />
            <div className="flex justify-between mt-5">
              <button 
                className="p-[10px] cursor-pointer rounded flex-1 mx-[5px] bg-[#dc3545] text-white hover:bg-[#a71d2a]"
                onClick={() => setMostrarSelector(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center max-w-[400px] w-[90%] mx-auto mt-[50px]">
            <h3 className="text-lg font-semibold mb-4">Confirmar selección</h3>
            <p className="text-base text-blue-500 font-bold mb-3">
              Estás seleccionando el plan de ahorro de <strong>{ahorroSeleccionado}</strong>. ¿Deseas continuar?
            </p>
            <div className="flex justify-between mt-5">
              <button 
                className="p-[10px] cursor-pointer rounded flex-1 mx-[5px] bg-[#007bff] text-white hover:bg-[#0056b3]"
                onClick={confirmarSeleccion}
              >
                Sí, continuar
              </button>
              <button 
                className="p-[10px] cursor-pointer rounded flex-1 mx-[5px] bg-[#dc3545] text-white hover:bg-[#a71d2a]"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center max-w-[400px] w-[90%] mx-auto mt-[50px]">
            <h3 className="text-lg font-semibold mb-4">Información adicional para el ahorro</h3>
            <p className="text-base text-blue-500 font-bold mb-3">
              Has seleccionado: <strong>{ahorroSeleccionado}</strong>
            </p>
            {historialAhorros.length === 0 && (
              <>
                <label className="block mt-[10px] mb-[5px] font-bold">
                  Sube una foto de tu credencial de lector:
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="w-full p-[10px] mb-[10px] border border-gray-300 rounded"
                />
                <label className="block mt-[10px] mb-[5px] font-bold">
                  Enlace de tu perfil de Facebook:
                </label>
                <input
                  type="text"
                  placeholder="https://facebook.com/tu-perfil"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full p-[10px] mb-[10px] border border-gray-300 rounded"
                />
              </>
            )}
            <div className="flex justify-between mt-5">
              <button 
                className="p-[10px] cursor-pointer rounded flex-1 mx-[5px] bg-[#007bff] text-white hover:bg-[#0056b3]"
                onClick={handleSubmit}
              >
                Confirmar
              </button>
              <button 
                className="p-[10px] cursor-pointer rounded flex-1 mx-[5px] bg-[#dc3545] text-white hover:bg-[#a71d2a]"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
