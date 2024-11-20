import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SocialLinksManager = () => {
    const [links, setLinks] = useState([]);
    const [newLink, setNewLink] = useState({ platform: '', url: '', status: 'active' });
    const [editId, setEditId] = useState(null);

    // Obtener todos los enlaces al montar el componente
    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/social-links');
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
                const response = await axios.put(`http://localhost:5000/api/social-links/${editId}`, newLink);
                setLinks(links.map(link => (link._id === editId ? response.data : link)));
            } else {
                // Add new link
                const response = await axios.post('http://localhost:5000/api/social-links', newLink);
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
            await axios.delete(`http://localhost:5000/api/social-links/${id}`);
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
        <div>
            <h2>Administrar Enlaces de Redes Sociales</h2>
            <div>
                <input
                    type="text"
                    placeholder="Plataforma"
                    value={newLink.platform}
                    onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
                <select
                    value={newLink.status}
                    onChange={(e) => setNewLink({ ...newLink, status: e.target.value })}
                >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                </select>
                <button onClick={saveLink}>{editId ? 'Actualizar Enlace' : 'Agregar Enlace'}</button>
                {editId && <button onClick={resetForm}>Cancelar</button>}
            </div>

            <ul>
                {links.map(link => (
                    <li key={link._id}>
                        <span>{link.platform}: {link.url} ({link.status})</span>
                        <button onClick={() => startEditing(link)}>Editar</button>
                        <button onClick={() => deleteLink(link._id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SocialLinksManager;
