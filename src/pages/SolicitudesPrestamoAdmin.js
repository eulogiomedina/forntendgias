import React, { useEffect, useState } from "react";
import API_URL from "../apiConfig";
import { FaPhoneAlt, FaTrash } from "react-icons/fa";

// Mapea "puntual_en_ahorros_previos" a número
function mapPuntualidad(valor) {
  if (typeof valor === "number") return valor;
  if (valor === "Siempre") return 2;
  if (valor === "A veces") return 1;
  return 0; // "Nunca" o cualquier otro
}

export default function SolicitudesPrestamoAdmin() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPredModal, setShowPredModal] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [predMsg, setPredMsg] = useState("");
  const [prediccion, setPrediccion] = useState(null);

  // Cargar solicitudes
  useEffect(() => {
    const fetchSolicitudes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/solicitudes-prestamo`);
        const data = await res.json();
        setSolicitudes(data);
      } catch {
        setSolicitudes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitudes();
  }, []);

  const handleSeleccionar = (solicitud) => {
    setSeleccionada(solicitud);
    setPredMsg("");
    setPrediccion(null);
  };

  const handleContactar = (numero) => {
    setContactNumber(numero);
    setShowContactModal(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta solicitud?")) return;
    try {
      await fetch(`${API_URL}/api/solicitudes-prestamo/${id}`, { method: "DELETE" });
      setSolicitudes((prev) => prev.filter((s) => s._id !== id));
      if (seleccionada && seleccionada._id === id) setSeleccionada(null);
    } catch {
      alert("Error al eliminar la solicitud");
    }
  };

  // Integración real con Flask
  const handlePredecir = async () => {
    if (!seleccionada) return;
    setLoading(true);

    // Construye el payload tal como lo espera el modelo Flask
    const payload = {
  nivel_compromiso_financiero: seleccionada.nivel_compromiso_financiero,
  tiene_ingreso_fijo: seleccionada.tiene_ingreso_fijo,
  puntual_en_ahorros_previos: seleccionada.puntual_en_ahorros_previos, // Directo, ya es número
  ingreso_mensual_aprox: seleccionada.ingreso_mensual_aprox,
  cuenta_con_ahorros: seleccionada.cuenta_con_ahorros,
  tiene_dependientes: seleccionada.tiene_dependientes,
  egresos_mensuales_aprox: seleccionada.egresos_mensuales_aprox
};


    try {
      const MODEL_URL = "https://modelgias.onrender.com/api/prediccion";
      const response = await fetch(MODEL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok && data && typeof data.es_buen_pagador !== "undefined") {
        setPrediccion(data.es_buen_pagador);
        setPredMsg(
          data.es_buen_pagador === 1
            ? `Buen pagador (aprobado)\nProbabilidad: ${(data.probabilidad * 100).toFixed(1)}%`
            : `Mal pagador (rechazado)\nProbabilidad: ${(data.probabilidad * 100).toFixed(1)}%`
        );
        setShowPredModal(true);
      } else {
        setPredMsg("Error en la predicción. Intenta más tarde.");
        setShowPredModal(true);
      }
    } catch (err) {
      setPredMsg("No se pudo conectar al modelo.");
      setShowPredModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[82vh] flex items-center justify-center bg-[#f7fafd] py-10 px-2">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-14 px-2">
        {/* Lista de solicitudes */}
        <div
          className="flex-1 bg-white rounded-2xl shadow p-8"
          style={{ minHeight: 540, maxHeight: 540, display: "flex", flexDirection: "column" }}
        >
          <h2 className="text-3xl font-bold mb-8 text-[#0d47a1] text-center">
            Solicitudes de Préstamo
          </h2>
          <ul className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100 pr-2">
            {solicitudes.map((s) => (
              <li
                key={s._id}
                className={`flex items-center justify-between gap-2 py-3 px-2 mb-1 rounded-xl transition
                  ${seleccionada && s._id === seleccionada._id ? "bg-blue-50" : "hover:bg-gray-100"}
                `}
                onClick={() => handleSeleccionar(s)}
                style={{ cursor: "pointer" }}
              >
                <span className="font-semibold text-lg">{s.nombre_completo}</span>
                <div className="flex gap-2">
                  <button
                    className="flex items-center bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm gap-2"
                    onClick={e => { e.stopPropagation(); handleContactar(s.numero_telefonico); }}
                  >
                    <FaPhoneAlt /> Contactar
                  </button>
                  <button
                    className="flex items-center bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded shadow text-sm gap-2"
                    onClick={e => { e.stopPropagation(); handleEliminar(s._id); }}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Detalle de solicitud y predicción */}
        <div
          className="flex-1 bg-white rounded-2xl shadow p-8 flex flex-col justify-center items-center"
          style={{ minHeight: 540, maxHeight: 540 }}
        >
          <h3 className="text-3xl font-bold mb-8 text-[#0d47a1] text-center">Detalle de Solicitud</h3>
          {!seleccionada ? (
            <div className="text-gray-400 mt-20 text-lg text-center">
              Selecciona una solicitud para ver detalles.
            </div>
          ) : (
            <div className="w-full max-w-md text-lg mx-auto">
              <div className="mb-2"><strong>Nombre:</strong> {seleccionada.nombre_completo}</div>
              <div className="mb-2"><strong>Monto ahorro mensual:</strong> ${seleccionada.monto_ahorro_mensual}</div>
              <div className="mb-2"><strong>Ingreso mensual:</strong> ${seleccionada.ingreso_mensual_aprox}</div>
              <div className="mb-2"><strong>Egresos mensuales:</strong> ${seleccionada.egresos_mensuales_aprox}</div>
              <div className="mb-2"><strong>Ocupación:</strong> {seleccionada.ocupacion}</div>
              <div className="mb-2"><strong>Frecuencia ingresos:</strong> {seleccionada.frecuencia_de_ingresos}</div>
              <div className="mb-2"><strong>Razón para ahorrar:</strong> {seleccionada.razon_para_ahorrar}</div>
              <button
                className="mt-8 w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition text-lg shadow"
                onClick={handlePredecir}
                disabled={loading}
              >
                {loading ? "Prediciendo..." : "Predecir comportamiento"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Contacto */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl px-10 py-8 text-center relative max-w-xs w-full">
            <button
              className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-600"
              onClick={() => setShowContactModal(false)}
            >×</button>
            <div className="text-2xl font-bold mb-4 text-[#0d47a1]">Contacto</div>
            <div className="text-lg mb-2 text-gray-800">
              <span className="font-semibold">Número telefónico:</span>
              <br />
              <span className="text-xl font-mono text-[#0d47a1]">{contactNumber}</span>
            </div>
            <button
              className="mt-4 bg-green-500 text-white px-5 py-2 rounded hover:bg-green-700"
              onClick={() => setShowContactModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Predicción */}
      {showPredModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl px-10 py-8 text-center relative max-w-xs w-full">
            <button
              className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-600"
              onClick={() => setShowPredModal(false)}
            >×</button>
            <div className={`text-2xl font-bold mb-4 ${prediccion === 1 ? "text-green-600" : "text-red-600"}`}>
              {predMsg.split('\n').map((line, idx) => <div key={idx}>{line}</div>)}
            </div>
            <button
              className="mt-2 bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-700"
              onClick={() => setShowPredModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
