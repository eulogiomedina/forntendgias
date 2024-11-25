import React from 'react';
import '../styles/AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-content">
        <h1>Panel de Administrador</h1>
        <div className="dashboard-tools-container">
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/policy-crud')}>
            <div className="tool-icon policy-icon"></div>
            <h3>Gestión de Políticas</h3>
            <p>Ver y gestionar las políticas de privacidad</p>
            <button className="view-button">Ir</button>
          </div>
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/terms-crud')}>
            <div className="tool-icon terms-icon"></div>
            <h3>Gestión de Términos</h3>
            <p>Ver y gestionar los términos y condiciones</p>
            <button className="view-button">Ir</button>
          </div>
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/social-links-manager')}>
            <div className="tool-icon social-icon"></div>
            <h3>Gestión de Redes Sociales</h3>
            <p>Ver y gestionar los enlaces de redes sociales</p>
            <button className="view-button">Ir</button>
          </div>
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/legal-boundary-crud')}>
            <div className="tool-icon legal-boundary-icon"></div>
            <h3>Gestión de Deslindes Legales</h3>
            <p>Ver y gestionar los deslindes legales</p>
            <button className="view-button">Ir</button>
          </div>
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/slogan-manager')}>
            <div className="tool-icon slogan-icon"></div>
            <h3>Gestión de Eslogan</h3>
            <p>Ver y gestionar el eslogan</p>
            <button className="view-button">Ir</button>
          </div>
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/logo-manager')}>
            <div className="tool-icon logo-icon"></div>
            <h3>Gestión de Logo</h3>
            <p>Subir y gestionar el logo</p>
            <button className="view-button">Ir</button>
          </div>
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/title-admin')}>
            <div className="tool-icon title-icon"></div>
            <h3>Gestión de Título</h3>
            <p>Ver y gestionar el título</p>
            <button className="view-button">Ir</button>
          </div>
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/contact-edit')}>
            <div className="tool-icon contact-icon"></div>
            <h3>Modificar Datos de Contacto</h3>
            <p>Modificar los datos de contacto</p>
            <button className="view-button">Ir</button>
          </div>
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/audit-logs')}>
            <div className="tool-icon log-icon"></div>
            <h3>Registros de Inicios de Sesión</h3>
            <p>Ver registros de inicios de sesión</p>
            <button className="view-button">Ver</button>
          </div>
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/password-change-logs')}>
            <div className="tool-icon password-change-icon"></div>
            <h3>Registros de Cambios de Contraseña</h3>
            <p>Ver registros de cambios de contraseña</p>
            <button className="view-button">Ver</button>
          </div>
          <div className="dashboard-tool" onClick={() => navigate('/admin-dashboard/blocked-accounts')}>
            <div className="tool-icon blocked-icon"></div> {/* Cambia esto según tus estilos */}
            <h3>Registro de Cuentas Bloqueadas</h3>
            <p>Ver el registro de todas las cuentas bloqueadas</p>
            <button className="view-button">Ver</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
