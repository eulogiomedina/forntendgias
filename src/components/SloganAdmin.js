import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../styles/SloganAdmin.css'
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
    <div className='slogan-container'>
      <h2>{isEditing ? 'Editar Eslogan' : 'Registrar Eslogan'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="slogan">Eslogan:</label>
          <input
            type="text"
            id="slogan"
            value={slogan}
            onChange={handleSloganChange}
            maxLength="100"
            placeholder="Ingresa el eslogan"
            required
          />
          <p>{slogan.length}/100 caracteres</p> {/* Mostrar número de caracteres */}
        </div>

        <button type="submit">{isEditing ? 'Actualizar' : 'Registrar'}</button>
      </form>
    </div>
  );
};

export default SloganAdmin;
