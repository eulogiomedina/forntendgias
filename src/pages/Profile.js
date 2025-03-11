import React, { useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [newName, setNewName] = useState(user.nombre || '');
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '/default-avatar.png');

  // Manejar la carga de una nueva foto de perfil
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar los cambios en el perfil
  const handleSave = () => {
    const updatedUser = { ...user, nombre: newName, profilePicture };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('Perfil actualizado con éxito.');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-20">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Mi Perfil</h1>

      {/* Sección de foto de perfil */}
      <div className="flex justify-center mb-6">
        <img src={profilePicture} alt="Foto de perfil" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-teal-500" />
        <input
          type="file"
          onChange={handleFileChange}
          className="ml-4 cursor-pointer text-teal-600"
        />
      </div>

      {/* Formulario para actualizar el nombre */}
      <div className="mb-6">
        <label htmlFor="name" className="block text-lg font-medium text-gray-700">Nombre</label>
        <input
          id="name"
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
          className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Botón para guardar los cambios */}
      <button
        onClick={handleSave}
        className="w-full py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
      >
        Guardar cambios
      </button>
    </div>
  );
};

export default Profile;
