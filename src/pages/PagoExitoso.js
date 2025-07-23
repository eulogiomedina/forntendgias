import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function PagoExitoso() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera los parámetros de la URL
  const params = new URLSearchParams(location.search);
  const tandaId = params.get("tanda");
  const userId = params.get("user");
  const monto = params.get("monto"); // Si lo agregas en la URL del backend
  const tipo = params.get("tipo");   // Si lo agregas también

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/pagos");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Fecha y hora del pago
  const fecha = new Date().toLocaleString();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <svg className="h-20 w-20 text-green-500 mb-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      </svg>
      <h1 className="text-3xl font-bold text-green-700 mb-3">¡Pago realizado correctamente!</h1>
      <p className="text-gray-700 text-lg mb-4">Tu pago fue aprobado y procesado con éxito.</p>
      {/* Resumen del pago */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 mb-6 shadow max-w-md w-full">
        <h2 className="text-lg font-bold text-green-800 mb-2">Resumen del Pago</h2>
        <div className="text-gray-800">
          <div><span className="font-semibold">ID de la tanda:</span> {tandaId || "No disponible"}</div>
          <div><span className="font-semibold">ID del usuario:</span> {userId || "No disponible"}</div>
          {tipo && <div><span className="font-semibold">Tanda:</span> {tipo}</div>}
          {monto && <div><span className="font-semibold">Monto pagado:</span> ${parseFloat(monto).toFixed(2)} MXN</div>}
          <div><span className="font-semibold">Fecha y hora:</span> {fecha}</div>
        </div>
      </div>
      <p className="text-gray-400 mb-6">Serás redirigido automáticamente a la pantalla de pagos en 5 segundos.</p>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow transition"
        onClick={() => navigate("/pagos")}
      >
        Regresar a Pagos ahora
      </button>
    </div>
  );
}
