import '../styles/AuditStyles.css';
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
    <div className="table-container">
      <h2>Registros de Inicios de Sesión</h2>
      {loading && <p>Cargando...</p>} {/* Mensaje de carga */}
      {errorMessage && <p className="error">{errorMessage}</p>}
      {logs.length === 0 && !loading ? (
        <p>No hay registros de inicios de sesión.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Correo</th>
              <th>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{log.nombreCompleto}</td>
                <td>{log.correo}</td>
                <td>{new Date(log.fechaHora).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AuditLogs;
