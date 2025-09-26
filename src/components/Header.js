import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import API_URL from '../apiConfig';

const Header = ({ toggleDarkMode, isDarkMode }) => {
  const { isAuthenticated, isAdmin, isEmpleado, logout } = useContext(AuthContext);
  const [logoUrl, setLogoUrl] = useState('');
  const [slogan, setSlogan] = useState('');
  const [title, setTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const fetchHeaderData = async () => {
    try {
      const sloganResponse = await axios.get(`${API_URL}/api/slogan`);
      setSlogan(sloganResponse.data.slogan);

      const logoResponse = await axios.get(`${API_URL}/api/logo`);
      if (logoResponse.data.length > 0) {
        setLogoUrl(logoResponse.data[0].url);
      }
    } catch (error) {
      console.error('Error al obtener los datos del header:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchHeaderData();
    const intervalId = setInterval(() => {
      fetchHeaderData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="fixed top-0 w-full bg-blue-700 text-white z-10 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-2">
        {/* Logo y título */}
        <div className="flex items-center space-x-3">
          {logoUrl && <img src={logoUrl} alt="Logo de GIAS" className="w-20 h-auto" />}
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-2xl font-bold">{title}</h1>
            <p className="text-xs md:text-sm">{slogan}</p>
          </div>
        </div>

        {/* Botón hamburguesa (móvil) */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Navegación (desktop) */}
        <nav className="hidden md:flex">
          <ul className="flex space-x-6 items-center">
            <li><Link to="/" className="hover:text-gray-300 font-semibold">Inicio</Link></li>

            {!isAuthenticated && (
              <>
                <li><Link to="/register" className="hover:text-gray-300 font-semibold">Registro</Link></li>
                <li><Link to="/login" className="hover:text-gray-300 font-semibold">Login</Link></li>
              </>
            )}

            {isAuthenticated && (
              <>
                {isAdmin ? (
                  <>
                    <li><Link to="/admin-dashboard" className="hover:text-gray-300 font-semibold">Admin Dashboard</Link></li>
                    <li><Link to="/admin-panel" className="hover:text-gray-300 font-semibold">Gestión Avanzada</Link></li>
                  </>
                ) : isEmpleado ? (
                  <>
                    <li><Link to="/empleado-dashboard" className="hover:text-gray-300 font-semibold">Panel</Link></li>
                    <li><Link to="/empleado/gestion-ahorros" className="hover:text-gray-300 font-semibold">Ahorros</Link></li>
                    <li><Link to="/empleado/pagos" className="hover:text-gray-300 font-semibold">Pagos</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/dashboard" className="hover:text-gray-300 font-semibold">Dashboard</Link></li>
                    <li><Link to="/gestion-cuenta" className="hover:text-gray-300 font-semibold">Cuenta</Link></li>
                    <li><Link to="/pagos" className="hover:text-gray-300 font-semibold">Pagos</Link></li>
                    <li><Link to="/perfil/:userId" className="hover:text-gray-300 font-semibold">Perfil</Link></li>
                  </>
                )}
              </>
            )}

            <li><Link to="/ayuda" className="hover:text-gray-300 font-semibold">Ayuda</Link></li>

            {isAuthenticated && (
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-800 text-white py-1 px-3 rounded-md font-semibold"
                >
                  Cerrar Sesión
                </button>
              </li>
            )}

            <li>
              <button
                onClick={toggleDarkMode}
                className="bg-gray-600 hover:bg-gray-800 text-white py-1 px-3 rounded-md font-semibold"
              >
                {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Menú desplegable (móvil) */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 px-4 pb-4">
          <ul className="space-y-3">
            <li><Link to="/" className="block hover:text-gray-300 font-semibold">Inicio</Link></li>

            {!isAuthenticated && (
              <>
                <li><Link to="/register" className="block hover:text-gray-300 font-semibold">Registro</Link></li>
                <li><Link to="/login" className="block hover:text-gray-300 font-semibold">Login</Link></li>
              </>
            )}

            {isAuthenticated && (
              <>
                {isAdmin ? (
                  <>
                    <li><Link to="/admin-dashboard" className="block hover:text-gray-300 font-semibold">Admin Dashboard</Link></li>
                    <li><Link to="/admin-panel" className="block hover:text-gray-300 font-semibold">Gestión Avanzada</Link></li>
                  </>
                ) : isEmpleado ? (
                  <>
                    <li><Link to="/empleado-dashboard" className="block hover:text-gray-300 font-semibold">Panel</Link></li>
                    <li><Link to="/empleado/gestion-ahorros" className="block hover:text-gray-300 font-semibold">Ahorros</Link></li>
                    <li><Link to="/empleado/pagos" className="block hover:text-gray-300 font-semibold">Pagos</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/dashboard" className="block hover:text-gray-300 font-semibold">Dashboard</Link></li>
                    <li><Link to="/gestion-cuenta" className="block hover:text-gray-300 font-semibold">Cuenta</Link></li>
                    <li><Link to="/pagos" className="block hover:text-gray-300 font-semibold">Pagos</Link></li>
                    <li><Link to="/perfil/:userId" className="block hover:text-gray-300 font-semibold">Perfil</Link></li>
                  </>
                )}
              </>
            )}

            <li><Link to="/ayuda" className="block hover:text-gray-300 font-semibold">Ayuda</Link></li>

            {isAuthenticated && (
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-800 text-white py-2 rounded-md font-semibold"
                >
                  Cerrar Sesión
                </button>
              </li>
            )}

            <li>
              <button
                onClick={toggleDarkMode}
                className="w-full bg-gray-600 hover:bg-gray-800 text-white py-2 rounded-md font-semibold"
              >
                {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
