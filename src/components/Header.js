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
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchHeaderData();
    const intervalId = setInterval(fetchHeaderData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="fixed top-0 w-full bg-blue-700 text-white z-50 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-3">
        
        {/* Logo + título + slogan */}
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="w-12 sm:w-16 h-12 bg-gray-300 animate-pulse rounded-md" />
          ) : (
            logoUrl && <img src={logoUrl} alt="Logo GIAS" className="w-12 sm:w-16 h-auto" />
          )}

          <div className="flex flex-col">
            {loading ? (
              <div className="w-24 h-4 bg-gray-300 animate-pulse rounded mb-1"></div>
            ) : (
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">{title || 'GIAS'}</h1>
            )}

            {loading ? (
              <div className="w-32 h-3 bg-gray-300 animate-pulse rounded"></div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-200">{slogan || 'Tu dinero ahora más seguro'}</p>
            )}
          </div>
        </div>

        {/* Botón hamburguesa en móvil */}
        <button
          className="sm:hidden text-white text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Menú de navegación */}
        <nav
          className={`${
            menuOpen ? 'block' : 'hidden'
          } w-full sm:w-auto sm:block mt-4 sm:mt-0`}
        >
          <ul className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm font-semibold">
            <li><Link to="/" className="hover:text-gray-300">Inicio</Link></li>

            {!isAuthenticated && (
              <>
                <li><Link to="/register" className="hover:text-gray-300">Registro</Link></li>
                <li><Link to="/login" className="hover:text-gray-300">Login</Link></li>
              </>
            )}

            {isAuthenticated && (
              <>
                {isAdmin ? (
                  <>
                    <li><Link to="/admin-dashboard" className="hover:text-gray-300">Admin Dashboard</Link></li>
                    <li><Link to="/admin-panel" className="hover:text-gray-300">Gestión Avanzada</Link></li>
                  </>
                ) : isEmpleado ? (
                  <>
                    <li><Link to="/empleado-dashboard" className="hover:text-gray-300">Panel Principal</Link></li>
                    <li><Link to="/empleado/gestion-ahorros" className="hover:text-gray-300">Gestión Ahorros</Link></li>
                    <li><Link to="/empleado/pagos" className="hover:text-gray-300">Pagos</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link></li>
                    <li><Link to="/gestion-cuenta" className="hover:text-gray-300">Gestión Cuenta</Link></li>
                    <li><Link to="/pagos" className="hover:text-gray-300">Pagos</Link></li>
                    <li><Link to="/perfil/:userId" className="hover:text-gray-300">Perfil</Link></li>
                  </>
                )}
              </>
            )}

            <li><Link to="/ayuda" className="hover:text-gray-300">Ayuda</Link></li>

            {isAuthenticated && (
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-800 py-1 px-3 rounded-md"
                >
                  Cerrar Sesión
                </button>
              </li>
            )}

            <li>
              <button
                onClick={toggleDarkMode}
                className="bg-gray-600 hover:bg-gray-800 py-1 px-3 rounded-md"
              >
                {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
