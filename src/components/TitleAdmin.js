import axios from 'axios';
import React, { useEffect, useState } from 'react';

const TitleAdmin = () => {
  const [title, setTitle] = useState(''); // Estado para manejar el título actual
  const [error, setError] = useState(null); // Estado para manejar errores
  const [successMessage, setSuccessMessage] = useState(''); // Mensaje de éxito
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si se está editando

  const fetchTitle = async () => {
    try {
      const response = await axios.get('https://backendgias.onrender.com/api/title');
      if (response.data && response.data.title) {
        setTitle(response.data.title); // Muestra el título si existe
        setIsEditing(true); // Cambia a modo de edición si ya hay un título
      }
    } catch (error) {
      console.error(error);
      setError('Error al obtener el título');
    }
  };

  useEffect(() => {
    fetchTitle(); // Llama a la función al montar el componente
  }, []);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setError(null); // Resetea el mensaje de error al cambiar el texto
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (title.length > 50) {
      setError('El título no puede tener más de 100 caracteres.');
      return;
    }

    try {
      const response = await axios.post('https://backendgias.onrender.com/api/title', { title });
      setSuccessMessage(isEditing ? 'Título actualizado exitosamente.' : 'Título registrado exitosamente.');
      setIsEditing(true); // Ahora está en modo de edición
    } catch (error) {
      console.error(error);
      setError('Error al guardar el título');
    }
  };

  return (
    <div>
      <h2>{isEditing ? 'Editar Título' : 'Registrar Título'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="title">Título:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            maxLength="50"
            placeholder="Ingresa el título"
            required
          />
          <p>{title.length}/50 caracteres</p> {/* Mostrar número de caracteres */}
        </div>

        <button type="submit">{isEditing ? 'Actualizar' : 'Registrar'}</button>
      </form>
    </div>
  );
};

export default TitleAdmin;
