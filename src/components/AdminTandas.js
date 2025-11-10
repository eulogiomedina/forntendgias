import { useState, useEffect } from "react";
import API_URL from '../apiConfig';


const AdminTandas = () => {
  const [tandas, setTandas] = useState([]);
  const [selectedTanda, setSelectedTanda] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [totalCiclos, setTotalCiclos] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); 
  const [fechasPago, setFechasPago] = useState([]);
  const [isEditingOrden, setIsEditingOrden] = useState(false);


  // 📌 Cargar todas las tandas disponibles
  useEffect(() => {
    fetch(`${API_URL}/api/tandas`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTandas(data);
        } else {
          setError("La API no devolvió un array válido.");
          setTandas([]);
        }
      })
      .catch((err) => {
        console.error("❌ Error al cargar tandas:", err);
        setError(err.message || "No se pudieron cargar las tandas.");
      });
  }, []);

  // 📌 Seleccionar una tanda y mostrar sus detalles
  const handleSelectTanda = (tanda) => {
    if (!tanda) return;
    setSelectedTanda(selectedTanda?._id === tanda._id ? null : tanda);
    setFechaInicio(tanda.fechaInicio ? tanda.fechaInicio.split("T")[0] : "");
    setTotalCiclos(tanda.totalCiclos || "");
    setFechasPago(calcularFechasPago()); // 🔥 Asegurar que las fechas se actualicen
    setIsEditing(false);
  };

  function moverParticipante(participantes, id, nuevoOrden) {
    const lista = [...participantes];
    const oldIndex = lista.findIndex(p => p._id === id);
    if (oldIndex === -1) return lista;
    const [moved] = lista.splice(oldIndex, 1);
    lista.splice(nuevoOrden - 1, 0, moved);
    // Reasigna el orden de todos
    return lista.map((p, idx) => ({ ...p, orden: idx + 1 }));
  }


  const handleGuardarOrden = async () => {
  if (!selectedTanda) return;

  try {
    const res = await fetch(`${API_URL}/api/tandas/${selectedTanda._id}/actualizar-orden`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantes: eliminarDuplicadosPorId(selectedTanda.participantes).map((p, idx) => ({
          _id: p._id,
          orden: p.orden,
          posicion: idx
        }))
      })

    });

    if (!res.ok) throw new Error(`Error ${res.status}: No se pudo actualizar el orden.`);

    const data = await res.json();

    // ✅ Actualiza directamente
    setSelectedTanda(data.tanda);
    setFechasPago(calcularFechasPago(data.tanda));  // 🔥 Aquí pasa el nuevo data.tanda

    alert("✅ Orden de participantes actualizado correctamente.");
    setIsEditingOrden(false);
  } catch (err) {
    console.error("❌ Error al guardar orden:", err);
    alert("No se pudo actualizar el orden. Intente de nuevo.");
  }
};
  const convertirFechaLocal = (fechaISO) => {
    if (!fechaISO) return "Fecha no válida";
    const fechaUTC = new Date(fechaISO);
    // Convertimos a la zona horaria local correctamente
    const fechaLocal = new Date(fechaUTC.getUTCFullYear(), fechaUTC.getUTCMonth(), fechaUTC.getUTCDate());
    return fechaLocal.toLocaleDateString("es-MX");
  };

  function eliminarDuplicadosPorId(arr) {
    const seen = new Set();
    return arr.filter(p => {
      if (seen.has(p._id)) return false;
      seen.add(p._id);
      return true;
    });
  }


