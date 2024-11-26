import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import '../styles/terms.css';

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
    <div className="terms-crud-container">
      <h2>Gestionar Términos y Condiciones</h2>

      {/* Mensaje de error */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Crear nuevo término */}
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

      {/* Mostrar términos existentes */}
      <button onClick={() => setShowTerms(true)}>Ir a Términos Existentes</button>

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
                    <button onClick={handleSaveTerm}>Guardar</button>
                    <button onClick={() => setEditingTerm(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <h4>
                      {term.title} {term.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}
                    </h4>
                    <p>{term.content}</p>
                    <p>Versión: {term.version || 1}</p>
                    <p>Fecha de creación: {new Date(term.createdAt).toLocaleString()}</p>
                    <button onClick={() => setEditingTerm(term)}>Editar</button>
                    <button onClick={() => handleDeleteTerm(term._id)}>Eliminar</button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => setShowTerms(false)}>Regresar</button>
        </div>
      )}

      {/* Mostrar historial de términos */}
      <button onClick={() => setShowHistory(true)}>Ir al Historial de Términos</button>

      {showHistory && (
        <div className="card">
          <h3>Historial de Términos</h3>
          <ul>
            {historyTerms.map((term) => (
              <li key={term._id}>
                <h4>
                  {term.title}{' '}
                  {term.isDeleted ? <span>(Eliminado)</span> : term.isCurrent ? <span>(Vigente)</span> : <span>(No Vigente)</span>}
                </h4>
                <p>{term.content}</p>
                <p>Versión: {term.version || 1}</p>
                <p>Fecha de creación: {new Date(term.createdAt).toLocaleString()}</p>
                {term.isDeleted && (
                  <button onClick={() => handleRestoreTerm(term._id)}>Restaurar</button>
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

export default TermsCrud;