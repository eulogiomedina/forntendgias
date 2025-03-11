import axios from 'axios';
import React, { useEffect, useState } from 'react';
import API_URL from '../apiConfig';

const TitleAdmin = () => {
  const [title, setTitle] = useState(''); // Estado para manejar el título actual
  const [error, setError] = useState(null); // Estado para manejar errores
  const [successMessage, setSuccessMessage] = useState(''); // Mensaje de éxito
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si se está editando

  const fetchTitle = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/title`);
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
      setError('El título no puede tener más de 50 caracteres.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/title`, { title });
      setSuccessMessage(isEditing ? 'Título actualizado exitosamente.' : 'Título registrado exitosamente.');
      setIsEditing(true); // Ahora está en modo de edición
    } catch (error) {
      console.error(error);
      setError('Error al guardar el título');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-100 p-8 rounded-lg shadow-md mt-36">
      <h2 className="text-center text-green-600 text-2xl mb-6">{isEditing ? 'Editar Título' : 'Registrar Título'}</h2>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}

      <form className="flex flex-col gap-6" onSubmit={handleFormSubmit}>
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-2 font-bold text-gray-700">Título:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            maxLength="50"
            placeholder="Ingresa el título"
            required
            className="p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:border-green-600"
          />
          <p className="text-xs text-gray-500 text-right">{title.length}/50 caracteres</p>
        </div>

        <button type="submit" className="py-3 px-5 bg-green-600 text-white rounded-lg text-lg hover:bg-green-700">
          {isEditing ? 'Actualizar' : 'Registrar'}
        </button>
      </form>
    </div>
  );
};

export default TitleAdmin;
