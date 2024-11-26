import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SocialLinksManager.css';
const SocialLinksManager = () => {
    const [links, setLinks] = useState([]);
    const [newLink, setNewLink] = useState({ platform: '', url: '', status: 'active' });
    const [editId, setEditId] = useState(null);

    // Obtener todos los enlaces al montar el componente
    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const response = await axios.get('https://backendgias.onrender.com/api/social-links');
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
                const response = await axios.put(`https://backendgias.onrender.com/api/social-links/${editId}`, newLink);
                setLinks(links.map(link => (link._id === editId ? response.data : link)));
            } else {
                // Add new link
                const response = await axios.post('https://backendgias.onrender.com/api/social-links', newLink);
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
            await axios.delete(`https://backendgias.onrender.com/api/social-links/${id}`);
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
        <div className="social-links-manager">
        <h2>Administrar Enlaces de Redes Sociales</h2>
        <div className="form-container">
            <input
                type="text"
                placeholder="Plataforma"
                value={newLink.platform}
                onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                className="input-field"
            />
            <input
                type="text"
                placeholder="URL"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="input-field"
            />
            <select
                value={newLink.status}
                onChange={(e) => setNewLink({ ...newLink, status: e.target.value })}
                className="select-field"
            >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
            </select>
            <button onClick={saveLink} className="submit-button">
                {editId ? 'Actualizar Enlace' : 'Agregar Enlace'}
            </button>
            {editId && <button onClick={resetForm} className="cancel-button">Cancelar</button>}
        </div>

        <ul className="links-list">
            {links.map(link => (
                <li key={link._id} className="link-item">
                    <span>{link.platform}: {link.url} ({link.status})</span>
                    <button onClick={() => startEditing(link)} className="edit-button">Editar</button>
                    <button onClick={() => deleteLink(link._id)} className="delete-button">Eliminar</button>
                </li>
            ))}
        </ul>
    </div>
);
};
export default SocialLinksManager;
