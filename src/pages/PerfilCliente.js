import React, { useEffect, useState } from "react";
import { FaUserCircle, FaIdCard, FaTimes } from "react-icons/fa"; // Íconos para usuario, credencial y cerrar
import API_URL from '../apiConfig';

const PerfilCliente = () => {
  const [perfil, setPerfil] = useState(null);
  const [ahorros, setAhorros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false); // Estado del modal
  const [credencialSeleccionada, setCredencialSeleccionada] = useState(null); // URL de la credencial seleccionada

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser.id) {
      fetch(`${API_URL}/api/perfil/${storedUser.id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error al obtener el perfil");
          }
          return res.json();
        })
        .then((data) => {
          setPerfil(data.usuario);
          setAhorros(data.ahorros);
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

  // 📌 Función para abrir el modal con la imagen seleccionada
  const abrirModal = (credencialUrl) => {
    setCredencialSeleccionada(credencialUrl);
    setModalOpen(true);
  };

  // 📌 Función para cerrar el modal
  const cerrarModal = () => {
    setModalOpen(false);
    setCredencialSeleccionada(null);
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!perfil) return <p>No se encontró información del usuario.</p>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-teal-200 to-teal-300 rounded-lg shadow-lg text-center font-sans">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Perfil del Cliente</h2>

      <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg mb-8">
        {perfil.fotoPerfil ? (
          <img src={perfil.fotoPerfil} alt="Foto de perfil" className="w-36 h-36 rounded-full object-cover mb-4 border-4 border-teal-500" />
        ) : (
          <FaUserCircle className="text-teal-600 text-6xl mb-4" />
        )}
        
        <div className="text-lg text-gray-700">
          <p><strong>Nombre:</strong> {perfil.nombre} {perfil.apellidos}</p>
          <p><strong>Correo:</strong> {perfil.correo}</p>
          <p><strong>Teléfono:</strong> {perfil.telefono || "No registrado"}</p>
        </div>
      </div>

      {/* 📌 Apartado de Credencial de Elector */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl text-gray-800 mb-4">📌 Credencial de Elector</h3>
        {ahorros.length > 0 && ahorros[0].credencial ? (
          <button className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700" onClick={() => abrirModal(ahorros[0].credencial)}>
            📄 Ver Credencial
          </button>
        ) : (
          <p className="text-gray-500 flex items-center justify-center">
            <FaIdCard className="text-teal-600 mr-2" /> No has subido una credencial.
          </p>
        )}
      </div>

      {/* 📌 Modal de Credencial Ampliada */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={cerrarModal}>
          <div className="bg-white p-4 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-2xl text-red-500 hover:text-red-700" onClick={cerrarModal}><FaTimes /></button>
            <img src={credencialSeleccionada} alt="Credencial Ampliada" className="w-full max-w-2xl h-auto rounded-lg" />
          </div>
        </div>
      )}

      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Mis Ahorros</h3>
      {ahorros.length === 0 ? (
        <p>No tienes ahorros registrados.</p>
      ) : (
        <ul className="space-y-4">
          {ahorros.map((ahorro) => (
            <li key={ahorro._id} className="p-4 bg-white rounded-lg shadow-md">
              <p><strong>Monto:</strong> ${ahorro.monto}</p>
              <p><strong>Frecuencia:</strong> {ahorro.tipo}</p>
              <p><strong>Fecha de Inicio:</strong> {new Date(ahorro.fechaInicio).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PerfilCliente;
