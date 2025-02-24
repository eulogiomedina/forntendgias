import React, { useEffect, useState } from "react";
import "../styles/PerfilCliente.css";
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
    <div className="perfil-container">
      <h2>Perfil del Cliente</h2>

      <div className="perfil-info">
        {perfil.fotoPerfil ? (
          <img src={perfil.fotoPerfil} alt="Foto de perfil" className="foto-perfil" />
        ) : (
          <FaUserCircle className="icono-usuario" />
        )}

        <div className="info-texto">
          <p><strong>Nombre:</strong> {perfil.nombre} {perfil.apellidos}</p>
          <p><strong>Correo:</strong> {perfil.correo}</p>
          <p><strong>Teléfono:</strong> {perfil.telefono || "No registrado"}</p>
        </div>
      </div>

      {/* 📌 Apartado de Credencial de Elector */}
      <div className="credencial-container">
        <h3>📌 Credencial de Elector</h3>
        {ahorros.length > 0 && ahorros[0].credencial ? (
          <button className="btn-ver-credencial" onClick={() => abrirModal(ahorros[0].credencial)}>
            📄 Ver Credencial
          </button>
        ) : (
          <p className="mensaje-no-credencial">
            <FaIdCard className="icono-credencial" /> No has subido una credencial.
          </p>
        )}
      </div>

      {/* 📌 Modal de Credencial Ampliada */}
      {modalOpen && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar-modal" onClick={cerrarModal} tabIndex="-1">
              <FaTimes />
            </button>
            <img src={credencialSeleccionada} alt="Credencial Ampliada" className="imagen-ampliada" />
          </div>
        </div>
      )}

      <h3>Mis Ahorros</h3>
      {ahorros.length === 0 ? (
        <p>No tienes ahorros registrados.</p>
      ) : (
        <ul className="lista-ahorros">
          {ahorros.map((ahorro) => (
            <li key={ahorro._id} className="ahorro-item">
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
