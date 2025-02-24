import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import '../styles/UserManagement.css';
import { FaUserEdit, FaUserTimes, FaSave, FaSearch, FaTimes } from 'react-icons/fa';

const UserManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: '' });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/acc`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount({ ...account });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`${API_URL}/api/acc/${id}`, editingAccount);
      setEditingAccount(null);
      fetchAccounts();
    } catch (error) {
      console.error('Error al actualizar cuenta:', error);
    }
  };

  const handleCancel = () => {
    setEditingAccount(null); // Cancelar la edición y volver a la vista normal
  };

  const confirmDelete = (id) => {
    setConfirmDeleteId(id); // Muestra el modal para confirmar
  };
  
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/acc/${confirmDeleteId}`);
      setAccounts(accounts.filter((account) => account._id !== confirmDeleteId));
      setConfirmDeleteId(null); // Cierra el modal después de eliminar
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
    }
  };
  
  const handleCancelDelete = () => {
    setConfirmDeleteId(null); // Cierra el modal sin eliminar
  };
  
  

  const handleChange = (e) => {
    setEditingAccount({ ...editingAccount, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredAccounts = accounts.filter((account) => {
    const search = searchTerm.toLowerCase();
    return (
      (account.nombre.toLowerCase().includes(search) ||
        account.apellidos.toLowerCase().includes(search) ||
        account.correo.toLowerCase().includes(search) ||
        account.telefono.includes(search)) &&
      (filters.role === '' || account.role === filters.role)
    );
  });

  return (
    <div className="user-management">
      <h1>Gestión de Usuarios</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre, correo, teléfono o apellidos"
          value={searchTerm}
          onChange={handleSearch}
        />
        <FaSearch className="search-icon" />
      </div>

      <div className="filters">
        <label>Filtrar por Rol:</label>
        <select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">Todos los roles</option>
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo Electrónico</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredAccounts.map((account) => (
            <tr key={`${account._id}-${editingAccount?._id === account._id ? 'editing' : 'view'}`}>
              <td>
                {editingAccount?._id === account._id ? (
                  <>
                    <input
                      type="text"
                      name="nombre"
                      value={editingAccount.nombre || ''}
                      onChange={handleChange}
                      placeholder="Nombre"
                    />
                    <input
                      type="text"
                      name="apellidos"
                      value={editingAccount.apellidos || ''}
                      onChange={handleChange}
                      placeholder="Apellidos"
                    />
                  </>
                ) : (
                  `${account.nombre} ${account.apellidos}`
                )}
              </td>
              <td>
                {editingAccount?._id === account._id ? (
                  <input
                    type="email"
                    name="correo"
                    value={editingAccount.correo || ''}
                    onChange={handleChange}
                  />
                ) : (
                  account.correo
                )}
              </td>
              <td>
                {editingAccount?._id === account._id ? (
                  <input
                    type="tel"
                    name="telefono"
                    value={editingAccount.telefono || ''}
                    onChange={handleChange}
                  />
                ) : (
                  account.telefono
                )}
              </td>
              <td>
                {editingAccount?._id === account._id ? (
                  <select
                    name="role"
                    value={editingAccount.role || 'user'}
                    onChange={handleChange}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                ) : (
                  account.role
                )}
              </td>
              <td>
                {editingAccount?._id === account._id ? (
                  <>
                    <button
                      className="save-btn"
                      onClick={() => handleSave(account._id)}
                    >
                      <FaSave /> Guardar
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={handleCancel}
                    >
                      <FaTimes /> Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(account)}
                    >
                      <FaUserEdit /> Editar
                    </button>
                    <button className="delete-btn" onClick={() => confirmDelete(account._id)}>
                    <FaUserTimes /> Eliminar
                    </button>

                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {confirmDeleteId && (
    <div className="modal-overlay">
        <div className="modal-content">
        <h3>¿Estás seguro de que deseas eliminar este usuario?</h3>
        <div className="modal-buttons">
            <button className="confirm-btn" onClick={handleDelete}>
            Sí, Eliminar
            </button>
            <button className="cancel-btn" onClick={handleCancelDelete}>
            Cancelar
            </button>
        </div>
        </div>
    </div>
    )}

    </div>
  );
};

export default UserManagement;
