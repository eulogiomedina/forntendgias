import React, { useEffect, useState } from "react";
import { FaUserCircle, FaIdCard, FaTimes, FaTrophy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_URL from "../apiConfig";

const PerfilCliente = () => {
  const [perfil, setPerfil] = useState(null);
  const [ahorros, setAhorros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para tokens
  const [tokenWearOS, setTokenWearOS] = useState(null);
  const [pinAlexa, setPinAlexa] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [credencialSeleccionada, setCredencialSeleccionada] = useState(null);
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="max-w-[680px] mx-auto mt-28 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!perfil) return <p className="text-center mt-24">No se encontró información del usuario.</p>;

  // Foto prioriza fotoPersona (según tu colección) y luego fotoPerfil si existiera
  const foto = perfil.fotoPersona || perfil.fotoPerfil;

  return (
    <div className="relative">
      {/* Fondo degradado suave */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#0F2B45]/10 via-[#6cc3e0]/10 to-transparent"></div>

      <div className="max-w-[680px] mx-auto mt-28 mb-16 px-5">
        {/* Encabezado tipo tarjeta premium */}
        <div className="backdrop-blur-md bg-white/70 border border-white/60 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#0F2B45] to-[#1b4f73] p-6 text-white">
            <h2 className="text-2xl font-bold tracking-wide">Perfil del Cliente</h2>
            <p className="opacity-80 text-sm">Tu dinero ahora más seguro</p>
          </div>

          {/* Bloque de avatar y datos */}
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar con aro */}
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6cc3e0] to-[#0F2B45] blur-md opacity-30"></div>
                {foto ? (
                  <img
                    src={foto}
                    alt="Foto de perfil"
                    className="relative w-36 h-36 rounded-full object-cover ring-4 ring-white shadow-xl"
                  />
                ) : (
                  <FaUserCircle className="relative text-[144px] text-[#0F2B45] opacity-80" />
                )}
              </div>

              {/* Datos principales */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Nombre</p>
                  <p className="font-semibold text-gray-800">
                    {perfil.nombre} {perfil.apellidos}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Correo</p>
                  <p className="font-semibold text-gray-800 break-all">{perfil.correo}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Teléfono</p>
                  <p className="font-semibold text-gray-800">
                    {perfil.telefono || "No registrado"}
                  </p>
                </div>
              </div>

              {/* Acciones principales */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <button
                  onClick={generarTokenWearOS}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.99] transition"
                >
                  Generar Token Wear OS
                </button>
                <button
                  onClick={generarPinAlexa}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium shadow-lg bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:scale-[0.99] transition"
                >
                  Generar PIN Alexa
                </button>
                <button
                  onClick={() => navigate("/gamificacion")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold shadow-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-[0.99] transition"
                >
                  <FaTrophy className="text-lg" />
                  Ver mis Puntos y Recompensas
                </button>
              </div>

              {/* Tarjetas de códigos */}
              {tokenWearOS && (
                <div className="mt-6 w-full">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 shadow-sm">
                    <p className="font-semibold">🔑 Token para Wear OS</p>
                    <p className="text-2xl font-mono tracking-widest mt-1">{tokenWearOS}</p>
                    <p className="text-xs text-amber-700/80 mt-1">Ingresa este código en tu app de reloj.</p>
                  </div>
                </div>
              )}

              {pinAlexa && (
                <div className="mt-3 w-full">
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sky-800 shadow-sm">
                    <p className="font-semibold">🔐 PIN de verificación para Alexa</p>
                    <p className="text-2xl font-mono tracking-widest mt-1">{pinAlexa}</p>
                    <p className="text-xs text-sky-700/80 mt-1">Dilo cuando Alexa lo solicite.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Credencial & Ahorros */}
        <div className="mt-6 grid grid-cols-1 gap-6">
          {/* Credencial */}
          <div className="backdrop-blur-md bg-white/70 border border-white/60 shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0F2B45]">📌 Credencial de Elector</h3>
              {ahorros.length > 0 ? (
                <button
                  onClick={() => abrirModal(ahorros[0].credencial)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white font-medium shadow hover:from-sky-600 hover:to-sky-700 transition"
                >
                  Ver credencial
                </button>
              ) : (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <FaIdCard className="text-base" />
                  No has subido una credencial.
                </span>
              )}
            </div>
          </div>

          {/* Ahorros */}
          <div className="backdrop-blur-md bg-white/70 border border-white/60 shadow-2xl rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#0F2B45] mb-3">💼 Mis Ahorros</h3>
            {ahorros.length === 0 ? (
              <p className="text-gray-600">No tienes ahorros registrados.</p>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-4">
                {ahorros.map((ah) => (
                  <li
                    key={ah._id}
                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-sm text-gray-500">Monto</p>
                    <p className="font-semibold text-gray-800 mb-2">${ah.monto}</p>

                    <p className="text-sm text-gray-500">Frecuencia</p>
                    <p className="font-semibold text-gray-800 mb-2">{ah.tipo}</p>

                    <p className="text-sm text-gray-500">Inicio</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(ah.fechaInicio).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal de credencial */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={cerrarModal}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cerrarModal}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md transition"
              aria-label="Cerrar"
            >
              <FaTimes />
            </button>
            <div className="p-4 sm:p-6">
              <img
                src={credencialSeleccionada}
                alt="Credencial ampliada"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilCliente;
