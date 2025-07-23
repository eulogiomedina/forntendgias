import React, { useEffect, useState } from "react";
import { FaUserCircle, FaIdCard, FaTimes } from "react-icons/fa";
import API_URL from "../apiConfig";

const PerfilCliente = () => {
  const [perfil, setPerfil] = useState(null);
  const [ahorros, setAhorros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para tokens
  const [tokenWearOS, setTokenWearOS] = useState(null);
  const [pinAlexa, setPinAlexa]     = useState(null);

  const [modalOpen, setModalOpen]               = useState(false);
  const [credencialSeleccionada, setCredencialSeleccionada] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.id) {
      fetch(`${API_URL}/api/perfil/${storedUser.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener el perfil");
          return res.json();
        })
        .then((data) => {
          setPerfil(data.usuario);
          setAhorros(data.ahorros.length > 0 ? data.ahorros[0].ahorros : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error al cargar el perfil:", err);
          setLoading(false);
        });
    } else {
      console.error("No se encontró el ID del usuario en el localStorage");
      setLoading(false);
    }
  }, []);

  const abrirModal = (url) => {
    setCredencialSeleccionada(url);
    setModalOpen(true);
  };
  const cerrarModal = () => {
    setModalOpen(false);
    setCredencialSeleccionada(null);
  };

  // Generar token Wear OS
  const generarTokenWearOS = async () => {
    const { id } = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch(`${API_URL}/api/wearos/generar-token/${id}`, {
        method: "POST",
      });
      const { token } = await res.json();
      setTokenWearOS(token);
    } catch (err) {
      console.error("Error al generar token Wear OS:", err);
      alert("❌ Error al generar el token Wear OS.");
    }
  };

  // Generar PIN Alexa
  const generarPinAlexa = async () => {
    const { id } = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch(`${API_URL}/api/alexa/generar-pin/${id}`, {
        method: "POST",
      });
      const { pin } = await res.json();
      setPinAlexa(pin);
    } catch (err) {
      console.error("Error al generar PIN Alexa:", err);
      alert("❌ Error al generar el PIN de Alexa.");
    }
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!perfil) return <p>No se encontró información del usuario.</p>;

  return (
    <div className="max-w-[600px] mx-auto mt-[120px] mb-[50px] p-[30px] bg-gradient-to-br from-[#e0f7fa] to-[#80deea] rounded-[15px] shadow-[0px_10px_40px_rgba(0,0,0,0.2)] text-center font-Poppins">
      <h2 className="text-2xl font-bold mb-4">Perfil del Cliente</h2>

      {/* Botones para tokens */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={generarTokenWearOS}
          className="py-2 px-4 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors shadow-md"
        >
          Generar Token Wear OS
        </button>
        <button
          onClick={generarPinAlexa}
          className="py-2 px-4 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors shadow-md"
        >
          Generar PIN Alexa
        </button>
      </div>

      {/* Mostrar token Wear OS */}
      {tokenWearOS && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-center">
          <p className="font-semibold mb-1">
            🔑 Token para Wear OS:
          </p>
          <p className="text-2xl font-mono tracking-wider">{tokenWearOS}</p>
          <p className="text-xs text-gray-600 mt-1">
            Ingresa este código en tu app de reloj
          </p>
        </div>
      )}

      {/* Mostrar PIN Alexa */}
      {pinAlexa && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-800 rounded text-center">
          <p className="font-semibold mb-1">
            🔐 PIN de verificación para Alexa:
          </p>
          <p className="text-2xl font-mono tracking-wider">{pinAlexa}</p>
          <p className="text-xs text-gray-600 mt-1">
            Dígalo cuando Alexa lo solicite
          </p>
        </div>
      )}

      {/* Sección de perfil */}
      <div className="flex flex-col items-center bg-white rounded-[10px] p-[20px] shadow-[0px_4px_15px_rgba(0,0,0,0.1)] mb-[20px]">
        {perfil.fotoPerfil ? (
          <img
            src={perfil.fotoPerfil}
            alt="Foto de perfil"
            className="w-[150px] h-[150px] rounded-full object-cover mb-[15px] border-[3px] border-[#00796b]"
          />
        ) : (
          <FaUserCircle className="text-[150px] text-[#004d40] mb-[15px]" />
        )}
        <div className="space-y-2">
          <p className="text-[18px] text-[#333]">
            <strong>Nombre:</strong> {perfil.nombre} {perfil.apellidos}
          </p>
          <p className="text-[18px] text-[#333]">
            <strong>Correo:</strong> {perfil.correo}
          </p>
          <p className="text-[18px] text-[#333]">
            <strong>Teléfono:</strong> {perfil.telefono || "No registrado"}
          </p>
        </div>
      </div>

      {/* Credencial de elector */}
      <div className="mt-[25px] p-[20px] bg-white rounded-[12px] shadow-[0px_8px_20px_rgba(0,0,0,0.1)]">
        <h3 className="text-xl font-semibold mb-2">
          📌 Credencial de Elector
        </h3>
        {ahorros.length > 0 ? (
          <button
            onClick={() => abrirModal(ahorros[0].credencial)}
            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            📄 Ver Credencial
          </button>
        ) : (
          <p className="text-[18px] text-gray-700 flex items-center justify-center">
            <FaIdCard className="text-2xl mr-2" />
            No has subido una credencial.
          </p>
        )}
      </div>

      {/* Modal de credencial */}
      {modalOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-[1000]"
          onClick={cerrarModal}
        >
          <div
            className="relative bg-white p-[20px] rounded-[15px] max-w-[90%] max-h-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-2 text-[28px] text-[#d9534f]"
            >
              <FaTimes />
            </button>
            <img
              src={credencialSeleccionada}
              alt="Credencial Ampliada"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}

      {/* Lista de ahorros */}
      <h3 className="text-xl font-semibold mt-6 mb-2">Mis Ahorros</h3>
      {ahorros.length === 0 ? (
        <p>No tienes ahorros registrados.</p>
      ) : (
        <ul className="space-y-3">
          {ahorros.map((ah) => (
            <li
              key={ah._id}
              className="bg-white p-4 border border-gray-200 rounded"
            >
              <p>
                <strong>Monto:</strong> ${ah.monto}
              </p>
              <p>
                <strong>Frecuencia:</strong> {ah.tipo}
              </p>
              <p>
                <strong>Inicio:</strong>{" "}
                {new Date(ah.fechaInicio).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PerfilCliente;
