import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import '../styles/policy.css';

const PolicyCrud = () => {
  const [policies, setPolicies] = useState([]); // Lista de políticas
  const [newPolicy, setNewPolicy] = useState({ title: '', content: '' }); // Nueva política
  const [historyPolicies, setHistoryPolicies] = useState([]); // Historial con eliminadas
  const [editingPolicy, setEditingPolicy] = useState(null); // Política en edición
  const [showPolicies, setShowPolicies] = useState(false); // Controla la visibilidad de las políticas
  const [showHistory, setShowHistory] = useState(false); // Controla la visibilidad del historial de políticas
  const [errorMessage, setErrorMessage] = useState(''); // Mensaje de error

  useEffect(() => {
    fetchPolicies(); // Cargar todas las políticas al montar el componente
  }, []);

  // Obtener todas las políticas y ordenarlas
  const fetchPolicies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/policies`);
      const allPolicies = response.data;

      // Filtrar políticas no eliminadas
      const sortedPolicies = allPolicies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const filteredPolicies = sortedPolicies.filter((policy) => !policy.isDeleted);

      // Identificar la política vigente (última versión no eliminada)
      const latestPolicy = filteredPolicies.find((policy) => !policy.isDeleted);
      if (latestPolicy) {
        latestPolicy.isCurrent = true; // Marca la última versión como vigente
      }

      setPolicies(filteredPolicies);
      setHistoryPolicies(sortedPolicies);
    } catch (error) {
      console.error('Error al obtener las políticas:', error);
    }
  };

  // Validación para evitar etiquetas HTML maliciosas
  const containsHTMLTags = (str) => {
    const regex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    return regex.test(str);
  };

  // Crear nueva política con validación
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

  // Editar política existente con validación
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

  // Eliminar política lógicamente
  const handleDeletePolicy = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/policies/delete/${id}`);
      fetchPolicies();
    } catch (error) {
      console.error('Error al eliminar la política:', error);
    }
  };

  // Restaurar política eliminada
  const handleRestorePolicy = async (id) => {
    try {
      await axios.put(`${API_URL}/api/policies/restore/${id}`);
      fetchPolicies();
    } catch (error) {
      console.error('Error al restaurar la política:', error);
    }
  };

  return (
    <div className="policy-crud-container">
      <h2>Gestionar Políticas</h2>

      {/* Mensaje de error */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Crear nueva política */}
      <div className="card">
        <h3>Crear nueva política</h3>
        <input
          type="text"
          placeholder="Título"
          value={newPolicy.title}
          onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
        />
        <textarea
          placeholder="Contenido"
          value={newPolicy.content}
          onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
        />
        <button onClick={handleCreatePolicy}>Crear</button>
      </div>

      {/* Mostrar políticas existentes */}
      <button onClick={() => setShowPolicies(true)}>Ir a Políticas Existentes</button>

      {showPolicies && (
        <div className="card">
          <h3>Políticas existentes</h3>
          <ul>
            {policies.map((policy) => (
              <li key={policy._id}>
                {editingPolicy && editingPolicy._id === policy._id ? (
                  <>
                    <input
                      type="text"
                      value={editingPolicy.title}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                    />
                    <textarea
                      value={editingPolicy.content}
                      onChange={(e) => setEditingPolicy({ ...editingPolicy, content: e.target.value })}
                    />
                    <button onClick={handleSavePolicy}>Guardar</button>
                    <button onClick={() => setEditingPolicy(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <h4>
                      {policy.title} {policy.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}
                    </h4>
                    <p>{policy.content}</p>
                    <p>Versión: {policy.version || 1}</p>
                    <p>Fecha de creación: {new Date(policy.createdAt).toLocaleString()}</p>
                    <button onClick={() => setEditingPolicy(policy)}>Editar</button>
                    <button onClick={() => handleDeletePolicy(policy._id)}>Eliminar</button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => setShowPolicies(false)}>Regresar</button>
        </div>
      )}

      {/* Mostrar historial de políticas */}
      <button onClick={() => setShowHistory(true)}>Ir al Historial de Políticas</button>

      {showHistory && (
        <div className="card">
          <h3>Historial de Políticas</h3>
          <ul>
            {historyPolicies.map((policy) => (
              <li key={policy._id}>
                <h4>
                  {policy.title}{' '}
                  {policy.isDeleted ? <span>(Eliminada)</span> : policy.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}
                </h4>
                <p>{policy.content}</p>
                <p>Versión: {policy.version || 1}</p>
                <p>Fecha de creación: {new Date(policy.createdAt).toLocaleString()}</p>
                {policy.isDeleted && (
                  <button onClick={() => handleRestorePolicy(policy._id)}>Restaurar</button>
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

export default PolicyCrud;