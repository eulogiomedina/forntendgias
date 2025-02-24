import '../styles/AuditStyles.css';
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
    <div className="table-container">
      <h2>Registros de Cambios de Contraseña</h2>
      {errorMessage && <p className="error">{errorMessage}</p>}
      {passwordChangeLogs.length === 0 ? (
        <p>No hay registros de cambios de contraseña.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {/*<th>Nombre Completo</th>*/}
              <th>Correo</th>
              <th>Contraseña Anterior</th>
              <th>Nueva Contraseña</th>
              <th>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {passwordChangeLogs.map((log) => (
              <tr key={log._id}>
                {/*<td>{log.nombreCompleto}</td>*/}
                <td>{log.correo}</td>
                <td>{log.contraseñaAnterior}</td>
                <td>{log.nuevaContraseña}</td>
                <td>{new Date(log.fechaHora).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PasswordChangeLogs;
