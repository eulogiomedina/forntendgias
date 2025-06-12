import React, { useState, useEffect } from "react";
import API_URL from "../apiConfig";
import AdminCuentaDestino from "./AdminCuentaDestino"; // Importamos la gestión de cuenta destino

const GestionPagos = () => {
  const [pagos, setPagos] = useState([]);

  // Obtener todos los pagos registrados
  useEffect(() => {
    fetch(`${API_URL}/api/pagos`)
      .then((res) => res.json())
      .then((data) => {
        const ordenEstados = { Pendiente: 0, Aprobado: 1, Rechazado: 2 };
        const pagosOrdenados = data.sort((a, b) => ordenEstados[a.estado] - ordenEstados[b.estado]);
        setPagos(pagosOrdenados);
      })
      .catch((err) => console.error("Error al obtener pagos:", err));
  }, []);

  // Aprobar un pago
  const handleAprobarPago = async (pagoId) => {
    try {
      const response = await fetch(`${API_URL}/api/pagos/${pagoId}/aprobar`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Error al aprobar el pago");

      setPagos((prevPagos) =>
        prevPagos.map((pago) =>
          pago._id === pagoId ? { ...pago, estado: "Aprobado" } : pago
        )
      );
      alert("Pago aprobado con éxito.");
    } catch (error) {
      console.error("Error al aprobar pago:", error);
    }
  };

  // Rechazar un pago
  const handleRechazarPago = async (pagoId) => {
    try {
      const response = await fetch(`${API_URL}/api/pagos/${pagoId}/rechazar`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Error al rechazar el pago");

      setPagos((prevPagos) =>
        prevPagos.map((pago) =>
          pago._id === pagoId ? { ...pago, estado: "Rechazado" } : pago
        )
      );
      alert("Pago rechazado con éxito.");
    } catch (error) {
      console.error("Error al rechazar pago:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-5 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-[#0d47a1] mb-5 text-center">
        Gestión de Pagos
      </h2>

      {/* Llamamos directamente a AdminCuentaDestino.js */}
      <AdminCuentaDestino />

      {/* Lista de pagos */}
      <div className="overflow-x-auto mt-10">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#0d47a1] text-white">
              <th className="border p-3">Usuario</th>
              <th className="border p-3">Monto</th>
              <th className="border p-3">Fecha</th>
              <th className="border p-3">Estado</th>
              <th className="border p-3">Comprobante</th>
              <th className="border p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length > 0 ? (
              pagos.map((pago) => (
                <tr key={pago._id} className="text-center">
                  <td className="border p-3">{pago.userId?.nombre || "Usuario no disponible"}</td>
                  <td className="border p-3">${pago.monto}</td>
                  <td className="border p-3">
                    {new Date(pago.fechaPago || pago.fecha).toLocaleDateString("es-MX")}
                  </td>
                  <td
                    className={`border p-3 font-bold ${
                      pago.estado === "Aprobado"
                        ? "text-green-600"
                        : pago.estado === "Rechazado"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {pago.estado}
                  </td>
                  <td className="border p-3">
                    <a
                      href={pago.comprobanteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Ver comprobante
                    </a>
                  </td>
                  <td className="border p-3">
                    {pago.estado === "Pendiente" ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleAprobarPago(pago._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazarPago(pago._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Ya revisado</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="border p-3 text-center">
                  No hay pagos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionPagos;
