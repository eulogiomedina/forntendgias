import axios from 'axios';
import React, { useEffect, useState } from 'react';
import API_URL from '../apiConfig';

const SocialLinksManager = () => {
    const [links, setLinks] = useState([]);
    const [newLink, setNewLink] = useState({ platform: '', url: '', status: 'active' });
    const [editId, setEditId] = useState(null);

    // Obtener todos los enlaces al montar el componente
    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/social-links`);
                setLinks(response.data);
            } catch (error) {
                console.error('Error fetching social links:', error);
            }
        };

        fetchLinks();
    }, []);

    // Guardar un enlace nuevo o editado
    const saveLink = async () => {
        try {
            if (editId) {
                // Edit link
                const response = await axios.put(`${API_URL}/api/social-links/${editId}`, newLink);
                setLinks(links.map(link => (link._id === editId ? response.data : link)));
            } else {
                // Add new link
                const response = await axios.post(`${API_URL}/api/social-links`, newLink);
                setLinks([...links, response.data]);
            }
            resetForm();
        } catch (error) {
            console.error('Error saving social link:', error);
            if (error.response && error.response.data.message) {
                alert(error.response.data.message); // Mostrar mensaje de error al usuario
            }
        }
    };

    // Eliminar un enlace
    const deleteLink = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/social-links/${id}`);
            setLinks(links.filter(link => link._id !== id));
        } catch (error) {
            console.error('Error deleting social link:', error);
        }
    };

    // Reiniciar formulario
    const resetForm = () => {
        setNewLink({ platform: '', url: '', status: 'active' });
        setEditId(null);
    };

    // Preparar edición de enlace
    const startEditing = (link) => {
        setNewLink(link);
        setEditId(link._id);
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">
                Administrar Enlaces de Redes Sociales
            </h2>
            <div className="space-y-6">
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Plataforma"
                        value={newLink.platform}
                        onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                        className="input input-bordered w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="URL"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        className="input input-bordered w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={newLink.status}
                        onChange={(e) => setNewLink({ ...newLink, status: e.target.value })}
                        className="select select-bordered w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                    </select>
                    <div className="flex gap-4">
                        <button
                            onClick={saveLink}
                            className="btn btn-primary w-full py-3"
                        >
                            {editId ? 'Actualizar Enlace' : 'Agregar Enlace'}
                        </button>
                        {editId && (
                            <button
                                onClick={resetForm}
                                className="btn btn-secondary w-full py-3"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ul className="mt-8">
                {links.map((link) => (
                    <li key={link._id} className="flex justify-between items-center p-4 mb-4 bg-white rounded-lg shadow-md">
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{link.platform}: {link.url}</span>
                            <span className="text-sm text-gray-500">Estado: {link.status}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => startEditing(link)}
                                className="btn btn-sm btn-warning"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => deleteLink(link._id)}
                                className="btn btn-sm btn-danger"
                            >
                                Eliminar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SocialLinksManager;
