import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Header.css';
import API_URL from '../apiConfig';

const Header = ({ toggleDarkMode, isDarkMode }) => {
    const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);
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
        <header className="header">
            <div className="container">
                {logoUrl && <img src={logoUrl} alt="Logo de GIAS" className="logo" />}
                <h1>{title}</h1>
                <p>{slogan}</p>
                <nav>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>

                        {!isAuthenticated && (
                            <>
                                <li><Link to="/register">Registro</Link></li>
                                <li><Link to="/login">Login</Link></li>
                            </>
                        )}

                        {isAuthenticated && (
                            <>
                                {isAdmin ? (
                                    <>
                                    <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>
                                    <li><Link to="/admin-panel">Gestión Avanzada del Sistema</Link></li>
                                   </>
                                ) : (
                                    <>
                                    <li><Link to="/dashboard">Dashboard</Link></li>
                                    <li><Link to="/perfil/:userId">Perfil</Link></li>
                                    </>
                                )}
                            </>
                        )}

                        {/* ✅ "Ayuda" siempre visible ANTES de "Cerrar Sesión" y "Modo Oscuro" */}
                        <li><Link to="/ayuda">Ayuda</Link></li>

                        {isAuthenticated && (
                            <li>
                                <button onClick={handleLogout} className="logout-button">
                                    Cerrar Sesión
                                </button>
                            </li>
                        )}

                        <li>
                            <button onClick={toggleDarkMode} className="dark-mode-toggle">
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
