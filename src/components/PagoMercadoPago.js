import React, { useState } from "react";
import API_URL from "../apiConfig";

const PagoMercadoPago = ({ tanda, user, recargo = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  if (!tanda || !user) return null;


  const total = tanda.monto + recargo;
   

  
  const pagarConMercadoPago = async () => {
    try {
      setLoading(true);
      setError(null);

      // Siempre deja pagar, sin importar participaciones
      const response = await fetch(`${API_URL}/api/mercadopago/create_preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concepto: `Pago tanda: ${tanda.tipo}`,
          cantidad: 1,         // Solo paga una vez el monto de la tanda seleccionada
          monto: total,
          userId: user.id,
          tandaId: tanda._id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo iniciar el pago");
      if (!data.init_point) throw new Error("No se obtuvo URL de pago");

      window.location.href = data.init_point;
    } catch (err) {
      setError(err.message || "Error al iniciar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
      <div className="flex items-center w-full justify-between mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-700">
          Pagar Tanda con <span className="block sm:inline">MercadoPago</span>
        </h2>
        <img
          src="https://logospng.org/download/mercado-pago/logo-mercado-pago-256.png"
          alt="Mercado Pago Logo"
          className="h-10 ml-3"
        />
      </div>
      <hr className="w-full my-3 border-gray-200" />
      {error && (
        <div className="w-full bg-red-100 border border-red-300 text-red-700 px-4 py-2 mb-3 rounded">
          {error}
        </div>
      )}
      <div className="w-full">
        <div className="mb-2">
          <p className="text-gray-600 text-sm">Nombre de la tanda:</p>
          <div className="text-lg font-bold text-gray-900">{tanda.tipo}</div>
        </div>
        <div className="mb-2">
          <p className="text-gray-600 text-sm">Monto a pagar:</p>
          <div className="font-bold text-blue-700">${tanda.monto.toFixed(2)} MXN</div>
        </div>
        {recargo > 0 && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1.5 my-2 rounded text-sm">
            Incluye penalización por atraso: <b>${recargo}</b>
          </div>
        )}
        <hr className="w-full my-3 border-gray-200" />
        <div className="mb-2">
          <p className="text-gray-600 text-sm">Total a pagar:</p>
          <div className="text-lg font-bold text-green-700">
            ${total.toFixed(2)} MXN
          </div>
        </div>
      </div>
      <button
        className={`mt-3 w-1/2 py-2 rounded-lg font-bold transition ${
          loading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        onClick={pagarConMercadoPago}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-white mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Procesando...
          </span>
        ) : (
          "Pagar"
        )}
      </button>
      <div className="flex items-center justify-center mt-4 text-xs text-gray-600">
        <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V6a8 8 0 00-16 0v6c0 6 8 10 8 10z"/>
        </svg>
        Tu pago está protegido con Mercado Pago
      </div>
    </div>
  );
};

export default PagoMercadoPago;
