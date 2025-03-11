import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const UserDropdown = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <NavDropdown 
      title={user ? user.nombre : 'Usuario'} 
      id="user-dropdown" 
      align="end"
      className="flex items-center space-x-2 mr-5"
    >
      {user && user.profilePicture && (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover cursor-pointer"
        />
      )}
      <NavDropdown.Item onClick={() => navigate('/profile')} className="font-semibold text-gray-700">
        Configuración de Perfil
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => navigate('/savings')} className="font-semibold text-gray-700">
        Mis Ahorros
      </NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={handleLogout} className="font-semibold text-red-500">
        Cerrar Sesión
      </NavDropdown.Item>
    </NavDropdown>
  );
};

export default UserDropdown;
