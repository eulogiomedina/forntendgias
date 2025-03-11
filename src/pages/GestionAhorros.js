import { useState, useEffect } from "react";
import API_URL from '../apiConfig';

const GestionAhorros = () => {
  const [ahorros, setAhorros] = useState([]);
  const [editando, setEditando] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("Semanal");

  useEffect(() => {
    fetch(`${API_URL}/api/nuevos-ahorros`)
      .then((res) => res.json())
      .then((data) => setAhorros(data))
      .catch((err) => console.error("Error al cargar ahorros:", err));
  }, []);

  const handleEdit = (ahorro) => {
    setEditando({ _id: ahorro._id, monto: ahorro.monto, tipo: ahorro.tipo });
  };

  const handleSave = () => {
    if (!editando || !editando._id) {
      console.error("Error: No hay ID definido para la actualización");
      return;
    }

    fetch(`${API_URL}/api/nuevos-ahorros/${editando._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editando),
    })
      .then((res) => res.json())
      .then((data) => {
        setAhorros(ahorros.map((ahorro) => (ahorro._id === editando._id ? data : ahorro)));
        setEditando(null);
      })
      .catch((err) => console.error("Error al actualizar ahorro:", err));
  };

  const handleCancel = () => {
    setEditando(null);
  };

  const confirmDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const handleDelete = () => {
    if (!confirmDeleteId) return;
    
    fetch(`${API_URL}/api/nuevos-ahorros/${confirmDeleteId}`, { method: "DELETE" })
      .then(() => {
        setAhorros(ahorros.filter((ahorro) => ahorro._id !== confirmDeleteId));
        setConfirmDeleteId(null);
      })
      .catch((err) => console.error("Error al eliminar ahorro:", err));
  };

  const handleChange = (e) => {
    setEditando(editando ? { ...editando, [e.target.name]: e.target.value } : {});
  };

  const handleAdd = () => {
    if (!nuevoMonto || isNaN(nuevoMonto) || nuevoMonto <= 0) {
      alert("Ingrese un monto válido");
      return;
    }

    fetch(`${API_URL}/api/nuevos-ahorros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monto: Number(nuevoMonto), tipo: nuevoTipo }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAhorros([...ahorros, data]);
        setNuevoMonto("");
      })
      .catch((err) => console.error("Error al agregar ahorro:", err));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-28">
      <h2 className="text-2xl font-semibold mb-4 text-center">Gestión de Ahorros</h2>

      {/* Tabla de ahorros */}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">Monto</th>
            <th className="border-b p-2 text-left">Frecuencia</th>
            <th className="border-b p-2 text-left">Fecha Creación</th>
            <th className="border-b p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ahorros.map((ahorro) => (
            <tr key={ahorro._id}>
              <td className="p-2">
                {editando?._id === ahorro._id ? (
                  <input
                    type="number"
                    name="monto"
                    value={editando?.monto || ""}
                    onChange={handleChange}
                    className="p-2 border rounded-md"
                  />
                ) : (
                  `$${ahorro.monto}`
                )}
              </td>
              <td className="p-2">
                {editando?._id === ahorro._id ? (
                  <select
                    name="tipo"
                    value={editando?.tipo || ""}
                    onChange={handleChange}
                    className="p-2 border rounded-md"
                  >
                    <option value="Semanal">Semanal</option>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                ) : (
                  ahorro.tipo
                )}
              </td>
              <td className="p-2">{new Date(ahorro.fechaCreacion).toLocaleDateString()}</td>
              <td className="p-2 flex space-x-2">
                {editando?._id === ahorro._id ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(ahorro)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => confirmDelete(ahorro._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario para Agregar Ahorro */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Agregar Nuevo Ahorro</h3>
        <input
          type="number"
          placeholder="Ingrese monto"
          value={nuevoMonto}
          onChange={(e) => setNuevoMonto(e.target.value)}
          className="p-2 border rounded-md w-full mb-4"
        />
        <select
          value={nuevoTipo}
          onChange={(e) => setNuevoTipo(e.target.value)}
          className="p-2 border rounded-md w-full mb-4"
        >
          <option value="Semanal">Semanal</option>
          <option value="Quincenal">Quincenal</option>
          <option value="Mensual">Mensual</option>
        </select>
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Agregar Ahorro
        </button>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {confirmDeleteId && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">¿Está seguro de que desea eliminar este ahorro?</h3>
            <div className="flex justify-between">
              <button
                onClick={handleDelete}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sí, Eliminar
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
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

export default GestionAhorros;
