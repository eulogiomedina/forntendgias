import React, { useState } from 'react';
import axios from 'axios';
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
        <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow-lg transform transition hover:translate-y-1">
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold text-center text-gray-800">Subir Logo</h2>
                
                {/* Entrada de archivo */}
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    required 
                    className="w-full p-3 border-2 border-dashed border-blue-500 rounded-lg bg-gray-50 focus:border-blue-700 focus:outline-none cursor-pointer"
                />
                
                {/* Botón de envío */}
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Subiendo...' : 'Subir Logo'}
                </button>
            </form>
            
            {/* Mensaje de estado */}
            {message && <p className={`mt-4 text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
        </div>
    );
};

export default LogoAdmin;
