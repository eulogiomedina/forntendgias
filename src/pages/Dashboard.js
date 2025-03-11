import React, { useState, useEffect } from "react";
import AhorroSelector from "./AhorroSelector";
import ResumenAhorro from "./ResumenAhorro";
import HistorialAhorros from "./HistorialAhorros";
import API_URL from "../apiConfig";

const Dashboard = () => {
  const [ahorroSeleccionado, setAhorroSeleccionado] = useState(null);
  const [credencial, setCredencial] = useState(null);
  const [facebook, setFacebook] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [userId, setUserId] = useState(null);
  const [historialAhorros, setHistorialAhorros] = useState([]);

  // Obtener el usuario logueado y sus ahorros
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.id) {
      setUserId(storedUser.id);
      fetch(`${API_URL}/api/ahorros-usuarios/${storedUser.id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("No se encontraron ahorros.");
          }
          return res.json();
        })
        .then((data) => {
          setHistorialAhorros(data);
        })
        .catch((err) => console.error("Error al obtener historial:", err));
    }
  }, []);

  // Función para seleccionar un plan de ahorro (para agregar uno nuevo)
  const handleSelectAhorro = (ahorro) => {
    setAhorroSeleccionado(ahorro);
    setMostrarConfirmacion(true);
  };

  const confirmarSeleccion = () => {
    setMostrarConfirmacion(false);
    setMostrarModal(true);
  };

  // Manejo de archivo (para la credencial)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("No se seleccionó ningún archivo.");
      return;
    }
    const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedFormats.includes(file.type)) {
      alert("Formato no válido. Solo se permiten archivos JPG, JPEG y PNG.");
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

  // Envío del formulario para registrar un ahorro
  const handleSubmit = async () => {
    // Si es el primer ahorro, se requiere la imagen de la credencial
    if (historialAhorros.length === 0 && !credencial) {
      alert("Por favor, sube una foto de tu credencial.");
      return;
    }
    if (!userId) {
      alert("Error: No se encontró el usuario logueado.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    // Se espera que el ahorroSeleccionado venga en formato "monto tipo", por ejemplo "1000 Mensual"
    formData.append("monto", ahorroSeleccionado.split(" ")[0]);
    formData.append("tipo", ahorroSeleccionado.split(" ")[1]);

    // Enviar credencial y Facebook solo si es el primer ahorro
    if (historialAhorros.length === 0) {
      formData.append("credencial", credencial);
      formData.append("facebook", facebook);
    }

    try {
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
      // Actualizar el historial con el nuevo ahorro sin recargar la página
      setHistorialAhorros((prev) => [...prev, result.ahorro]);
      setAhorroSeleccionado(null);
    } catch (error) {
      console.error("Error al guardar el ahorro:", error);
      alert(`Hubo un error al guardar el ahorro: ${error.message}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg relative mt-28 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Bienvenido al Dashboard</h1>
      <p className="text-gray-600 mb-8">Esta es la página principal para el usuario ya logueado.</p>

      {historialAhorros.length > 0 ? (
        // Se muestra el resumen con todos los ahorros registrados
        <ResumenAhorro ahorros={historialAhorros} setAhorroSeleccionado={setAhorroSeleccionado} />
      ) : (
        // Si no hay ahorros, se muestra el selector para agregar uno
        <AhorroSelector onSelect={handleSelectAhorro} />
      )}

      {/* Modal de Confirmación */}
      {mostrarConfirmacion && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-xl font-bold mb-4">Confirmar selección</h3>
            <p className="text-lg mb-6">Estás seleccionando el plan de ahorro de <strong>{ahorroSeleccionado}</strong>. ¿Deseas continuar?</p>
            <div className="flex justify-between">
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                onClick={confirmarSeleccion}
              >
                Sí, continuar
              </button>
              <button
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Datos Adicionales */}
      {mostrarModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-xl font-bold mb-4">Información adicional para el ahorro</h3>
            <p className="text-lg mb-6">Has seleccionado: <strong>{ahorroSeleccionado}</strong></p>
            {historialAhorros.length === 0 && (
              <>
                <label className="block text-left mb-2 font-semibold">Sube una foto de tu credencial de lector:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
                <label className="block text-left mb-2 font-semibold">Enlace de tu perfil de Facebook:</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/tu-perfil"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
              </>
            )}
            <div className="flex justify-between">
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                onClick={handleSubmit}
              >
                Confirmar
              </button>
              <button
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
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