// 📌 Calcular fechas de pago y recepción correctamente
const calcularFechasPago = (tanda = selectedTanda) => {
  if (!tanda || !tanda.fechasPago || !tanda.participantes) return [];

  const participantesOrdenados = tanda.participantes;
  let fechas = [];

  participantesOrdenados.forEach((participante) => {
    const datosUsuario = participante.userId || participante;
    let pagos = Array(participantesOrdenados.length).fill("-");
    let fechaRecibo = "-";

    tanda.fechasPago.forEach((fp) => {
      // CAMBIO AQUÍ: compara por userId, NO participacionId
      if (String(fp.userId) === String(datosUsuario._id)) {
        const indexCiclo = pagos.findIndex(p => p === "-");
        if (fp.fechaPago) {
          pagos[indexCiclo] = convertirFechaLocal(fp.fechaPago);
        } else if (fp.fechaRecibo) {
          pagos[indexCiclo] = "Le toca";
          fechaRecibo = convertirFechaLocal(fp.fechaRecibo);
        }
      }
    });

    fechas.push({
      nombre: `${datosUsuario.nombre || "No disponible"} ${datosUsuario.apellidos || ""}`.trim(),
      correo: datosUsuario.correo || "No disponible",
      telefono: datosUsuario.telefono || "No disponible",
      fechaRecibo,
      pagos
    });
  });

  // console.log("✅ Fechas agrupadas por participación:", fechas);
  return fechas;
};


  // 📌 Guardar cambios (Fecha de Inicio y Máximo de Integrantes)
  const handleGuardarCambios = async (tandaId) => {
    if (!fechaInicio || !totalCiclos || isNaN(totalCiclos) || totalCiclos <= 0) {
      alert("Ingrese una fecha de inicio válida y un número mayor a 0 para los participantes.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/tandas/${tandaId}/definir-fecha`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaInicio, totalCiclos: Number(totalCiclos) }),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudo actualizar.`);
      }

      const data = await res.json();

      // 🔥 Actualiza la tanda y las fechas de pago en el frontend
      setTandas(tandas.map((t) => (t._id === tandaId ? data.tanda : t)));
      setSelectedTanda(data.tanda);
      setFechasPago(calcularFechasPago(data.tanda));
      setIsEditing(false);
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      alert("No se pudo actualizar la tanda. Verifique los datos e intente de nuevo.");
    }
  };

  // 📌 Confirmar eliminación de tanda
  const confirmDelete = (id) => {
    setConfirmDeleteId(id);
  };

  // 📌 Eliminar tanda
  const handleDelete = () => {
    if (!confirmDeleteId) return;

    fetch(`${API_URL}/api/tandas/${confirmDeleteId}`, { method: "DELETE" })
      .then(() => {
        setTandas(tandas.filter((t) => t._id !== confirmDeleteId));
        setConfirmDeleteId(null);
        if (selectedTanda?._id === confirmDeleteId) setSelectedTanda(null);
      })
      .catch((err) => console.error("Error al eliminar tanda:", err));
  };

  return (
    <div className="max-w-[1000px] mx-auto p-5">
      <h2 className="text-2xl font-bold mb-4">Gestión de Tandas</h2>

      {error && <p className="text-red-500">{error}</p>}

      {tandas.length === 0 ? (
        <p>No hay tandas registradas.</p>
      ) : (
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 text-center whitespace-nowrap bg-blue-500 text-white sticky top-0 z-10">Monto</th>
              <th className="border border-gray-300 p-2 text-center whitespace-nowrap bg-blue-500 text-white sticky top-0 z-10">Frecuencia</th>
              <th className="border border-gray-300 p-2 text-center whitespace-nowrap bg-blue-500 text-white sticky top-0 z-10">Participantes Actuales</th>
              <th className="border border-gray-300 p-2 text-center whitespace-nowrap bg-blue-500 text-white sticky top-0 z-10">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tandas.map((tanda) => tanda && (
              <tr key={tanda._id}>
                <td className="border border-gray-300 p-2 text-center whitespace-nowrap">${tanda.monto || "N/A"}</td>
                <td className="border border-gray-300 p-2 text-center whitespace-nowrap">{tanda.tipo || "N/A"}</td>
                <td className="border border-gray-300 p-2 text-center whitespace-nowrap">
                  {tanda.participantes?.length || 0} / {tanda.totalCiclos || "N/A"}
                </td>
                <td className="border border-gray-300 p-2 text-center whitespace-nowrap">
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition-colors mr-2"
                    onClick={() => handleSelectTanda(tanda)}
                  >
                    {selectedTanda?._id === tanda._id ? "Ocultar" : "Ver Detalles"}
                  </button>
                  <button 
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-colors"
                    onClick={() => confirmDelete(tanda._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedTanda && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">
            Detalles de la tanda: ${selectedTanda.monto} ({selectedTanda.tipo})
          </h3>

          <div className="mb-4 space-y-4">
            <div className="flex items-center space-x-2">
              <label className="w-40">Fecha de Inicio:</label>
              <input 
                type="date" 
                value={fechaInicio} 
                disabled={!isEditing}
                onChange={(e) => setFechaInicio(e.target.value)} 
                className="border border-gray-300 p-1 rounded"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="w-40">Máx. Integrantes:</label>
              <input 
                type="number" 
                min="1"
                step="1"
                value={totalCiclos}
                disabled={!isEditing}
                onChange={(e) => setTotalCiclos(e.target.value)}
                className="border border-gray-300 p-1 rounded"
              />
            </div>
            
            {isEditing ? (
              <>
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded transition-colors mr-2"
                  onClick={() => handleGuardarCambios(selectedTanda._id)}
                >
                  Guardar
                </button>
                <button 
                  className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded transition-colors"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition-colors"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </button>
            )}
          </div>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mb-2"
            onClick={() => setIsEditingOrden(!isEditingOrden)}
          >
            {isEditingOrden ? "Cerrar Orden Manual" : "Editar Tabla"}
          </button>

          <h3 className="text-xl font-semibold mb-4">Fechas de Pago</h3>
          <div className="max-h-[400px] overflow-auto border border-gray-300 rounded-md mt-5">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr>
                  {/* 🔥 Elimina la columna “Mover” porque ya no se usa */}
                  <th className="border p-2 text-center bg-blue-500 text-white sticky top-0">#</th>
                  <th className="border p-2 text-center bg-blue-500 text-white sticky top-0">Nombre</th>
                  <th className="border p-2 text-center bg-blue-500 text-white sticky top-0">Email</th>
                  <th className="border p-2 text-center bg-blue-500 text-white sticky top-0">Teléfono</th>
                  <th className="border p-2 text-center bg-blue-500 text-white sticky top-0">Fecha de Recepción</th>
                  {selectedTanda?.participantes?.map((_, index) => (
                    <th key={index} className="border p-2 text-center bg-blue-500 text-white sticky top-0">
                      Fecha de Pago {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {calcularFechasPago().map((p, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2 text-center">{p.nombre}</td>
                    <td className="border p-2 text-center">{p.correo}</td>
                    <td className="border p-2 text-center">{p.telefono}</td>
                    <td className="border p-2 text-center">{p.fechaRecibo}</td>
                    {p.pagos.map((pago, pagoIndex) => (
                      <td key={pagoIndex} className="border p-2 text-center">{pago}</td>
                    ))}
                  </tr>
                ))}
              </tbody>

            </table>
            {isEditingOrden && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  Editar Orden de Participantes
                </h3>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {eliminarDuplicadosPorId([...selectedTanda.participantes])
                    .sort((a, b) => a.orden - b.orden)
                    .map((p, index, arr) => (
                      <div key={p._id} className="flex items-center space-x-2">
                        <span className="w-6">{index + 1}.</span>
                        <span className="flex-1">{p.userId.nombre} {p.userId.apellidos}</span>
                        <select
                          value={index + 1}
                          onChange={e => {
                            setSelectedTanda(prev => ({
                              ...prev,
                              participantes: moverParticipante(prev.participantes, p._id, Number(e.target.value))
                            }));
                          }}
                          className="w-16 border border-gray-300 rounded p-1"
                        >
                          {Array.from({ length: arr.length }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                    ))
                  }
                </div>


                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                    onClick={handleGuardarOrden}
                  >
                    Guardar
                  </button>
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
                    onClick={() => setIsEditingOrden(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>  
          </div>  
      )}  

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-semibold mb-4">¿Está seguro de que desea eliminar esta tanda?</h3>
            <div className="mt-4 flex space-x-4">
              <button 
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-colors"
                onClick={handleDelete}
              >
                Sí, Eliminar
              </button>
              <button 
                className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded transition-colors"
                onClick={() => setConfirmDeleteId(null)}
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

export default AdminTandas;
