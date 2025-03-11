import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API_URL from '../apiConfig'; // Ruta de configuración de tu API

const DisclaimerDetail = () => {
  const { id } = useParams(); // Obtén el ID de la URL
  const [disclaimer, setDisclaimer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisclaimer = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/legal-boundaries/${id}`); // Obtén el deslinde por ID
        console.log(response.data); // Verifica la respuesta de la API
        setDisclaimer(response.data); // Guarda el deslinde en el estado
      } catch (error) {
        console.error('Error al obtener el deslinde:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisclaimer(); // Llama a la función para obtener el deslinde
  }, [id]);

  if (loading) {
    return <div className="text-center text-xl text-gray-500">Cargando...</div>;
  }

  if (!disclaimer) {
    return <div className="text-center text-xl text-red-500">No se encontró el deslinde.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg mx-auto max-w-3xl">
        <h2 className="text-2xl text-blue-700 font-semibold mb-2">{disclaimer.title}</h2>
        <h4 className="text-lg text-gray-500 mb-4">Versión: {disclaimer.version}</h4>
        <h3 className="text-xl text-gray-700 mt-6 mb-3">Contenido del Deslinde:</h3>
        <p className="text-gray-800 mb-6 text-justify">{disclaimer.content}</p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Regresar
        </button>
      </div>
    </div>
  );
};

export default DisclaimerDetail;
