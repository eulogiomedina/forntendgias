// src/pages/AdminDashboard.js
import React, { useState } from 'react';
import '../styles/AdminDashboard.css';
import PolicyCrud from '../components/PolicyCrud';
import TermsCrud from '../components/TermsCrud';
import SocialLinksManager from '../components/SocialLinksManager';
import LegalBoundaryCrud from '../components/LegalBoundaryCrud';
import SloganManager from '../components/SloganAdmin';
import LogoManager from '../components/LogoAdmin'; //corrigiendo
import TitleManager from '../components/TitleAdmin';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ onLogout, toggleDarkMode, isDarkMode }) => {
  const [showPolicyCrud, setShowPolicyCrud] = useState(false);
  const [showTermsCrud, setShowTermsCrud] = useState(false);
  const [showSocialLinksManager, setShowSocialLinksManager] = useState(false);
  const [showLegalBoundaryCrud, setShowLegalBoundaryCrud] = useState(false);
  const [showSloganManager, setShowSloganManager] = useState(false);
  const [showLogoManager, setShowLogoManager] = useState(false);
  const [showContactEdit, setShowContactEdit] = useState(false);
  const [showLoginLogs, setShowLoginLogs] = useState(false);
  const [showTitleManager, setShowTitleManager] = useState(false);
  const [showPasswordChangeLogs, setShowPasswordChangeLogs] = useState(false);
  const navigate = useNavigate();

  // Funciones para mostrar los distintos componentes
  const handleShowPolicyCrud = () => {
    resetAll();
    setShowPolicyCrud(true);
  };

  const handleShowTermsCrud = () => {
    resetAll();
    setShowTermsCrud(true);
  };

  const handleShowSocialLinksManager = () => {
    resetAll();
    setShowSocialLinksManager(true);
  };

  const handleShowLegalBoundaryCrud = () => {
    resetAll();
    setShowLegalBoundaryCrud(true);
  };

  const handleShowSloganManager = () => {
    resetAll();
    setShowSloganManager(true);
  };

  const handleShowLogoManager = () => {
    resetAll();
    setShowLogoManager(true);
  };

  const handleShowContactEdit = () => {
    navigate('/contact-edit');
  };
  const handleShowTitleManager = () => {
    resetAll();
    setShowTitleManager(true);
  };
  const handleShowLoginLogs = () => {
    navigate('/audit-logs');
  };

  const handleShowPasswordChangeLogs = () => {
    navigate('/password-change-logs');
  };

  // Función para reiniciar todas las vistas
  const resetAll = () => {
    setShowPolicyCrud(false);
    setShowTermsCrud(false);
    setShowSocialLinksManager(false);
    setShowLegalBoundaryCrud(false);
    setShowSloganManager(false);
    setShowLogoManager(false);
    setShowTitleManager(false);
    setShowContactEdit(false);
    setShowLoginLogs(false);
    setShowPasswordChangeLogs(false);
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-content">
        <h1>Panel de Administrador</h1>
        <p>Bienvenido al panel de administración.</p>

        {/* Tarjetas para las distintas gestiones */}
        {!showPolicyCrud && !showTermsCrud && !showSocialLinksManager && 
         !showLegalBoundaryCrud && !showSloganManager && !showLogoManager ? (
          <div className="dashboard-tools-container">
            {/* Gestión de Políticas */}
            <div className="dashboard-tool" onClick={handleShowPolicyCrud}>
              <div className="tool-icon policy-icon"></div>
              <h3>Gestión de Políticas</h3>
              <p>Ver y gestionar las políticas de privacidad</p>
              <button className="view-button">Ir</button>
            </div>

            {/* Gestión de Términos */}
            <div className="dashboard-tool" onClick={handleShowTermsCrud}>
              <div className="tool-icon terms-icon"></div>
              <h3>Gestión de Términos</h3>
              <p>Ver y gestionar los términos y condiciones</p>
              <button className="view-button">Ir</button>
            </div>

            {/* Gestión de Redes Sociales */}
            <div className="dashboard-tool" onClick={handleShowSocialLinksManager}>
              <div className="tool-icon social-icon"></div>
              <h3>Gestión de Redes Sociales</h3>
              <p>Ver y gestionar los enlaces de redes sociales</p>
              <button className="view-button">Ir</button>
            </div>

            {/* Gestión de Deslindes Legales */}
            <div className="dashboard-tool" onClick={handleShowLegalBoundaryCrud}>
              <div className="tool-icon legal-boundary-icon"></div>
              <h3>Gestión de Deslindes Legales</h3>
              <p>Ver y gestionar los deslindes legales</p>
              <button className="view-button">Ir</button>
            </div>

            {/* Gestión de Eslogan */}
            <div className="dashboard-tool" onClick={handleShowSloganManager}>
              <div className="tool-icon slogan-icon"></div>
              <h3>Gestión de Eslogan</h3>
              <p>Ver y gestionar el eslogan</p>
              <button className="view-button">Ir</button>
            </div>

            {/* Gestión de Logo */}
            <div className="dashboard-tool" onClick={handleShowLogoManager}>
              <div className="tool-icon logo-icon"></div>
              <h3>Gestión de Logo</h3>
              <p>Subir y gestionar el logo</p>
              <button className="view-button">Ir</button>
            </div>

            {/* Modificar Datos de Contacto */}
            <div className="dashboard-tool" onClick={handleShowContactEdit}>
              <div className="tool-icon contact-icon"></div>
              <h3>Modificar Datos de Contacto</h3>
              <p>Modificar los datos de contacto</p>
              <button className="view-button">Ir</button>
            </div>

            {/* Registros de Inicios de Sesión */}
            <div className="dashboard-tool" onClick={handleShowLoginLogs}>
              <div className="tool-icon log-icon"></div>
              <h3>Registros de Inicios de Sesión</h3>
              <p>Ver registros de inicios de sesión</p>
              <button className="view-button">Ver</button>
            </div>

            {/* Registros de Cambios de Contraseña */}
            <div className="dashboard-tool" onClick={handleShowPasswordChangeLogs}>
              <div className="tool-icon password-change-icon"></div>
              <h3>Registros de Cambios de Contraseña</h3>
              <p>Ver registros de cambios de contraseña</p>
              <button className="view-button">Ver</button>
            </div>
              {/* Registros de Cambio de Titulo */}
            <div className="dashboard-tool" onClick={handleShowTitleManager}>
              <div className="tool-icon title-icon"></div>
              <h3>Gestión de Título</h3>
              <p>Ver y gestionar el título de la empresa</p>
              <button className="view-button">Ir</button>
            </div>
          </div>
        ) : null}

        {/* Renderizar componentes basados en el estado */}
        {showPolicyCrud && <PolicyCrud />}
        {showTermsCrud && <TermsCrud />}
        {showSocialLinksManager && <SocialLinksManager />}
        {showLegalBoundaryCrud && <LegalBoundaryCrud />}
        {showSloganManager && <SloganManager />}
        {showLogoManager && <LogoManager />}
        {showTitleManager && <TitleAdmin />}
      </div>
    </div>
  );
};

export default AdminDashboard;
