import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import '../styles/terms.css';

const TermsCrud = () => {
  const [terms, setTerms] = useState([]); // Lista de términos
  const [newTerm, setNewTerm] = useState({ title: '', content: '' }); // Nuevo término
  const [editingTerm, setEditingTerm] = useState(null); // Término en edición
  const [showTerms, setShowTerms] = useState(false); // Controla la visibilidad de los términos
  const [showHistory, setShowHistory] = useState(false); // Controla la visibilidad del historial de términos

  useEffect(() => {
    fetchTerms(); // Cargar todos los términos al montar el componente
  }, []);

  // Obtener todos los términos y ordenarlos
  const fetchTerms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/terms`);
      const sortedTerms = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (sortedTerms.length > 0) {
        sortedTerms[0].isCurrent = true;
      }

      for (let i = 1; i < sortedTerms.length; i++) {
        sortedTerms[i].isCurrent = false;
      }

      setTerms(sortedTerms); // Guardar los términos ordenados en el estado
    } catch (error) {
      console.error('Error al obtener los términos:', error);
    }
  };

  // Crear nuevo término
  const handleCreateTerm = async () => {
    if (!newTerm.title || !newTerm.content) {
      console.error('Título y contenido no pueden estar vacíos');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/terms`, newTerm); // Crear término en el backend
      setNewTerm({ title: '', content: '' }); // Reiniciar los campos del formulario
      fetchTerms(); // Recargar los términos
    } catch (error) {
      console.error('Error al crear el término:', error);
    }
  };

  // Editar un término existente
  const handleEditTerm = (term) => {
    setEditingTerm(term); // Poner el término en modo edición
  };

  // Guardar los cambios en una nueva versión del término editado
  const handleSaveTerm = async () => {
    if (!editingTerm || !editingTerm.title || !editingTerm.content) {
      console.error('Título y contenido no pueden estar vacíos');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/terms/${editingTerm._id}`, editingTerm); // Actualizar el término
      setEditingTerm(null); // Salir del modo edición
      fetchTerms(); // Recargar los términos
    } catch (error) {
      console.error('Error al guardar la nueva versión del término:', error.response ? error.response.data : error.message);
    }
  };

  // Eliminar un término lógicamente
  const handleDeleteTerm = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/terms/delete/${id}`); // Eliminar lógicamente el término
      fetchTerms(); // Recargar los términos
    } catch (error) {
      console.error('Error al eliminar el término:', error);
    }
  };

  // Restaurar un término eliminado
  const handleRestoreTerm = async (id) => {
    try {
      await axios.put(`${API_URL}/api/terms/restore/${id}`); // Restaurar el término eliminado
      fetchTerms(); // Recargar los términos
    } catch (error) {
      console.error('Error al restaurar el término:', error);
    }
  };

  // Funciones para mostrar u ocultar las secciones
  const handleShowTerms = () => setShowTerms(true);
  const handleHideTerms = () => setShowTerms(false);
  const handleShowHistory = () => setShowHistory(true);
  const handleHideHistory = () => setShowHistory(false);

  return (
    <div className="terms-crud-container">
      <h2>Gestionar Términos y Condiciones</h2>

      {/* Tarjeta para crear un nuevo término */}
      <div className="card">
        <h3>Crear nuevo término</h3>
        <input
          type="text"
          placeholder="Título"
          value={newTerm.title}
          onChange={(e) => setNewTerm({ ...newTerm, title: e.target.value })}
        />
        <textarea
          placeholder="Contenido"
          value={newTerm.content}
          onChange={(e) => setNewTerm({ ...newTerm, content: e.target.value })}
        />
        <button onClick={handleCreateTerm}>Crear</button>
      </div>

      {/* Botones de navegación */}
      <button onClick={handleShowTerms}>Ir a Términos Existentes</button>
      <button onClick={handleShowHistory}>Ir al Historial de Términos</button>

      {/* Listado de términos existentes */}
      {showTerms && (
        <div className="card">
          <h3>Términos existentes</h3>
          <ul>
            {terms.map((term) => (
              <li key={term._id}>
                {editingTerm && editingTerm._id === term._id ? (
                  <>
                    <input
                      type="text"
                      value={editingTerm.title}
                      onChange={(e) => setEditingTerm({ ...editingTerm, title: e.target.value })}
                    />
                    <textarea
                      value={editingTerm.content}
                      onChange={(e) => setEditingTerm({ ...editingTerm, content: e.target.value })}
                    />
                    <button onClick={handleSaveTerm}>Guardar nueva versión</button>
                    <button onClick={() => setEditingTerm(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <h4>{term.title} {term.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}</h4>
                    <p>{term.content}</p>
                    <p>Versión: {term.version || 1}</p>
                    <p>Fecha de creación: {new Date(term.createdAt).toLocaleString()}</p>
                    <button onClick={() => handleEditTerm(term)}>Editar</button>
                    {term.isDeleted ? (
                      <button onClick={() => handleRestoreTerm(term._id)}>Restaurar</button>
                    ) : (
                      <button onClick={() => handleDeleteTerm(term._id)}>Eliminar</button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
          <button onClick={handleHideTerms}>Regresar</button>
        </div>
      )}

      {/* Historial de términos */}
      {showHistory && (
        <div className="card">
          <h3>Historial de Términos</h3>
          <ul>
            {terms.map((term) => (
              <li key={term._id}>
                <h4>{term.title} {term.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}</h4>
                <p>{term.content}</p>
                <p>Versión: {term.version || 1}</p>
                <p>Fecha de creación: {new Date(term.createdAt).toLocaleString()}</p>
                {term.isDeleted && (
                  <button onClick={() => handleRestoreTerm(term._id)}>Restaurar</button>
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

export default TermsCrud;
