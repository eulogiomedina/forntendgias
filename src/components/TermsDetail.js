import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API_URL from '../apiConfig'; // Ruta de configuración de tu API


const TermsDetail = () => {
  const { id } = useParams(); // Obtén el ID de la URL
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/terms/${id}`); // Obtén los términos por ID
        setTerms(response.data); // Guarda los términos en el estado
      } catch (error) {
        console.error('Error al obtener los términos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms(); // Llama a la función para obtener los términos
  }, [id]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!terms) {
    return <div className="error">No se encontraron los términos.</div>;
  }

  return (
    <div className="flex flex-col justify-start items-center min-h-screen bg-gray-100 pt-24">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-blue-800 text-2xl font-semibold mb-4">{terms.title}</h2> {/* Título de los términos */}
        <h4 className="text-gray-600 text-lg mb-4">Versión: {terms.version}</h4> {/* Mostrar la versión */}
        <h3 className="text-gray-700 text-xl mb-4">Contenido de los Términos:</h3> {/* Título adicional para el contenido */}
        <p className="text-gray-800 text-base mb-4">{terms.content}</p>
        <button 
          onClick={() => window.history.back()} 
          className="bg-blue-800 text-white py-2 px-4 rounded-md transition duration-300 hover:bg-blue-600"
        >
          Regresar
        </button>
      </div>
    </div>
  );
};

export default TermsDetail;
