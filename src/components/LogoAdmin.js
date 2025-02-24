import React, { useState } from 'react';
import axios from 'axios';
import '../styles/LogoAdmin.css'
import API_URL from '../apiConfig';


const LogoAdmin = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // Para manejar el estado de carga

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Por favor, selecciona un archivo.'); // Mensaje de advertencia si no hay archivo
            return;
        }

        const formData = new FormData();
        formData.append('file', file); // Cambié 'logo' a 'file' para que coincida con el campo esperado en el backend.

        setLoading(true); // Activar el estado de carga
        setMessage(''); // Limpiar el mensaje anterior

        try {
            const response = await axios.post(`${API_URL}/api/logo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Logo subido exitosamente'); // Solo mostrar el mensaje de éxito
        } catch (error) {
            console.error('Error al subir el logo:', error); // Log del error en consola
            setMessage('Error al subir el logo'); // Mensaje de error
        } finally {
            setLoading(false); // Desactivar el estado de carga
        }
    };

    return (
        <div className='logo-container'>
            <form onSubmit={handleFormSubmit}>
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    required // Asegura que un archivo es seleccionado antes de enviar
                />
                <button type="submit" disabled={loading}> 
                    {loading ? 'Subiendo...' : 'Subir Logo'}
                </button>
            </form>
            {message && <p>{message}</p>} {/* Muestra solo el mensaje */}
        </div>
    );
};

export default LogoAdmin;