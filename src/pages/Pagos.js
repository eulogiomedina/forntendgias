// src/pages/Pagos.js
import React, { useEffect, useState } from "react";
import API_URL from "../apiConfig";
import { Link } from "react-router-dom";

const Pagos = () => {
  const [tandas, setTandas] = useState([]);             // Todas las tandas activas para el usuario
  const [selectedTanda, setSelectedTanda] = useState(null); // Tanda seleccionada para mostrar el ticket
  const [historial, setHistorial] = useState([]);         // Historial de pagos
  const [archivo, setArchivo] = useState(null);           // Archivo comprobante
  const user = JSON.parse(localStorage.getItem("user"));

  // Obtener todas las tandas activas para el usuario
  useEffect(() => {
    if (user && user.id) {
      fetch(`${API_URL}/api/tandas/gestion-cuenta-all/${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("No se encontraron tandas para este usuario.");
          return res.json();
        })
        .then((data) => {
          setTandas(data);
          // El usuario decide cuál seleccionar
        })
        .catch((err) => console.error("Error al obtener tandas:", err));
    }
  }, [user]);

  // Obtener historial de pagos
  useEffect(() => {
    if (user && user.id) {
      fetch(`${API_URL}/api/pagos/${user.id}`)
        .then((res) => res.json())
        .then((data) => setHistorial(data))
        .catch((err) => console.error("Error al obtener historial de pagos:", err));
    }
  }, [user]);

  // Manejar clic en una tarjeta: si ya está seleccionada, se oculta; si no, se selecciona.
  const handleCardClick = (tanda) => {
    if (selectedTanda && selectedTanda._id === tanda._id) {
      setSelectedTanda(null);
    } else {
      setSelectedTanda(tanda);
    }
  };

  // Manejar el cambio en el input file para comprobante
  const handleArchivoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  // Registrar el pago (envío de comprobante a través de FormData)
  const handleRegistrarPago = async () => {
    if (!selectedTanda) {
      alert("Por favor, selecciona una tanda a pagar.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("planId", selectedTanda._id);
      formData.append("monto", selectedTanda.totalPagar); // Total a pagar (calculado en el backend)
      formData.append("fecha", new Date());
      if (archivo) {
        formData.append("comprobante", archivo);
      }
      const response = await fetch(`${API_URL}/api/pagos`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al registrar el pago.");
      }
      alert("Pago registrado con éxito.");
      setHistorial((prev) => [...prev, data.pago]);
    } catch (error) {
      console.error("Error al registrar pago:", error);
      alert(error.message);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto my-[40px] p-[110px] bg-white rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
      <h2 className="text-[32px] text-[#2c3e50] mb-[30px] text-center font-bold border-b-2 border-[#3498db] pb-[10px]">
        Registrar Pago
      </h2>
      
      {/* Lista de tarjetas de tandas */}
      <div className="flex flex-wrap gap-[20px] justify-center">
        {tandas.length > 0 ? (
          tandas.map((tanda) => (
            <div
              key={tanda._id}
              onClick={() => handleCardClick(tanda)}
              className={`p-[30px] border border-[#e0e0e0] rounded-[12px] bg-[#f9f9f9] cursor-pointer transition-transform transition-shadow duration-300 w-[250px] text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:-translate-y-[8px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] ${
                selectedTanda && selectedTanda._id === tanda._id
                  ? "border-[#3498db] bg-[#eaf6ff] shadow-[0_8px_20px_rgba(52,152,219,0.2)]"
                  : ""
              }`}
            >
              <p className="text-[16px] text-[#34495e] my-[5px]">
                {tanda.monto} {tanda.tipo}
              </p>
              <p className="text-[16px] text-[#34495e] my-[5px]">
                Posición {tanda.orden} de {tanda.participantes.length}
              </p>
            </div>
          ))
        ) : (
          <p>No tienes tandas activas.</p>
        )}
      </div>

      {/* Ticket: se muestra cuando se ha seleccionado una tanda */}
      {selectedTanda && (
        <div className="p-[30px] border border-[#e0e0e0] rounded-[12px] mt-[30px] bg-[#f0f8ff] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <p className="my-[10px] text-[18px] text-[#34495e]">
            <strong className="text-[#2980b9] font-semibold">Monto base:</strong> ${selectedTanda.monto}
          </p>
          <p className="my-[10px] text-[18px] text-[#34495e]">
            <strong className="text-[#2980b9] font-semibold">Tipo:</strong> {selectedTanda.tipo}
          </p>
          <p className="my-[10px] text-[18px] text-[#34495e]">
            <strong className="text-[#2980b9] font-semibold">Fecha de inicio (programada):</strong>{" "}
            {new Date(selectedTanda.fechaProgramada).toLocaleDateString()}
          </p>
          <p className="my-[10px] text-[18px] text-[#34495e]">
            <strong className="text-[#2980b9] font-semibold">Recibirás el dinero el:</strong>{" "}
            {new Date(selectedTanda.fechaRecepcion).toLocaleDateString()}
          </p>
          <p className="my-[10px] text-[18px] text-[#34495e]">
            <strong className="text-[#2980b9] font-semibold">Debes pagar el:</strong>{" "}
            {new Date(selectedTanda.fechaPago).toLocaleDateString()}
          </p>
          <p className="my-[10px] text-[18px] text-[#34495e]">
            <strong className="text-[#2980b9] font-semibold">Tu posición:</strong> {selectedTanda.orden} de {selectedTanda.participantes.length}
          </p>
          {selectedTanda.estaAtrasado && (
            <p className="text-[#e74c3c] font-bold text-[16px] mt-[10px]">
              ¡Estás atrasado! Se te agregan $80 de penalización.
            </p>
          )}
          <p className="text-[20px] font-bold text-[#27ae60]">
            <strong>Total a pagar:</strong> ${selectedTanda.totalPagar}
          </p>
        </div>
      )}

      <div className="mt-[20px] flex flex-col gap-[10px]">
        <label className="text-[18px] text-[#2c3e50]">Subir comprobante:</label>
        <input
          type="file"
          onChange={handleArchivoChange}
          className="p-[10px] rounded-[5px] border border-[#e0e0e0]"
        />
        <button
          onClick={handleRegistrarPago}
          className="py-[12px] px-[20px] bg-[#3498db] text-white rounded-[5px] text-[16px] cursor-pointer transition-colors duration-300 hover:bg-[#2980b9]"
        >
          Confirmar Pago
        </button>
      </div>

      <div className="mt-[40px]">
        <h3 className="text-[24px] text-[#2c3e50] mb-[15px] font-semibold border-b border-[#3498db] pb-[5px]">
          Historial de Pagos
        </h3>
        {historial.length > 0 ? (
          <ul className="list-none p-0">
            {historial.map((pago) => (
              <li
                key={pago._id}
                className="bg-white p-[15px] border border-[#e0e0e0] rounded-[8px] mb-[10px] flex justify-between"
              >
                <span>{new Date(pago.fecha).toLocaleString()}</span>
                <span>${pago.monto}</span>
                <span>{pago.estado}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay pagos registrados.</p>
        )}
      </div>

      {/* Ejemplo de enlace de regreso (opcional) */}
      <Link
        to="/"
        className="inline-block mt-[30px] py-[12px] px-[20px] bg-[#3498db] text-white no-underline rounded-[6px] text-center text-[16px] transition-colors transition-transform duration-300 hover:bg-[#2980b9] hover:-translate-y-[2px]"
      >
        Regresar
      </Link>
    </div>
  );
};

export default Pagos;
