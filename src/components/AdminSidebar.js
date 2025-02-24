import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminSidebar.css';
import { FaUsers, FaPiggyBank, FaMoneyCheckAlt, FaFileAlt } from 'react-icons/fa';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="admin-sidebar">
      <h1 className="sidebar-title">Gestión Avanzada del Sistema</h1>

      <div className="card-container">
        <div className="admin-card" onClick={() => handleNavigation('/admin-panel/users')}>
          <FaUsers className="card-icon" />
          <h2 className="card-title">Gestión de Usuarios</h2>
          <p className="card-description">Administra cuentas de usuarios, permisos y roles.</p>
        </div>

        <div className="admin-card" onClick={() => handleNavigation('/admin-panel/gestionAhorros')}>
          <FaPiggyBank className="card-icon" />
          <h2 className="card-title">Gestión de Ahorros</h2>
          <p className="card-description">Visualiza y gestiona los ahorros de los clientes.</p>
        </div>

        <div className="admin-card" onClick={() => handleNavigation('/admin-dashboard/payments')}>
          <FaMoneyCheckAlt className="card-icon" />
          <h2 className="card-title">Gestión de Pagos</h2>
          <p className="card-description">Controla y supervisa los pagos realizados.</p>
        </div>

        <div className="admin-card" onClick={() => handleNavigation('/admin-dashboard/documents')}>
          <FaFileAlt className="card-icon" />
          <h2 className="card-title">Documentos Regulatorios</h2>
          <p className="card-description">Gestiona políticas, términos y documentos legales.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
