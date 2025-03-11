// src/components/UserHeader.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserHeader = ({ onLogout, toggleDarkMode, isDarkMode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login'); // Redirige al login después de cerrar sesión
  };

  return (
    <header className="fixed top-0 w-full bg-blue-700 text-white z-10 py-4">
      <div className="container mx-auto flex justify-between items-center max-w-screen-xl px-4">
        <h1 className="text-xl font-semibold">GIAS Usuario</h1>
        <nav>
          <ul className="flex space-x-5">
            <li><a href="/dashboard" className="text-white font-bold">Dashboard</a></li>
            <li><a href="/profile" className="text-white font-bold">Perfil</a></li>
            <li><a href="/savings" className="text-white font-bold">Ahorros</a></li>
            <li><button onClick={handleLogout} className="text-white font-bold">Cerrar sesión</button></li>
            <li>
              <button onClick={toggleDarkMode} className="text-white font-bold">
                {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default UserHeader;
