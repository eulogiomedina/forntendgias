import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Header.css';

const Header = ({ toggleDarkMode, isDarkMode }) => {
    const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);
    const [logoUrl, setLogoUrl] = useState('');
    const [slogan, setSlogan] = useState('');
    const [title, setTitle] = useState('');
    const navigate = useNavigate(); // Aquí se usa useNavigate para la redirección

    const fetchHeaderData = async () => {
        try {
            const sloganResponse = await axios.get('https://backendgias.onrender.com/api/slogan');
            setSlogan(sloganResponse.data.slogan);

            const logoResponse = await axios.get('https://backendgias.onrender.com/api/logo');
            if (logoResponse.data.length > 0) {
                setLogoUrl(logoResponse.data[0].url);
            }

            const titleResponse = await axios.get('https://backendgias.onrender.com/api/title');
            setTitle(titleResponse.data.title);
        } catch (error) {
            console.error('Error al obtener los datos del header:', error);
        }
    };

    const handleLogout = () => {
        logout(); // Llama a logout para limpiar el estado
        navigate('/login'); // Redirige al usuario al login
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
                                    <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>
                                ) : (
                                    <li><Link to="/dashboard">Dashboard</Link></li>
                                )}
                                <li>
                                    <button onClick={handleLogout} className="logout-button">
                                        Cerrar Sesión
                                    </button>
                                </li>
                            </>
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
