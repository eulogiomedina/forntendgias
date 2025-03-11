import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig'; 


const TermsCrud = () => {
  const [terms, setTerms] = useState([]); // Lista de términos
  const [newTerm, setNewTerm] = useState({ title: '', content: '' }); // Nuevo término
  const [historyTerms, setHistoryTerms] = useState([]); // Historial con eliminados
  const [editingTerm, setEditingTerm] = useState(null); // Término en edición
  const [showTerms, setShowTerms] = useState(false); // Controla la visibilidad de los términos
  const [showHistory, setShowHistory] = useState(false); // Controla la visibilidad del historial de términos
  const [errorMessage, setErrorMessage] = useState(''); // Mensaje de error

  useEffect(() => {
    fetchTerms(); // Cargar todos los términos al montar el componente
  }, []);

  // Obtener todos los términos y ordenarlos
  const fetchTerms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/terms`);
      const allTerms = response.data;

      // Filtrar términos no eliminados
      const sortedTerms = allTerms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const filteredTerms = sortedTerms.filter((term) => !term.isDeleted);

      // Identificar el término vigente (última versión no eliminada)
      const latestTerm = filteredTerms.find((term) => !term.isDeleted);
      if (latestTerm) {
        latestTerm.isCurrent = true; // Marca la última versión como vigente
      }

      setTerms(filteredTerms);
      setHistoryTerms(sortedTerms);
    } catch (error) {
      console.error('Error al obtener los términos:', error);
    }
  };

  // Validación para evitar etiquetas HTML maliciosas
  const containsHTMLTags = (str) => {
    const regex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    return regex.test(str);
  };

  // Crear nuevo término con validación
  const handleCreateTerm = async () => {
    if (!newTerm.title || !newTerm.content) {
      setErrorMessage('Título y contenido no pueden estar vacíos');
      return;
    }
    if (containsHTMLTags(newTerm.title) || containsHTMLTags(newTerm.content)) {
      setErrorMessage('El título o contenido contienen etiquetas no permitidas');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/terms`, newTerm);
      setNewTerm({ title: '', content: '' });
      setErrorMessage('');
      fetchTerms();
    } catch (error) {
      console.error('Error al crear el término:', error);
    }
  };

  // Editar término existente con validación
  const handleSaveTerm = async () => {
    if (!editingTerm || !editingTerm.title || !editingTerm.content) {
      setErrorMessage('Título y contenido no pueden estar vacíos');
      return;
    }
    if (containsHTMLTags(editingTerm.title) || containsHTMLTags(editingTerm.content)) {
      setErrorMessage('El título o contenido contienen etiquetas no permitidas');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/terms/${editingTerm._id}`, editingTerm);
      setEditingTerm(null);
      setErrorMessage('');
      fetchTerms();
    } catch (error) {
      console.error('Error al guardar el término:', error.response ? error.response.data : error.message);
    }
  };

  // Eliminar término lógicamente
  const handleDeleteTerm = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/terms/delete/${id}`);
      fetchTerms();
    } catch (error) {
      console.error('Error al eliminar el término:', error);
    }
  };

  // Restaurar término eliminado
  const handleRestoreTerm = async (id) => {
    try {
      await axios.put(`${API_URL}/api/terms/restore/${id}`);
      fetchTerms();
    } catch (error) {
      console.error('Error al restaurar el término:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">
        Gestionar Términos y Condiciones
      </h2>

      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

      {/* Crear nuevo término */}
      <div className="space-y-6 p-4 bg-gray-100 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800">Crear nuevo término</h3>
        <input
          type="text"
          placeholder="Título"
          value={newTerm.title}
          onChange={(e) => setNewTerm({ ...newTerm, title: e.target.value })}
          className="input input-bordered w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Contenido"
          value={newTerm.content}
          onChange={(e) => setNewTerm({ ...newTerm, content: e.target.value })}
          className="textarea textarea-bordered w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreateTerm}
          className="btn btn-primary w-full py-3"
        >
          Crear
        </button>
      </div>

      {/* Mostrar términos existentes */}
      <button
        onClick={() => setShowTerms(true)}
        className="btn btn-secondary w-full py-3 mt-6"
      >
        Ir a Términos Existentes
      </button>

      {showTerms && (
        <div className="space-y-6 p-4 bg-gray-100 rounded-lg shadow-md mt-6">
          <h3 className="text-xl font-semibold text-gray-800">Términos existentes</h3>
          <ul>
            {terms.map((term) => (
              <li key={term._id} className="border-b py-4">
                {editingTerm && editingTerm._id === term._id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingTerm.title}
                      onChange={(e) => setEditingTerm({ ...editingTerm, title: e.target.value })}
                      className="input input-bordered w-full p-4"
                    />
                    <textarea
                      value={editingTerm.content}
                      onChange={(e) => setEditingTerm({ ...editingTerm, content: e.target.value })}
                      className="textarea textarea-bordered w-full p-4"
                    />
                    <button
                      onClick={handleSaveTerm}
                      className="btn btn-primary w-full py-3 mt-4"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingTerm(null)}
                      className="btn btn-secondary w-full py-3 mt-4"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-800">
                      {term.title} {term.isCurrent ? <span className="text-green-500">(Vigente)</span> : <span className="text-gray-500">(No Vigente)</span>}
                    </h4>
                    <p className="text-gray-700">{term.content}</p>
                    <p className="text-sm text-gray-500">Versión: {term.version || 1}</p>
                    <p className="text-sm text-gray-500">Fecha de creación: {new Date(term.createdAt).toLocaleString()}</p>
                    <div className="space-x-4">
                      <button
                        onClick={() => setEditingTerm(term)}
                        className="btn btn-warning"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteTerm(term._id)}
                        className="btn btn-danger"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowTerms(false)}
            className="btn btn-secondary w-full py-3 mt-6"
          >
            Regresar
          </button>
        </div>
      )}

      {/* Mostrar historial de términos */}
      <button
        onClick={() => setShowHistory(true)}
        className="btn btn-secondary w-full py-3 mt-6"
      >
        Ir al Historial de Términos
      </button>

      {showHistory && (
        <div className="space-y-6 p-4 bg-gray-100 rounded-lg shadow-md mt-6">
          <h3 className="text-xl font-semibold text-gray-800">Historial de Términos</h3>
          <ul>
            {historyTerms.map((term) => (
              <li key={term._id} className="border-b py-4">
                <h4 className="text-xl font-semibold text-gray-800">
                  {term.title} {term.isDeleted ? <span className="text-red-500">(Eliminado)</span> : term.isCurrent ? <span className="text-green-500">(Vigente)</span> : <span className="text-gray-500">(No Vigente)</span>}
                </h4>
                <p className="text-gray-700">{term.content}</p>
                <p className="text-sm text-gray-500">Versión: {term.version || 1}</p>
                <p className="text-sm text-gray-500">Fecha de creación: {new Date(term.createdAt).toLocaleString()}</p>
                {term.isDeleted && (
                  <button
                    onClick={() => handleRestoreTerm(term._id)}
                    className="btn btn-success mt-4"
                  >
                    Restaurar
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowHistory(false)}
            className="btn btn-secondary w-full py-3 mt-6"
          >
            Regresar
          </button>
        </div>
      )}
    </div>
  );
};

export default TermsCrud;
