import axios from 'axios';
import React, { useEffect, useState } from 'react';
import API_URL from '../apiConfig';

const SloganAdmin = () => {
  const [slogan, setSlogan] = useState(''); // Estado para manejar el eslogan actual
  const [error, setError] = useState(null); // Estado para manejar errores
  const [successMessage, setSuccessMessage] = useState(''); // Mensaje de éxito
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si se está editando

  const fetchSlogan = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/slogan`);
      if (response.data && response.data.slogan) {
        setSlogan(response.data.slogan); // Muestra el eslogan si existe
        setIsEditing(true); // Cambia a modo de edición si ya hay un eslogan
      }
    } catch (error) {
      console.error(error);
      setError('Error al obtener el eslogan');
    }
  };

  useEffect(() => {
    fetchSlogan(); // Llama a la función al montar el componente
  }, []);

  const handleSloganChange = (e) => {
    setSlogan(e.target.value);
    setError(null); // Resetea el mensaje de error al cambiar el texto
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (slogan.length > 100) {
      setError('El eslogan no puede tener más de 100 caracteres.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/slogan`, { slogan });
      setSuccessMessage(isEditing ? 'Eslogan actualizado exitosamente.' : 'Eslogan registrado exitosamente.');
      setIsEditing(true); // Ahora está en modo de edición
    } catch (error) {
      console.error(error);
      setError('Error al guardar el eslogan');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">
        {isEditing ? 'Editar Eslogan' : 'Registrar Eslogan'}
      </h2>
      
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 text-sm mb-4">{successMessage}</p>}
      
      <form onSubmit={handleFormSubmit} className="flex flex-col">
        <div className="mb-4">
          <label htmlFor="slogan" className="block text-sm font-medium text-gray-700 mb-2">Eslogan:</label>
          <input
            type="text"
            id="slogan"
            value={slogan}
            onChange={handleSloganChange}
            maxLength="100"
            placeholder="Ingresa el eslogan"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-right text-sm text-gray-500">{slogan.length}/100 caracteres</p>
        </div>

        <button 
          type="submit" 
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400" 
          disabled={slogan.length === 0 || error}>
          {isEditing ? 'Actualizar' : 'Registrar'}
        </button>
      </form>
    </div>
  );
};

export default SloganAdmin;
