import { useState, useEffect } from "react";
import "../styles/GestionAhorros.css"; // Importar el archivo CSS
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
    <div className="gestion-ahorros-container">
      <h2 className="titulo">Gestión de Ahorros</h2>

      {/* Tabla de ahorros */}
      <table className="ahorros-table">
        <thead>
          <tr>
            <th>Monto</th>
            <th>Frecuencia</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ahorros.map((ahorro) => (
            <tr key={ahorro._id}>
              <td>
                {editando?._id === ahorro._id ? (
                  <input type="number" name="monto" value={editando?.monto || ""} onChange={handleChange} />
                ) : (
                  `$${ahorro.monto}`
                )}
              </td>
              <td>
                {editando?._id === ahorro._id ? (
                  <select name="tipo" value={editando?.tipo || ""} onChange={handleChange}>
                    <option value="Semanal">Semanal</option>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                ) : (
                  ahorro.tipo
                )}
              </td>
              <td>{new Date(ahorro.fechaCreacion).toLocaleDateString()}</td>
              <td className="action-buttons">
                {editando?._id === ahorro._id ? (
                  <>
                    <button className="save-btn" onClick={handleSave}>Guardar</button>
                    <button className="cancel-btn" onClick={handleCancel}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button className="edit-btn" onClick={() => handleEdit(ahorro)}>Editar</button>
                    <button className="delete-btn" onClick={() => confirmDelete(ahorro._id)}>Eliminar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario para Agregar Ahorro */}
      <div className="add-ahorro-form">
        <h3>Agregar Nuevo Ahorro</h3>
        <input type="number" placeholder="Ingrese monto" value={nuevoMonto} onChange={(e) => setNuevoMonto(e.target.value)} />
        <select value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)}>
          <option value="Semanal">Semanal</option>
          <option value="Quincenal">Quincenal</option>
          <option value="Mensual">Mensual</option>
        </select>
        <button onClick={handleAdd}>Agregar Ahorro</button>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>¿Está seguro de que desea eliminar este ahorro?</h3>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleDelete}>Sí, Eliminar</button>
              <button className="cancel-btn" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAhorros;
