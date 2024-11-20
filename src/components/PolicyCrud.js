import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import '../styles/policy.css';

const PolicyCrud = () => {
  const [policies, setPolicies] = useState([]); // Lista de políticas
  const [newPolicy, setNewPolicy] = useState({ title: '', content: '' }); // Nueva política
  const [editingPolicy, setEditingPolicy] = useState(null); // Política en edición
  const [showPolicies, setShowPolicies] = useState(false); // Controla la visibilidad de las políticas
  const [showHistory, setShowHistory] = useState(false); // Controla la visibilidad del historial de políticas

  useEffect(() => {
    fetchPolicies(); // Cargar todas las políticas al montar el componente
  }, []);

  // Obtener todas las políticas y ordenarlas
// Obtener todas las políticas, incluyendo las eliminadas para el historial
  const fetchPolicies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/policies`);
      const sortedPolicies = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (sortedPolicies.length > 0) {
        sortedPolicies[0].isCurrent = true;
      }

      for (let i = 1; i < sortedPolicies.length; i++) {
        sortedPolicies[i].isCurrent = false;
      }

      setPolicies(sortedPolicies); // Guardar las políticas ordenadas en el estado
    } catch (error) {
      console.error('Error al obtener las políticas:', error);
    }
  };


  // Crear nueva política
  const handleCreatePolicy = async () => {
    if (!newPolicy.title || !newPolicy.content) {
      console.error('Título y contenido no pueden estar vacíos');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/policies`, newPolicy); // Crear política en el backend
      setNewPolicy({ title: '', content: '' }); // Reiniciar los campos del formulario
      fetchPolicies(); // Recargar las políticas
    } catch (error) {
      console.error('Error al crear la política:', error);
    }
  };

  // Editar una política existente
  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy); // Poner la política en modo edición
  };

  // Guardar los cambios en una nueva versión de la política editada
  const handleSavePolicy = async () => {
    if (!editingPolicy || !editingPolicy.title || !editingPolicy.content) {
      console.error('Título y contenido no pueden estar vacíos');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/policies/${editingPolicy._id}`, editingPolicy); // Actualizar la política
      setEditingPolicy(null); // Salir del modo edición
      fetchPolicies(); // Recargar las políticas
    } catch (error) {
      console.error('Error al guardar la nueva versión de la política:', error.response ? error.response.data : error.message);
    }
  };

// Eliminar una política lógicamente
  const handleDeletePolicy = async (id) => {
    try {
      // Llamar a la API para eliminar lógicamente la política usando DELETE
      await axios.delete(`${API_URL}/api/policies/delete/${id}`);
      fetchPolicies(); // Recargar las políticas
    } catch (error) {
      console.error('Error al eliminar la política:', error);
    }
  };

  // Restaurar una política eliminada
  // Restaurar una política eliminada
  const handleRestorePolicy = async (id) => { 
    try {
      await axios.put(`${API_URL}/api/policies/restore/${id}`);
      fetchPolicies(); // Recargar las políticas
    } catch (error) {
      console.error('Error al restaurar la política:', error);
    }
  };


  // Función para manejar el click en el botón "Ir" de Políticas existentes
  const handleShowPolicies = () => {
    setShowPolicies(true); // Hacer visibles las políticas
  };

  // Función para manejar el click en el botón "Regresar" de Políticas existentes
  const handleHidePolicies = () => {
    setShowPolicies(false); // Ocultar las políticas
  };

  // Función para manejar el click en el botón "Ir" del Historial de Políticas
  const handleShowHistory = () => {
    setShowHistory(true); // Hacer visibles el historial
  };

  // Función para manejar el click en el botón "Regresar" del Historial de Políticas
  const handleHideHistory = () => {
    setShowHistory(false); // Ocultar el historial
  };

  return (
    <div className="policy-crud-container">
      <h2>Gestionar Políticas</h2>

      {/* Tarjeta para Crear nueva política */}
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

      {/* Botón para mostrar las políticas existentes */}
      <button onClick={handleShowPolicies}>Ir a Políticas Existentes</button>

      {/* Políticas existentes */}
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
                    <button onClick={handleSavePolicy}>Guardar nueva versión</button>
                    <button onClick={() => setEditingPolicy(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <h4>{policy.title} {policy.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}</h4>
                    <p>{policy.content}</p>
                    <p>Versión: {policy.version || 1}</p>
                    <p>Fecha de creación: {new Date(policy.createdAt).toLocaleString()}</p>
                    <button onClick={() => handleEditPolicy(policy)}>Editar</button>
                    {policy.isDeleted ? (
                      <button onClick={() => handleRestorePolicy(policy._id)}>Restaurar</button>
                    ) : (
                      <button onClick={() => handleDeletePolicy(policy._id)}>Eliminar</button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
          <button onClick={handleHidePolicies}>Regresar</button>
        </div>
      )}

      {/* Botón para mostrar el historial de políticas */}
      <button onClick={handleShowHistory}>Ir al Historial de Políticas</button>

      {/* Historial de políticas */}
      {showHistory && (
        <div className="card">
          <h3>Historial de Políticas</h3>
          <p>Aquí puedes ver el historial de todas las versiones de políticas previas.</p>
          <ul>
            {policies.map((policy) => (
              <li key={policy._id}>
                <h4>{policy.title} {policy.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}</h4>
                <p>{policy.content}</p>
                <p>Versión: {policy.version || 1}</p>
                <p>Fecha de creación: {new Date(policy.createdAt).toLocaleString()}</p>
                {policy.isDeleted && (
                  <button onClick={() => handleRestorePolicy(policy._id)}>Restaurar</button>
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

export default PolicyCrud;



