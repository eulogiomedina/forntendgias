import React, { useEffect, useState } from 'react';
import API_URL from '../apiConfig';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/audit/audit-logs`);
        if (!response.ok) {
          throw new Error('Error al obtener los registros');
        }
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Error al obtener los registros:', error);
        setErrorMessage('No se pudieron cargar los registros.');
      } finally {
        setLoading(false); // Cambiar el estado de carga al finalizar
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 shadow-lg rounded-lg mt-24">
      <h2 className="text-blue-600 text-center text-2xl font-bold mb-6">Registros de Inicios de Sesión</h2>
      {loading && <p className="text-center text-gray-500">Cargando...</p>}
      {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
      {logs.length === 0 && !loading ? (
        <p className="text-center text-gray-500">No hay registros de inicios de sesión.</p>
      ) : (
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-4 text-left">Nombre Completo</th>
              <th className="py-3 px-4 text-left">Correo</th>
              <th className="py-3 px-4 text-left">Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-100">
                <td className="py-3 px-4 text-gray-800">{log.nombreCompleto}</td>
                <td className="py-3 px-4 text-gray-800">{log.correo}</td>
                <td className="py-3 px-4 text-gray-800">{new Date(log.fechaHora).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AuditLogs;
