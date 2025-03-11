import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaFileContract, FaShareAlt, FaGavel, FaBullhorn, FaImage, FaHeading, FaAddressBook, FaSignInAlt, FaKey, FaUserLock } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const tools = [
    { path: '/admin-dashboard/policy-crud', icon: <FaShieldAlt />, title: 'Gestión de Políticas', description: 'Ver y gestionar las políticas de privacidad' },
    { path: '/admin-dashboard/terms-crud', icon: <FaFileContract />, title: 'Gestión de Términos', description: 'Ver y gestionar los términos y condiciones' },
    { path: '/admin-dashboard/social-links-manager', icon: <FaShareAlt />, title: 'Gestión de Redes Sociales', description: 'Ver y gestionar los enlaces de redes sociales' },
    { path: '/admin-dashboard/legal-boundary-crud', icon: <FaGavel />, title: 'Gestión de Deslindes Legales', description: 'Ver y gestionar los deslindes legales' },
    { path: '/admin-dashboard/slogan-manager', icon: <FaBullhorn />, title: 'Gestión de Eslogan', description: 'Ver y gestionar el eslogan' },
    { path: '/admin-dashboard/logo-manager', icon: <FaImage />, title: 'Gestión de Logo', description: 'Subir y gestionar el logo' },
    { path: '/admin-dashboard/title-admin', icon: <FaHeading />, title: 'Gestión de Título', description: 'Ver y gestionar el título' },
    { path: '/admin-dashboard/contact-edit', icon: <FaAddressBook />, title: 'Modificar Datos de Contacto', description: 'Modificar los datos de contacto' },
    { path: '/admin-dashboard/audit-logs', icon: <FaSignInAlt />, title: 'Registros de Inicios de Sesión', description: 'Ver registros de inicios de sesión' },
    { path: '/admin-dashboard/password-change-logs', icon: <FaKey />, title: 'Registros de Cambios de Contraseña', description: 'Ver registros de cambios de contraseña' },
    { path: '/admin-dashboard/blocked-accounts', icon: <FaUserLock />, title: 'Registro de Cuentas Bloqueadas', description: 'Ver el registro de todas las cuentas bloqueadas' }
  ];

  return (
    <div className="flex flex-col items-center p-28 bg-blue-50 min-h-screen font-sans shadow-xl rounded-lg">
      <h1 className="text-4xl font-bold text-blue-900 mb-8 uppercase text-center tracking-wide shadow-sm">Panel de Administrador</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-screen-xl">
        {tools.map((tool, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-lg p-6 text-center transform transition-transform duration-300 cursor-pointer hover:translate-y-2 hover:shadow-2xl hover:bg-blue-100 hover:border-blue-800 border-2 border-blue-500"
            onClick={() => navigate(tool.path)}
          >
            <div className="text-5xl text-blue-900 mb-4">{tool.icon}</div>
            <h2 className="text-2xl font-semibold text-blue-900 mb-2">{tool.title}</h2>
            <p className="text-base text-gray-700">{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
