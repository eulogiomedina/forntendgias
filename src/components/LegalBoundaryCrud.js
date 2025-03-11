import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';

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
    <div className="legal-boundary-crud-container p-6 bg-gray-50 rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Gestionar Deslindes Legales</h2>

      {/* Mensaje de error */}
      {errorMessage && <div className="error-message text-red-500 font-bold mb-4 p-2 border border-red-500 bg-red-100">{errorMessage}</div>}

      {/* Crear nuevo deslinde legal */}
      <div className="card p-4 mb-6 bg-white shadow-lg rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Crear nuevo deslinde legal</h3>
        <input
          type="text"
          placeholder="Título"
          className="w-full p-2 border rounded mb-4"
          value={newLegalBoundary.title}
          onChange={(e) => setNewLegalBoundary({ ...newLegalBoundary, title: e.target.value })}
        />
        <textarea
          placeholder="Contenido"
          className="w-full p-2 border rounded mb-4"
          value={newLegalBoundary.content}
          onChange={(e) => setNewLegalBoundary({ ...newLegalBoundary, content: e.target.value })}
        />
        <button onClick={handleCreateLegalBoundary} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Crear</button>
      </div>

      {/* Mostrar deslindes existentes */}
      <button onClick={() => setShowLegalBoundaries(true)} className="w-full bg-green-500 text-white py-2 rounded mb-4 hover:bg-green-600">Ir a Deslindes Existentes</button>

      {showLegalBoundaries && (
        <div className="card p-4 mb-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Deslindes legales existentes</h3>
          <ul>
            {legalBoundaries.map((boundary) => (
              <li key={boundary._id} className="border-b border-gray-200 py-4">
                {editingLegalBoundary && editingLegalBoundary._id === boundary._id ? (
                  <>
                    <input
                      type="text"
                      className="w-full p-2 border rounded mb-4"
                      value={editingLegalBoundary.title}
                      onChange={(e) => setEditingLegalBoundary({ ...editingLegalBoundary, title: e.target.value })}
                    />
                    <textarea
                      className="w-full p-2 border rounded mb-4"
                      value={editingLegalBoundary.content}
                      onChange={(e) => setEditingLegalBoundary({ ...editingLegalBoundary, content: e.target.value })}
                    />
                    <button onClick={handleSaveLegalBoundary} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Guardar</button>
                    <button onClick={() => setEditingLegalBoundary(null)} className="w-full bg-gray-400 text-white py-2 rounded mt-4 hover:bg-gray-500">Cancelar</button>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold">{boundary.title} {boundary.isCurrent ? <span className="text-green-500">(Vigente)</span> : <span className="text-gray-500">(No Vigente)</span>}</h4>
                    <p>{boundary.content}</p>
                    <p>Versión: {boundary.version || 1}</p>
                    <p>Fecha de creación: {new Date(boundary.createdAt).toLocaleString()}</p>
                    <div className="flex space-x-4 mt-4">
                      <button onClick={() => setEditingLegalBoundary(boundary)} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Editar</button>
                      <button onClick={() => handleDeleteLegalBoundary(boundary._id)} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">Eliminar</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => setShowLegalBoundaries(false)} className="w-full bg-gray-400 text-white py-2 rounded mt-4 hover:bg-gray-500">Regresar</button>
        </div>
      )}

      {/* Mostrar historial de deslindes legales */}
      <button onClick={() => setShowHistory(true)} className="w-full bg-yellow-500 text-white py-2 rounded mb-4 hover:bg-yellow-600">Ir al Historial de Deslindes Legales</button>

      {showHistory && (
        <div className="card p-4 mb-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Historial de Deslindes Legales</h3>
          <ul>
            {historyLegalBoundaries.map((boundary) => (
              <li key={boundary._id} className="border-b border-gray-200 py-4">
                <h4 className="text-lg font-semibold">{boundary.title} {boundary.isDeleted ? <span className="text-red-500">(Eliminado)</span> : boundary.isCurrent ? <span className="text-green-500">(Vigente)</span> : <span className="text-gray-500">(No Vigente)</span>}</h4>
                <p>{boundary.content}</p>
                <p>Versión: {boundary.version || 1}</p>
                <p>Fecha de creación: {new Date(boundary.createdAt).toLocaleString()}</p>
                {boundary.isDeleted && (
                  <button onClick={() => handleRestoreLegalBoundary(boundary._id)} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Restaurar</button>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => setShowHistory(false)} className="w-full bg-gray-400 text-white py-2 rounded mt-4 hover:bg-gray-500">Regresar</button>
        </div>
      )}
    </div>
  );
};

export default LegalBoundaryCrud;
