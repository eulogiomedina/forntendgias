import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';

const BlockedAccounts = () => {
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchBlockedAccounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/accounts/blocked`); // URL del backend ajustada
        if (!response.ok) {
          throw new Error('Error al obtener las cuentas bloqueadas');
        }
        const data = await response.json();
        setBlockedAccounts(data);
      } catch (error) {
        console.error('Error al obtener las cuentas bloqueadas:', error);
        setErrorMessage('No se pudieron cargar las cuentas bloqueadas.');
      }
    };

    fetchBlockedAccounts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 shadow-lg rounded-lg mt-24">
      <h2 className="text-blue-600 text-center text-2xl font-bold mb-6">Registro de Cuentas Bloqueadas</h2>
      {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
      {blockedAccounts.length === 0 ? (
        <p className="text-center text-gray-500">No hay cuentas bloqueadas.</p>
      ) : (
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-4 text-left">Correo</th>
              <th className="py-3 px-4 text-left">Fecha de Bloqueo</th>
            </tr>
          </thead>
          <tbody>
            {blockedAccounts.map((account) => (
              <tr key={account._id} className="hover:bg-gray-100">
                <td className="py-3 px-4 text-gray-800">{account.correo}</td>
                <td className="py-3 px-4 text-gray-800">
                  {account.fechaBloqueo
                    ? new Date(account.fechaBloqueo).toLocaleString() // Convertir fecha al formato legible
                    : 'Fecha no disponible'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BlockedAccounts;
