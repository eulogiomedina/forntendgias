import React, { useEffect, useState } from 'react';
import API_URL from '../apiConfig';

const PasswordChangeLogs = () => {
  const [passwordChangeLogs, setPasswordChangeLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPasswordChanges = async () => {
      try {
        const response = await fetch(`${API_URL}/api/audit/password-change-logs`);
        if (!response.ok) {
          throw new Error('Error al obtener los registros de cambios de contraseña');
        }
        const data = await response.json();
        setPasswordChangeLogs(data);
      } catch (error) {
        console.error('Error al obtener los registros de cambios de contraseña:', error);
        setErrorMessage('No se pudieron cargar los registros de cambios de contraseña.');
      }
    };

    fetchPasswordChanges();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Registros de Cambios de Contraseña</h2>

      {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}
      
      {passwordChangeLogs.length === 0 ? (
        <p className="text-center text-gray-600">No hay registros de cambios de contraseña.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 font-medium border-b">Correo</th>
                <th className="px-4 py-2 text-left text-gray-600 font-medium border-b">Contraseña Anterior</th>
                <th className="px-4 py-2 text-left text-gray-600 font-medium border-b">Nueva Contraseña</th>
                <th className="px-4 py-2 text-left text-gray-600 font-medium border-b">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {passwordChangeLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border-b text-gray-700">{log.correo}</td>
                  <td className="px-4 py-2 border-b text-gray-700">{log.contraseñaAnterior}</td>
                  <td className="px-4 py-2 border-b text-gray-700">{log.nuevaContraseña}</td>
                  <td className="px-4 py-2 border-b text-gray-700">{new Date(log.fechaHora).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PasswordChangeLogs;
