import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';

const PolicyCrud = () => {
  const [policies, setPolicies] = useState([]);
  const [newPolicy, setNewPolicy] = useState({ title: '', content: '' });
  const [historyPolicies, setHistoryPolicies] = useState([]);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [showPolicies, setShowPolicies] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/policies`);
      const allPolicies = response.data;

      const sortedPolicies = allPolicies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const filteredPolicies = sortedPolicies.filter((policy) => !policy.isDeleted);

      const latestPolicy = filteredPolicies.find((policy) => !policy.isDeleted);
      if (latestPolicy) {
        latestPolicy.isCurrent = true;
      }

      setPolicies(filteredPolicies);
      setHistoryPolicies(sortedPolicies);
    } catch (error) {
      console.error('Error al obtener las políticas:', error);
    }
  };

  const containsHTMLTags = (str) => {
    const regex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    return regex.test(str);
  };

  const handleCreatePolicy = async () => {
    if (!newPolicy.title || !newPolicy.content) {
      setErrorMessage('Título y contenido no pueden estar vacíos');
      return;
    }
    if (containsHTMLTags(newPolicy.title) || containsHTMLTags(newPolicy.content)) {
      setErrorMessage('El título o contenido contienen etiquetas no permitidas');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/policies`, newPolicy);
      setNewPolicy({ title: '', content: '' });
      setErrorMessage('');
      fetchPolicies();
    } catch (error) {
      console.error('Error al crear la política:', error);
    }
  };

  const handleSavePolicy = async () => {
    if (!editingPolicy || !editingPolicy.title || !editingPolicy.content) {
      setErrorMessage('Título y contenido no pueden estar vacíos');
      return;
    }
    if (containsHTMLTags(editingPolicy.title) || containsHTMLTags(editingPolicy.content)) {
      setErrorMessage('El título o contenido contienen etiquetas no permitidas');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/policies/${editingPolicy._id}`, editingPolicy);
      setEditingPolicy(null);
      setErrorMessage('');
      fetchPolicies();
    } catch (error) {
      console.error('Error al guardar la política:', error.response ? error.response.data : error.message);
    }
  };

  const handleDeletePolicy = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/policies/delete/${id}`);
      fetchPolicies();
    } catch (error) {
      console.error('Error al eliminar la política:', error);
    }
  };

  const handleRestorePolicy = async (id) => {
    try {
      await axios.put(`${API_URL}/api/policies/restore/${id}`);
      fetchPolicies();
    } catch (error) {
      console.error('Error al restaurar la política:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Gestionar Políticas</h2>

      {errorMessage && <div className="text-red-600 text-center mb-4">{errorMessage}</div>}

      {/* Crear nueva política */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Crear nueva política</h3>
        <input
          type="text"
          className="w-full p-3 mb-3 border border-gray-300 rounded-md"
          placeholder="Título"
          value={newPolicy.title}
          onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
        />
        <textarea
          className="w-full p-3 mb-3 border border-gray-300 rounded-md"
          placeholder="Contenido"
          value={newPolicy.content}
          onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
        />
        <button
          onClick={handleCreatePolicy}
          className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Crear
        </button>
      </div>

      {/* Mostrar políticas existentes */}
      <button
        onClick={() => setShowPolicies(true)}
        className="mb-4 w-full p-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
      >
        Ir a Políticas Existentes
      </button>

      {showPolicies && (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Políticas existentes</h3>
          <ul>
            {policies.map((policy) => (
              <li key={policy._id} className="mb-4 p-4 bg-white border border-gray-300 rounded-md shadow-sm">
                {editingPolicy && editingPolicy._id === policy._id ? (
                  <>
                    <input
                      type="text"
                      className="w-full p-3 mb-3 border border-gray-300 rounded-md"
                      value={editingPolicy.title}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                    />
                    <textarea
                      className="w-full p-3 mb-3 border border-gray-300 rounded-md"
                      value={editingPolicy.content}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, content: e.target.value })}
                    />
                    <button
                      onClick={handleSavePolicy}
                      className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingPolicy(null)}
                      className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition mt-2"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {policy.title} {policy.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}
                    </h4>
                    <p className="text-gray-600 mb-3">{policy.content}</p>
                    <p className="text-sm text-gray-500">Versión: {policy.version || 1}</p>
                    <p className="text-sm text-gray-500">Fecha de creación: {new Date(policy.createdAt).toLocaleString()}</p>
                    <button
                      onClick={() => setEditingPolicy(policy)}
                      className="p-2 bg-yellow-500 text-white rounded-md mt-2 hover:bg-yellow-600 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy._id)}
                      className="p-2 bg-red-500 text-white rounded-md mt-2 hover:bg-red-600 transition"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowPolicies(false)}
            className="w-full p-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          >
            Regresar
          </button>
        </div>
      )}

      {/* Mostrar historial de políticas */}
      <button
        onClick={() => setShowHistory(true)}
        className="mb-4 w-full p-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
      >
        Ir al Historial de Políticas
      </button>

      {showHistory && (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Historial de Políticas</h3>
          <ul>
            {historyPolicies.map((policy) => (
              <li key={policy._id} className="mb-4 p-4 bg-white border border-gray-300 rounded-md shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800">
                  {policy.title}{' '}
                  {policy.isDeleted ? (
                    <span className="text-red-600">(Eliminada)</span>
                  ) : policy.isCurrent ? (
                    <span className="text-green-600">(Vigente)</span>
                  ) : (
                    <span className="text-yellow-600">(No Vigente)</span>
                  )}
                </h4>
                <p className="text-gray-600 mb-3">{policy.content}</p>
                <p className="text-sm text-gray-500">Versión: {policy.version || 1}</p>
                <p className="text-sm text-gray-500">Fecha de creación: {new Date(policy.createdAt).toLocaleString()}</p>
                {policy.isDeleted && (
                  <button
                    onClick={() => handleRestorePolicy(policy._id)}
                    className="p-2 bg-green-500 text-white rounded-md mt-2 hover:bg-green-600 transition"
                  >
                    Restaurar
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowHistory(false)}
            className="w-full p-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          >
            Regresar
          </button>
        </div>
      )}
    </div>
  );
};

export default PolicyCrud;
