import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
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
    setEditingAccount(null);
  };

  const confirmDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/acc/${confirmDeleteId}`);
      setAccounts(accounts.filter((account) => account._id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
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
    <div className="p-10 bg-gray-100 rounded-lg shadow-md max-w-6xl mx-auto">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Gestión de Usuarios</h1>

      {/* Search Bar */}
      <div className="flex items-center mb-6 border border-gray-300 rounded-lg p-3 bg-white shadow-sm">
        <input
          type="text"
          placeholder="Buscar por nombre, correo, teléfono o apellidos"
          value={searchTerm}
          onChange={handleSearch}
          className="flex-1 p-2 border-none outline-none text-gray-700 text-lg"
        />
        <FaSearch className="text-blue-500 ml-2" />
      </div>

      {/* Filters */}
      <div className="flex items-center mb-6">
        <label className="mr-3 font-semibold">Filtrar por Rol:</label>
        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded-lg w-52 bg-white shadow-sm"
        >
          <option value="">Todos los roles</option>
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="empleado">Empleado</option> {/* 👈 AÑADIR ESTA LINEA */}
        </select>

      </div>

      {/* User Table */}
      <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="py-3 px-4 bg-blue-600 text-white font-semibold text-left">Nombre</th>
            <th className="py-3 px-4 bg-blue-600 text-white font-semibold text-left">Correo Electrónico</th>
            <th className="py-3 px-4 bg-blue-600 text-white font-semibold text-left">Teléfono</th>
            <th className="py-3 px-4 bg-blue-600 text-white font-semibold text-left">Rol</th>
            <th className="py-3 px-4 bg-blue-600 text-white font-semibold text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredAccounts.map((account) => (
            <tr key={account._id} className="hover:bg-gray-50">
              <td className="py-3 px-4">
                {editingAccount?._id === account._id ? (
                  <div>
                    <input
                      type="text"
                      name="nombre"
                      value={editingAccount.nombre || ''}
                      onChange={handleChange}
                      className="p-2 border border-gray-300 rounded-lg w-full"
                      placeholder="Nombre"
                    />
                    <input
                      type="text"
                      name="apellidos"
                      value={editingAccount.apellidos || ''}
                      onChange={handleChange}
                      className="p-2 border border-gray-300 rounded-lg w-full mt-2"
                      placeholder="Apellidos"
                    />
                  </div>
                ) : (
                  `${account.nombre} ${account.apellidos}`
                )}
              </td>

              <td className="py-3 px-4">
                {editingAccount?._id === account._id ? (
                  <input
                    type="email"
                    name="correo"
                    value={editingAccount.correo || ''}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-lg w-full"
                  />
                ) : (
                  account.correo
                )}
              </td>
              <td className="py-3 px-4">
                {editingAccount?._id === account._id ? (
                  <input
                    type="tel"
                    name="telefono"
                    value={editingAccount.telefono || ''}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-lg w-full"
                  />
                ) : (
                  account.telefono
                )}
              </td>
              <td className="py-3 px-4">
                {editingAccount?._id === account._id ? (
                  <select
                    name="role"
                    value={editingAccount.role || 'user'}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-lg w-full"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="empleado">Empleado</option> {/* 👈 AÑADIR ESTA LINEA */}
                  </select>

                ) : (
                  account.role
                )}
              </td>
              <td className="py-3 px-4">
                {editingAccount?._id === account._id ? (
                  <div className="flex space-x-2">
                    <button
                      className="flex items-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                      onClick={() => handleSave(account._id)}
                    >
                      <FaSave />
                      <span>Guardar</span>
                    </button>
                    <button
                      className="flex items-center space-x-2 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 ml-2"
                      onClick={handleCancel}
                    >
                      <FaTimes />
                      <span>Cancelar</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      className="flex items-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                      onClick={() => handleEdit(account)}
                    >
                      <FaUserEdit />
                      <span>Editar</span>
                    </button>
                    <button
                      className="flex items-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 ml-2"
                      onClick={() => confirmDelete(account._id)}
                    >
                      <FaUserTimes />
                      <span>Eliminar</span>
                    </button>
                  </div>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirm Deletion Modal */}
      {confirmDeleteId && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-xl mb-4">¿Estás seguro de que deseas eliminar este usuario?</h3>
            <div className="flex justify-between">
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                onClick={handleDelete}
              >
                Sí, Eliminar
              </button>
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                onClick={handleCancelDelete}
              >
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
