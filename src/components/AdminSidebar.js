// src/components/AdminSidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaPiggyBank, FaMoneyCheckAlt, FaFileAlt } from 'react-icons/fa';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="p-28 bg-[#e3f2fd] min-h-screen flex flex-col items-center justify-start gap-8 font-sans shadow-xl rounded-xl">
      <h1 className="text-4xl font-bold text-[#0d47a1] mb-5 uppercase tracking-wider text-center shadow-md">
        Gestión Avanzada del Sistema
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-screen-lg">
        <div
          className="bg-white rounded-lg shadow-xl p-6 text-center transition-transform transform hover:translate-y-2 hover:shadow-2xl hover:border-[#0d47a1] hover:bg-[#c3f3f3] cursor-pointer border-2 border-[#2196f3]"
          onClick={() => handleNavigation('/admin-panel/users')}
        >
          <FaUsers className="text-[#0d47a1] text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-[#0d47a1] mb-3">Gestión de Usuarios</h2>
          <p className="text-lg text-black">Administra cuentas de usuarios, permisos y roles.</p>
        </div>

        <div
          className="bg-white rounded-lg shadow-xl p-6 text-center transition-transform transform hover:translate-y-2 hover:shadow-2xl hover:border-[#0d47a1] hover:bg-[#c3f3f3] cursor-pointer border-2 border-[#2196f3]"
          onClick={() => handleNavigation('/admin-panel/gestionAhorros')}
        >
          <FaPiggyBank className="text-[#0d47a1] text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-[#0d47a1] mb-3">Gestión de Ahorros</h2>
          <p className="text-lg text-black">Visualiza y gestiona los ahorros de los clientes.</p>
        </div>

        <div
          className="bg-white rounded-lg shadow-xl p-6 text-center transition-transform transform hover:translate-y-2 hover:shadow-2xl hover:border-[#0d47a1] hover:bg-[#c3f3f3] cursor-pointer border-2 border-[#2196f3]"
          onClick={() => handleNavigation('/admin-panel/gestion-pagos')}
        >
          <FaMoneyCheckAlt className="text-[#0d47a1] text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-[#0d47a1] mb-3">Gestión de Pagos</h2>
          <p className="text-lg text-black">Controla y supervisa los pagos realizados.</p>
        </div>

        <div
          className="bg-white rounded-lg shadow-xl p-6 text-center transition-transform transform hover:translate-y-2 hover:shadow-2xl hover:border-[#0d47a1] hover:bg-[#e3f8fd] cursor-pointer border-2 border-[#2196f3]"
          onClick={() => handleNavigation('/directorio-usuarios')}
        >
          <FaUsers className="text-[#0d47a1] text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-[#0d47a1] mb-3">Documentos de los Usuarios</h2>
          <p className="text-lg text-black">Consulta todos los usuarios, perfiles y tandas.</p>
        </div>
        {/* --- NUEVO: Solicitudes de Préstamo --- */}
        <div
          className="bg-white rounded-lg shadow-xl p-6 text-center transition-transform transform hover:translate-y-2 hover:shadow-2xl hover:border-[#0d47a1] hover:bg-[#ffe9ce] cursor-pointer border-2 border-[#ffc107]"
          onClick={() => handleNavigation('/admin-panel/solicitudes-prestamo')}
        >
          <FaFileAlt className="text-[#ffa000] text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-[#ff9800] mb-3">Solicitudes de Préstamo</h2>
          <p className="text-lg text-black">Revisa, evalúa y gestiona las solicitudes de préstamo.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
