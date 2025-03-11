import React from 'react';

const Savings = () => {
  return (
    <div className="max-w-4xl mx-auto p-5 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-gray-700 mb-6">Mis Ahorros</h1>
      {/* Aquí puedes mostrar estadísticas de ahorro, gráficos, etc. */}
      <div className="savings-header flex justify-between items-center mb-6">
        <h2 className="text-xl text-gray-800">Ahorros Registrados</h2>
        <button className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition duration-200 ease-in-out">
          Agregar Ahorro
        </button>
      </div>

      {/* Lista de ahorros */}
      <div className="savings-list">
        <div className="savings-list-item flex justify-between items-center bg-white p-4 mb-4 border rounded-md shadow-sm">
          <div className="item-info flex items-center">
            <span className="text-lg font-medium text-gray-700">Ahorro Mensual</span>
          </div>
          <span className="item-amount text-green-500 font-semibold text-xl">$1,000</span>
          <span className="item-date text-sm text-gray-500">01/05/2025</span>
        </div>
        <div className="savings-list-item flex justify-between items-center bg-white p-4 mb-4 border rounded-md shadow-sm">
          <div className="item-info flex items-center">
            <span className="text-lg font-medium text-gray-700">Ahorro Semanal</span>
          </div>
          <span className="item-amount text-green-500 font-semibold text-xl">$200</span>
          <span className="item-date text-sm text-gray-500">01/05/2025</span>
        </div>
      </div>
    </div>
  );
};

export default Savings;
