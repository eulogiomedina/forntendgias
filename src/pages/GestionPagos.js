import React, { useState } from "react";
import AdminCuentaDestino from "./AdminCuentaDestino";
import DashboardPagos from './DashboardPagos';
import ValidarPagos from './ValidarPagos';
import ReportesPagos from './ReportesPagos';
import HistorialPagos from './HistorialPagos';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'validar', label: 'Validar Pagos' },
  { id: 'reportes', label: 'Reportes' },
  { id: 'historial', label: 'Historial' }
];

const GestionPagos = () => {
  const [vista, setVista] = useState('dashboard');

  let Componente;
  switch (vista) {
    case 'dashboard':
      Componente = <DashboardPagos />;
      break;
    case 'validar':
      Componente = <ValidarPagos />;
      break;
    case 'reportes':
      Componente = <ReportesPagos />;
      break;
    case 'historial':
      Componente = <HistorialPagos />;
      break;
    default:
      Componente = <DashboardPagos />;
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-5 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-[#0d47a1] mb-5 text-center">
        Gestión de Pagos
      </h2>
      {/* ADMIN CUENTA DESTINO */}
      <AdminCuentaDestino />

      {/* --- TABS DE GESTIÓN (EMPLEADO) --- */}
      <div className="max-w-4xl mx-auto mt-14 p-6 bg-white rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold text-blue-800 mb-4 text-center">
          Gestión de Pagos <span className="font-normal text-base text-blue-500">(Empleado)</span>
        </h3>
        <div className="flex justify-center space-x-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setVista(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200
                ${
                  vista === tab.id
                    ? 'bg-blue-700 text-white shadow'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4 rounded-b-xl bg-blue-50 min-h-[150px]">{Componente}</div>
      </div>
    </div>
  );
};

export default GestionPagos;
