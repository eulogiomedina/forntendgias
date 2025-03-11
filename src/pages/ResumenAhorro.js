import React from "react";
import { FaPiggyBank, FaCheckCircle } from "react-icons/fa"; // Íconos de FontAwesome

const ResumenAhorro = ({ ahorros, setAhorroSeleccionado }) => {
  return (
    <div>
      {ahorros.map((ahorro, index) => (
        <div key={index} className="max-w-md mx-auto my-5 p-6 bg-white shadow-lg rounded-xl text-center relative animate-fadeIn">
          {/* Icono de Cerdito (Alcancía) */}
          <div className="text-6xl text-pink-500 mb-4 animate-bounce">
            <FaPiggyBank />
          </div>

          {/* Información del Ahorro */}
          <div className="bg-gradient-to-br from-lightBlue-200 to-teal-300 text-white rounded-full w-40 h-40 mx-auto flex flex-col items-center justify-center font-bold shadow-lg">
            <h1 className="text-4xl font-bold">{`$${ahorro.monto}`}</h1>
            <p className="text-xl">{ahorro.tipo}</p>
          </div>

          {/* Fecha de inicio */}
          <div className="text-lg font-semibold text-gray-700 mt-4">
            📅 <strong>Inicio:</strong> {new Date(ahorro.fechaInicio).toLocaleDateString()}
          </div>

          {/* Mensaje de confirmación */}
          <p className="font-semibold text-lg text-green-600 bg-green-100 p-3 rounded-lg mt-5 shadow-sm flex items-center justify-center">
            <FaCheckCircle className="text-2xl text-green-600 mr-2" /> ¡Tu plan de ahorro ha sido registrado con éxito!
          </p>
        </div>
      ))}

      {/* Botón para agregar otro ahorro */}
      <div className="flex flex-col items-center mt-12">
        <button
          className="w-full py-3 text-white font-bold bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 transform transition-all duration-300 ease-in-out hover:scale-105"
          onClick={() => setAhorroSeleccionado(null)}
        >
          ➕ Agregar otro ahorro
        </button>
      </div>
    </div>
  );
};

export default ResumenAhorro;
