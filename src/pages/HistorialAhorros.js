import React from "react";

const HistorialAhorros = ({ ahorros }) => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-28">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mi Historial de Ahorros</h2>
      
      {ahorros.length === 0 ? (
        <p className="text-gray-600">No tienes ahorros registrados.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 border-b">Monto</th>
              <th className="p-3 border-b">Frecuencia</th>
              <th className="p-3 border-b">Fecha de Inicio</th>
            </tr>
          </thead>
          <tbody>
            {ahorros.map((ahorro) => (
              <tr key={ahorro._id} className="hover:bg-gray-100">
                <td className="p-3 border-b">${ahorro.monto}</td>
                <td className="p-3 border-b">{ahorro.tipo}</td>
                <td className="p-3 border-b">{new Date(ahorro.fechaInicio).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistorialAhorros;
