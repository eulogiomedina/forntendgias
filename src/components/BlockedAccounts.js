import React, { useState, useEffect } from 'react';

const BlockedAccounts = () => {
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchBlockedAccounts = async () => {
      try {
        const response = await fetch('https://backendgias.onrender.com/api/accounts/blocked'); // URL del backend ajustada
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
    <div className="table-container">
      <h2>Registro de Cuentas Bloqueadas</h2>
      {errorMessage && <p className="error">{errorMessage}</p>}
      {blockedAccounts.length === 0 ? (
        <p>No hay cuentas bloqueadas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Correo</th>
              <th>Fecha de Bloqueo</th>
            </tr>
          </thead>
          <tbody>
            {blockedAccounts.map((account) => (
              <tr key={account._id}>
                <td>{account.correo}</td>
                <td>
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
