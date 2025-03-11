import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API_URL from '../apiConfig'; // Ruta de configuración de tu API

const PolicyViewer = () => {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/policies/${id}`);
        setPolicy(response.data);
      } catch (error) {
        console.error('Error al obtener la política:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [id]);

  if (loading) {
    return <div className="text-center text-xl text-blue-600">Cargando...</div>;
  }

  if (!policy) {
    return <div className="text-center text-xl text-red-600">No se encontró la política.</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">{policy.title}</h2>
        <h3 className="text-lg font-medium text-gray-700 mt-4">Contenido de la Política:</h3>
        <p className="text-gray-600 text-justify mt-2">{policy.content}</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Regresar
        </button>
      </div>
    </div>
  );
};

export default PolicyViewer;
