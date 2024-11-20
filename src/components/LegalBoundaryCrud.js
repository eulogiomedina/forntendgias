import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import '../styles/legalBoundary.css';

const LegalBoundaryCrud = () => {
  const [legalBoundaries, setLegalBoundaries] = useState([]); // Lista de deslindes legales
  const [newLegalBoundary, setNewLegalBoundary] = useState({ title: '', content: '' }); // Nuevo deslinde legal
  const [editingLegalBoundary, setEditingLegalBoundary] = useState(null); // Deslinde en edición
  const [showLegalBoundaries, setShowLegalBoundaries] = useState(false); // Controla la visibilidad de los deslindes
  const [showHistory, setShowHistory] = useState(false); // Controla la visibilidad del historial de deslindes

  useEffect(() => {
    fetchLegalBoundaries(); // Cargar todos los deslindes al montar el componente
  }, []);

  // Obtener todos los deslindes legales
  const fetchLegalBoundaries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/legal-boundaries`);
      const sortedLegalBoundaries = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (sortedLegalBoundaries.length > 0) {
        sortedLegalBoundaries[0].isCurrent = true;
      }

      for (let i = 1; i < sortedLegalBoundaries.length; i++) {
        sortedLegalBoundaries[i].isCurrent = false;
      }

      setLegalBoundaries(sortedLegalBoundaries); // Guardar los deslindes en el estado
    } catch (error) {
      console.error('Error al obtener los deslindes legales:', error);
    }
  };

  // Crear nuevo deslinde legal
  const handleCreateLegalBoundary = async () => {
    if (!newLegalBoundary.title || !newLegalBoundary.content) {
      console.error('Título y contenido no pueden estar vacíos');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/legal-boundaries`, newLegalBoundary); // Crear deslinde en el backend
      setNewLegalBoundary({ title: '', content: '' }); // Reiniciar los campos del formulario
      fetchLegalBoundaries(); // Recargar los deslindes
    } catch (error) {
      console.error('Error al crear el deslinde legal:', error);
    }
  };

  // Editar un deslinde legal existente
  const handleEditLegalBoundary = (legalBoundary) => {
    setEditingLegalBoundary(legalBoundary); // Poner el deslinde en modo edición
  };

  // Guardar los cambios en una nueva versión del deslinde editado
  const handleSaveLegalBoundary = async () => {
    if (!editingLegalBoundary || !editingLegalBoundary.title || !editingLegalBoundary.content) {
      console.error('Título y contenido no pueden estar vacíos');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/legal-boundaries/${editingLegalBoundary._id}`, editingLegalBoundary); // Actualizar el deslinde
      setEditingLegalBoundary(null); // Salir del modo de edición
      fetchLegalBoundaries(); // Recargar los deslindes
    } catch (error) {
      console.error('Error al guardar la nueva versión del deslinde legal:', error.response ? error.response.data : error.message);
    }
  };

  // Eliminar un deslinde legal lógicamente
  const handleDeleteLegalBoundary = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/legal-boundaries/delete/${id}`); // Eliminar deslinde lógicamente
      fetchLegalBoundaries(); // Recargar los deslindes
    } catch (error) {
      console.error('Error al eliminar el deslinde legal:', error);
    }
  };

  // Restaurar un deslinde legal eliminado
  const handleRestoreLegalBoundary = async (id) => {
    try {
      await axios.put(`${API_URL}/api/legal-boundaries/restore/${id}`);
      fetchLegalBoundaries(); // Recargar los deslindes
    } catch (error) {
      console.error('Error al restaurar el deslinde legal:', error);
    }
  };

  // Función para manejar el click en el botón "Ir" de Deslindes legales existentes
  const handleShowLegalBoundaries = () => {
    setShowLegalBoundaries(true); // Hacer visibles los deslindes legales
  };

  // Función para manejar el click en el botón "Regresar" de Deslindes legales existentes
  const handleHideLegalBoundaries = () => {
    setShowLegalBoundaries(false); // Ocultar los deslindes legales
  };

  // Función para manejar el click en el botón "Ir" del Historial de Deslindes
  const handleShowHistory = () => {
    setShowHistory(true); // Hacer visibles el historial de deslindes legales
  };

  // Función para manejar el click en el botón "Regresar" del Historial de Deslindes
  const handleHideHistory = () => {
    setShowHistory(false); // Ocultar el historial
  };

  return (
    <div className="legal-boundary-crud-container">
      <h2>Gestionar Deslindes Legales</h2>

      {/* Tarjeta para Crear nuevo deslinde legal */}
      <div>
        <h3>Crear nuevo deslinde legal</h3>
        <input
          type="text"
          placeholder="Título"
          value={newLegalBoundary.title}
          onChange={(e) => setNewLegalBoundary({ ...newLegalBoundary, title: e.target.value })}
        />
        <textarea
          placeholder="Contenido"
          value={newLegalBoundary.content}
          onChange={(e) => setNewLegalBoundary({ ...newLegalBoundary, content: e.target.value })}
        />
        <button onClick={handleCreateLegalBoundary}>Crear</button>
      </div>

      {/* Botón para mostrar los deslindes legales existentes */}
      <button onClick={handleShowLegalBoundaries}>Ir a Deslindes Existentes</button>

      {/* Deslindes legales existentes */}
      {showLegalBoundaries && (
        <div className="card">
          <h3>Deslindes legales existentes</h3>
          <ul>
            {legalBoundaries.map((legalBoundary) => (
              <li key={legalBoundary._id}>
                {editingLegalBoundary && editingLegalBoundary._id === legalBoundary._id ? (
                  <>
                    <input
                      type="text"
                      value={editingLegalBoundary.title}
                      onChange={(e) => setEditingLegalBoundary({ ...editingLegalBoundary, title: e.target.value })}
                    />
                    <textarea
                      value={editingLegalBoundary.content}
                      onChange={(e) => setEditingLegalBoundary({ ...editingLegalBoundary, content: e.target.value })}
                    />
                    <button onClick={handleSaveLegalBoundary}>Guardar nueva versión</button>
                    <button onClick={() => setEditingLegalBoundary(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <h4>{legalBoundary.title} {legalBoundary.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}</h4>
                    <p>{legalBoundary.content}</p>
                    <p>Versión: {legalBoundary.version || 1}</p>
                    <p>Fecha de creación: {new Date(legalBoundary.createdAt).toLocaleString()}</p>
                    <button onClick={() => handleEditLegalBoundary(legalBoundary)}>Editar</button>
                    {legalBoundary.isDeleted ? (
                      <button onClick={() => handleRestoreLegalBoundary(legalBoundary._id)}>Restaurar</button>
                    ) : (
                      <button onClick={() => handleDeleteLegalBoundary(legalBoundary._id)}>Eliminar</button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
          <button onClick={handleHideLegalBoundaries}>Regresar</button>
        </div>
      )}

      {/* Botón para mostrar el historial de deslindes legales */}
      <button onClick={handleShowHistory}>Ir al Historial de Deslindes Legales</button>

      {/* Historial de deslindes legales */}
      {showHistory && (
        <div className="card">
          <h3>Historial de Deslindes Legales</h3>
          <p>Aquí puedes ver el historial de todas las versiones de deslindes previos.</p>
          <ul>
            {legalBoundaries.map((legalBoundary) => (
              <li key={legalBoundary._id}>
                <h4>{legalBoundary.title} {legalBoundary.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}</h4>
                <p>{legalBoundary.content}</p>
                <p>Versión: {legalBoundary.version || 1}</p>
                <p>Fecha de creación: {new Date(legalBoundary.createdAt).toLocaleString()}</p>
                {legalBoundary.isDeleted && (
                  <button onClick={() => handleRestoreLegalBoundary(legalBoundary._id)}>Restaurar</button>
                )}
              </li>
            ))}
          </ul>
          <button onClick={handleHideHistory}>Regresar</button>
        </div>
      )}
    </div>
  );
};

export default LegalBoundaryCrud;

