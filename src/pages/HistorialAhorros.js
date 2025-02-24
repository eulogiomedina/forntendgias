import React from "react";

const HistorialAhorros = ({ ahorros }) => {
  return (
    <div className="historial-container">
      <h2>Mi Historial de Ahorros</h2>
      
      {ahorros.length === 0 ? (
        <p>No tienes ahorros registrados.</p>
      ) : (
        <table className="historial-tabla">
          <thead>
            <tr>
              <th>Monto</th>
              <th>Frecuencia</th>
              <th>Fecha de Inicio</th>
            </tr>
          </thead>
          <tbody>
            {ahorros.map((ahorro) => (
              <tr key={ahorro._id}>
                <td>${ahorro.monto}</td>
                <td>{ahorro.tipo}</td>
                <td>{new Date(ahorro.fechaInicio).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistorialAhorros;
