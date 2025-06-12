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
        <header className="fixed top-0 w-full bg-blue-700 text-white z-10 h-25" >
            <div className="container mx-auto flex justify-between items-center px-4">
                {logoUrl && <img src={logoUrl} alt="Logo de GIAS" className="w-28 h-auto" />}
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p>{slogan}</p>
                </div>
                <nav>
                    <ul className="flex space-x-6">
                        <li><Link to="/" className="text-white hover:text-gray-300 font-semibold">Inicio</Link></li>

                        {!isAuthenticated && (
                            <>
                                <li><Link to="/register" className="text-white hover:text-gray-300 font-semibold">Registro</Link></li>
                                <li><Link to="/login" className="text-white hover:text-gray-300 font-semibold">Login</Link></li>
                            </>
                        )}

                        {isAuthenticated && (
                        <>
                            {isAdmin ? (
                            <>
                                <li><Link to="/admin-dashboard" className="text-white hover:text-gray-300 font-semibold">Admin Dashboard</Link></li>
                                <li><Link to="/admin-panel" className="text-white hover:text-gray-300 font-semibold">Gestión Avanzada del Sistema</Link></li>
                            </>
                            ) : isEmpleado ? (
                            <>
                                <li>
                                    <Link to="/empleado-dashboard" className="text-white hover:text-gray-300 font-semibold">
                                        Panel Principal
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/empleado/gestion-ahorros" className="text-white hover:text-gray-300 font-semibold">
                                        Gestión de Ahorros
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/empleado/pagos" className="text-white hover:text-gray-300 font-semibold">
                                        Pagos
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/empleado/estadisticas-reportes" className="text-white hover:text-gray-300 font-semibold">
                                        Estadísticas y Reportes
                                    </Link>
                                </li>
                            </>
                            ) : (
                            <>
                                <li><Link to="/dashboard" className="text-white hover:text-gray-300 font-semibold">Dashboard</Link></li>
                                <li><Link to="/gestion-cuenta" className="text-white hover:text-gray-300 font-semibold">Gestion Cuenta</Link></li>
                                <li><Link to="/pagos" className="text-white hover:text-gray-300 font-semibold">Pagos</Link></li>
                                <li><Link to="/perfil/:userId" className="text-white hover:text-gray-300 font-semibold">Perfil</Link></li>
                            </>
                            )}
                        </>
                        )}


                        <li><Link to="/ayuda" className="text-white hover:text-gray-300 font-semibold">Ayuda</Link></li>

                        {isAuthenticated && (
                            <li>
                                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-800 text-white py-2 px-4 rounded-md font-semibold">
                                    Cerrar Sesión
                                </button>
                            </li>
                        )}

                        <li>
                            <button onClick={toggleDarkMode} className="bg-gray-600 hover:bg-gray-800 text-white py-2 px-4 rounded-md font-semibold">
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
