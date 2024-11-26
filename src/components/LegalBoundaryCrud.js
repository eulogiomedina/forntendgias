import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import '../styles/legalBoundary.css';

const LegalBoundaryCrud = () => {
  const [legalBoundaries, setLegalBoundaries] = useState([]); // Lista de deslindes
  const [newLegalBoundary, setNewLegalBoundary] = useState({ title: '', content: '' }); // Nuevo deslinde
  const [historyLegalBoundaries, setHistoryLegalBoundaries] = useState([]); // Historial con eliminados
  const [editingLegalBoundary, setEditingLegalBoundary] = useState(null); // Deslinde en edición
  const [showLegalBoundaries, setShowLegalBoundaries] = useState(false); // Controla la visibilidad de los deslindes
  const [showHistory, setShowHistory] = useState(false); // Controla la visibilidad del historial de deslindes
  const [errorMessage, setErrorMessage] = useState(''); // Mensaje de error

  useEffect(() => {
    fetchLegalBoundaries(); // Cargar todos los deslindes al montar el componente
  }, []);

  // Obtener todos los deslindes y ordenarlos
  const fetchLegalBoundaries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/legal-boundaries`);
      const allLegalBoundaries = response.data;

      // Filtrar deslindes no eliminados
      const sortedLegalBoundaries = allLegalBoundaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const filteredLegalBoundaries = sortedLegalBoundaries.filter((boundary) => !boundary.isDeleted);

      // Identificar el deslinde vigente (última versión no eliminada)
      const latestLegalBoundary = filteredLegalBoundaries.find((boundary) => !boundary.isDeleted);
      if (latestLegalBoundary) {
        latestLegalBoundary.isCurrent = true; // Marca la última versión como vigente
      }

      setLegalBoundaries(filteredLegalBoundaries);
      setHistoryLegalBoundaries(sortedLegalBoundaries);
    } catch (error) {
      console.error('Error al obtener los deslindes legales:', error);
    }
  };

  // Validación para evitar etiquetas HTML maliciosas
  const containsHTMLTags = (str) => {
    const regex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    return regex.test(str);
  };

  // Crear nuevo deslinde legal con validación
  const handleCreateLegalBoundary = async () => {
    if (!newLegalBoundary.title || !newLegalBoundary.content) {
      setErrorMessage('Título y contenido no pueden estar vacíos');
      return;
    }
    if (containsHTMLTags(newLegalBoundary.title) || containsHTMLTags(newLegalBoundary.content)) {
      setErrorMessage('El título o contenido contienen etiquetas no permitidas');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/legal-boundaries`, newLegalBoundary);
      setNewLegalBoundary({ title: '', content: '' });
      setErrorMessage('');
      fetchLegalBoundaries();
    } catch (error) {
      console.error('Error al crear el deslinde legal:', error);
    }
  };

  // Editar deslinde legal existente con validación
  const handleSaveLegalBoundary = async () => {
    if (!editingLegalBoundary || !editingLegalBoundary.title || !editingLegalBoundary.content) {
      setErrorMessage('Título y contenido no pueden estar vacíos');
      return;
    }
    if (containsHTMLTags(editingLegalBoundary.title) || containsHTMLTags(editingLegalBoundary.content)) {
      setErrorMessage('El título o contenido contienen etiquetas no permitidas');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/legal-boundaries/${editingLegalBoundary._id}`, editingLegalBoundary);
      setEditingLegalBoundary(null);
      setErrorMessage('');
      fetchLegalBoundaries();
    } catch (error) {
      console.error('Error al guardar el deslinde legal:', error.response ? error.response.data : error.message);
    }
  };

  // Eliminar deslinde legal lógicamente
  const handleDeleteLegalBoundary = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/legal-boundaries/delete/${id}`);
      fetchLegalBoundaries();
    } catch (error) {
      console.error('Error al eliminar el deslinde legal:', error);
    }
  };

  // Restaurar deslinde legal eliminado
  const handleRestoreLegalBoundary = async (id) => {
    try {
      await axios.put(`${API_URL}/api/legal-boundaries/restore/${id}`);
      fetchLegalBoundaries();
    } catch (error) {
      console.error('Error al restaurar el deslinde legal:', error);
    }
  };

  return (
    <div className="legal-boundary-crud-container">
      <h2>Gestionar Deslindes Legales</h2>

      {/* Mensaje de error */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Crear nuevo deslinde legal */}
      <div className="card">
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

      {/* Mostrar deslindes existentes */}
      <button onClick={() => setShowLegalBoundaries(true)}>Ir a Deslindes Existentes</button>

      {showLegalBoundaries && (
        <div className="card">
          <h3>Deslindes legales existentes</h3>
          <ul>
            {legalBoundaries.map((boundary) => (
              <li key={boundary._id}>
                {editingLegalBoundary && editingLegalBoundary._id === boundary._id ? (
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
                    <button onClick={handleSaveLegalBoundary}>Guardar</button>
                    <button onClick={() => setEditingLegalBoundary(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <h4>
                      {boundary.title} {boundary.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}
                    </h4>
                    <p>{boundary.content}</p>
                    <p>Versión: {boundary.version || 1}</p>
                    <p>Fecha de creación: {new Date(boundary.createdAt).toLocaleString()}</p>
                    <button onClick={() => setEditingLegalBoundary(boundary)}>Editar</button>
                    <button onClick={() => handleDeleteLegalBoundary(boundary._id)}>Eliminar</button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => setShowLegalBoundaries(false)}>Regresar</button>
        </div>
      )}

      {/* Mostrar historial de deslindes legales */}
      <button onClick={() => setShowHistory(true)}>Ir al Historial de Deslindes Legales</button>

      {showHistory && (
        <div className="card">
          <h3>Historial de Deslindes Legales</h3>
          <ul>
            {historyLegalBoundaries.map((boundary) => (
              <li key={boundary._id}>
                <h4>
                  {boundary.title}{' '}
                  {boundary.isDeleted ? <span>(Eliminado)</span> : boundary.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}
                </h4>
                <p>{boundary.content}</p>
                <p>Versión: {boundary.version || 1}</p>
                <p>Fecha de creación: {new Date(boundary.createdAt).toLocaleString()}</p>
                {boundary.isDeleted && (
                  <button onClick={() => handleRestoreLegalBoundary(boundary._id)}>Restaurar</button>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => setShowHistory(false)}>Regresar</button>
        </div>
      )}
    </div>
  );
};

export default LegalBoundaryCrud;