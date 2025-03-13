import { useState, useEffect } from "react";
import AdminTandas from "../components/AdminTandas";
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
    <div className="max-w-[900px] mx-auto mt-[110px] mb-5 p-5 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Gestión de Ahorros</h2>

      {/* Tabla de ahorros */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2.5 border-b border-gray-300">Monto</th>
            <th className="p-2.5 border-b border-gray-300">Frecuencia</th>
            <th className="p-2.5 border-b border-gray-300">Fecha Creación</th>
            <th className="p-2.5 border-b border-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ahorros.map((ahorro) => (
            <tr key={ahorro._id}>
              <td className="p-2.5 border-b border-gray-300">
                {editando?._id === ahorro._id ? (
                  <input
                    type="number"
                    name="monto"
                    value={editando?.monto || ""}
                    onChange={handleChange}
                    className="border border-gray-300 rounded p-1"
                  />
                ) : (
                  `$${ahorro.monto}`
                )}
              </td>
              <td className="p-2.5 border-b border-gray-300">
                {editando?._id === ahorro._id ? (
                  <select
                    name="tipo"
                    value={editando?.tipo || ""}
                    onChange={handleChange}
                    className="border border-gray-300 rounded p-1"
                  >
                    <option value="Semanal">Semanal</option>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                ) : (
                  ahorro.tipo
                )}
              </td>
              <td className="p-2.5 border-b border-gray-300">
                {new Date(ahorro.fechaCreacion).toLocaleDateString()}
              </td>
              <td className="p-2.5 border-b border-gray-300">
                {editando?._id === ahorro._id ? (
                  <>
                    <button
                      className="py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded font-bold m-1"
                      onClick={handleSave}
                    >
                      Guardar
                    </button>
                    <button
                      className="py-2 px-3 bg-gray-500 hover:bg-gray-600 text-white rounded font-bold m-1"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold m-1"
                      onClick={() => handleEdit(ahorro)}
                    >
                      Editar
                    </button>
                    <button
                      className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded font-bold m-1"
                      onClick={() => confirmDelete(ahorro._id)}
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
      <div className="mt-5 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Agregar Nuevo Ahorro</h3>
        <input
          type="number"
          placeholder="Ingrese monto"
          value={nuevoMonto}
          onChange={(e) => setNuevoMonto(e.target.value)}
          className="w-full p-2 mb-3 border border-gray-300 rounded"
        />
        <select
          value={nuevoTipo}
          onChange={(e) => setNuevoTipo(e.target.value)}
          className="w-full p-2 mb-3 border border-gray-300 rounded"
        >
          <option value="Semanal">Semanal</option>
          <option value="Quincenal">Quincenal</option>
          <option value="Mensual">Mensual</option>
        </select>
        <button
          onClick={handleAdd}
          className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold"
        >
          Agregar Ahorro
        </button>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-4">
              ¿Está seguro de que desea eliminar este ahorro?
            </h3>
            <div className="flex justify-center space-x-4">
              <button
                className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded font-bold"
                onClick={handleDelete}
              >
                Sí, Eliminar
              </button>
              <button
                className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded font-bold"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Gestión de Tandas del Administrador */}
      <AdminTandas />
    </div>
  );
};

export default GestionAhorros;
