import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ toggleDarkMode, isDarkMode, isAuthenticated, isAdmin, onLogout }) => {
    const [logoUrl, setLogoUrl] = useState('');
    const [slogan, setSlogan] = useState('');
    const [title, setTitle] = useState(''); // Agregado el estado para el título

    const fetchHeaderData = async () => {
        try {
            const sloganResponse = await axios.get('https://backendgias.onrender.com/api/slogan');
            setSlogan(sloganResponse.data.slogan);

            const logoResponse = await axios.get('https://backendgias.onrender.com/api/logo');
            if (logoResponse.data.length > 0) {
                setLogoUrl(logoResponse.data[0].url);
            }

            const titleResponse = await axios.get('https://backendgias.onrender.com/api/title'); // Obtener el título
            setTitle(titleResponse.data.title); // Guardar el título en el estado
        } catch (error) {
            console.error('Error al obtener los datos del header:', error);
        }
    };

    useEffect(() => {
        fetchHeaderData();
        const intervalId = setInterval(() => {
            fetchHeaderData(); // Verifica cada 10 segundos
        }, 5000); // Cambia el tiempo según tus necesidades

        return () => clearInterval(intervalId);
    }, []);

    return (
        <header className="header">
            <div className="container">
                {logoUrl && <img src={logoUrl} alt="Logo de GIAS" className="logo" />}
                <h1>{title}</h1> {/* Renderiza el título de forma dinámica */}
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
                                <li><Link to="/profile">Perfil</Link></li>
                                {isAdmin && <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>}
                                {!isAdmin && <li><Link to="/dashboard">Dashboard</Link></li>}
                                <li><button onClick={onLogout}>Cerrar Sesión</button></li>
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
