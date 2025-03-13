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

  const convertirFechaLocal = (fechaISO) => {
    if (!fechaISO) return "Fecha no válida";
    const fechaUTC = new Date(fechaISO);
    // Convertimos a la zona horaria local correctamente
    const fechaLocal = new Date(fechaUTC.getUTCFullYear(), fechaUTC.getUTCMonth(), fechaUTC.getUTCDate());
    return fechaLocal.toLocaleDateString("es-MX");
  };

  // 📌 Calcular fechas de pago y recepción correctamente
  const calcularFechasPago = () => {
    if (!selectedTanda || !selectedTanda.fechasPago || !selectedTanda.participantes) return [];

    let totalParticipantes = selectedTanda.participantes.length;
    let fechas = [];

    selectedTanda.participantes.forEach((participante, index) => {
      const datosUsuario = participante.userId || participante;
      let pagos = Array(totalParticipantes).fill("-"); // Inicializamos con "-"
      let fechaRecibo = "Fecha no válida"; // Por defecto

      selectedTanda.fechasPago.forEach((fecha, i) => {
        if (String(fecha.userId) === String(datosUsuario._id)) {
          let posicion = Math.floor(i / totalParticipantes);

          if (fecha.fechaPago) {
            pagos[posicion] = convertirFechaLocal(fecha.fechaPago);
          } else {
            pagos[posicion] = "Le toca";
            if (fecha.fechaRecibo) {
              fechaRecibo = convertirFechaLocal(fecha.fechaRecibo); // ✅ Se asigna correctamente
            }
          }
        }
      });

      fechas.push({
        nombre: `${datosUsuario.nombre || "No disponible"} ${datosUsuario.apellidos || ""}`.trim(),
        correo: datosUsuario.correo || "No disponible",
        telefono: datosUsuario.telefono || "No disponible",
        fechaRecibo, // ✅ Ahora se mostrará correctamente
        pagos
      });
    });

    console.log("✅ Fechas calculadas correctamente:", fechas);
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

          <h3 className="text-xl font-semibold mb-4">Fechas de Pago</h3>
          <div className="max-h-[400px] overflow-auto border border-gray-300 rounded-md mt-5">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-center whitespace-nowrap bg-blue-500 text-white sticky top-0 z-10">#</th>
                  <th className="border border-gray-300 p-2 text-center whitespace-nowrap bg-blue-500 text-white sticky top-0 z-10">Nombre</th>
                  <th className="border border-gray-300 p-2 text-center whitespace-nowrap bg-blue-500 text-white sticky top-0 z-10">Email</th>
                  <th className="border border-gray-300 p-2 text-center whitespace-nowrap bg-blue-500 text-white sticky top-0 z-10">Teléfono</th>
                  <th className="border border-gray-300 p-2 text-center whitespace-nowrap bg-blue-500 text-white sticky top-0 z-10">Fecha de Recepción</th>
                  {selectedTanda?.participantes?.map((_, index) => (
                    <th key={index} className="border border-gray-300 p-2 text-center whitespace-nowrap bg-blue-500 text-white sticky top-0 z-10">
                      Fecha de Pago {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calcularFechasPago().map((p, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2 text-center whitespace-nowrap">{index + 1}</td>
                    <td className="border border-gray-300 p-2 text-center whitespace-nowrap">{p.nombre}</td>
                    <td className="border border-gray-300 p-2 text-center whitespace-nowrap">{p.correo}</td>
                    <td className="border border-gray-300 p-2 text-center whitespace-nowrap">{p.telefono}</td>
                    <td className="border border-gray-300 p-2 text-center whitespace-nowrap">{p.fechaRecibo}</td>
                    {p.pagos.map((pago, pagoIndex) => (
                      <td key={pagoIndex} className="border border-gray-300 p-2 text-center whitespace-nowrap">{pago}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
