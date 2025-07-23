import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import API_URL from "../apiConfig"; // IMPORTA aquí tu URL base del backend

export default function PagoOpenpay({ amount, description, onSuccess, onClose }) {
  const [form, setForm] = useState({
    name: "",
    last_name: "",
    email: "",
    holder_name: "",
    card_number: "",
    expiration_month: "",
    expiration_year: "",
    cvv2: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [fail, setFail] = useState(false);
  const formRef = useRef(null);
  
  useEffect(() => {
    if (window.OpenPay) {
      window.OpenPay.setId("mowehlb4cgd7c1nwomub");
      window.OpenPay.setApiKey("pk_0e95ddb477b548d1a0134a3f42b7d134");
      window.OpenPay.setSandboxMode(true);
    } else {
      setMsg("OpenPay no está definido. Carga el script en tu index.html");
    }
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePay = (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setSuccess(false);
    setFail(false);

    if (!window.OpenPay) {
      setMsg("OpenPay no está disponible en la ventana.");
      setLoading(false);
      setFail(true);
      return;
    }

    const cardNumberClean = form.card_number.replace(/\D/g, "");
    const cardData = {
      holder_name: form.holder_name,
      card_number: cardNumberClean,
      cvv2: form.cvv2,
      expiration_month: form.expiration_month,
      expiration_year: form.expiration_year,
    };

    window.OpenPay.token.create(
      cardData,
      (response) => {
        const token_id = response.data.id;
        const deviceSessionId = window.OpenPay.deviceData.setup(
          formRef.current,
          "deviceIdHiddenFieldName"
        );

        // *** Cambia aquí la llamada a axios usando API_URL ***
        axios
          .post(`${API_URL}/api/openpay/pay`, {
            token_id,
            device_session_id: deviceSessionId,
            amount: amount,
            description: description,
            customer: {
              name: form.name,
              last_name: form.last_name,
              email: form.email,
            },
          })
          .then((res) => {
            setMsg("¡Pago exitoso! Folio: " + res.data.charge.id);
            setSuccess(true);
            setFail(false);
            setLoading(false);
            if (onSuccess) onSuccess(res.data.charge);
          })
          .catch((err) => {
            setMsg(
              "Error en pago: " +
                (err.response?.data?.message || err.message)
            );
            setSuccess(false);
            setFail(true);
            setLoading(false);
          });
      },
      (err) => {
        setMsg(
          "Error tokenizando tarjeta: " +
            (err.data?.description || JSON.stringify(err))
        );
        setSuccess(false);
        setFail(true);
        setLoading(false);
      }
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 relative px-5 py-7">
        {/* Botón para cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
          title="Cerrar"
          type="button"
        >
          ×
        </button>
        <h2 className="text-center text-2xl font-bold text-blue-800 mb-6">
          Pagar con Tarjeta
        </h2>
        {success ? (
          <div className="flex flex-col items-center py-10">
            <svg
              className="w-16 h-16 text-green-500 mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700 text-lg font-bold">{msg}</p>
            <p className="text-gray-600 mt-2">Puedes cerrar esta ventana.</p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow"
            >
              Cerrar
            </button>
          </div>
        ) : fail ? (
          <div className="flex flex-col items-center py-10">
            <svg
              className="w-16 h-16 text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="currentColor"
                strokeWidth="2"
                d="M15 9l-6 6M9 9l6 6"
              />
            </svg>
            <p className="text-red-600 text-lg font-bold">{msg}</p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form
            ref={formRef}
            id="payment-form"
            onSubmit={handlePay}
            autoComplete="off"
            className="space-y-3"
          >
            <input type="hidden" id="deviceIdHiddenFieldName" />
            <input
              name="name"
              placeholder="Nombre(s)"
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 bg-blue-50 transition"
            />
            <input
              name="last_name"
              placeholder="Apellido(s)"
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 bg-blue-50 transition"
            />
            <input
              name="email"
              placeholder="Correo electrónico"
              onChange={handleInputChange}
              required
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 bg-blue-50 transition"
            />
            <input
              name="holder_name"
              placeholder="Titular de la tarjeta"
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 bg-blue-50 transition"
            />
            <input
              name="card_number"
              placeholder="Número de tarjeta"
              onChange={handleInputChange}
              required
              maxLength={19}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 bg-blue-50 transition font-mono"
              value={form.card_number.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim()}
            />
            <div className="flex gap-2">
              <input
                name="expiration_month"
                placeholder="Mes (MM)"
                onChange={handleInputChange}
                required
                maxLength={2}
                className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 bg-blue-50 transition text-center"
              />
              <input
                name="expiration_year"
                placeholder="Año (YY)"
                onChange={handleInputChange}
                required
                maxLength={2}
                className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 bg-blue-50 transition text-center"
              />
              <input
                name="cvv2"
                placeholder="CVV"
                onChange={handleInputChange}
                required
                maxLength={4}
                className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 bg-blue-50 transition text-center"
              />
            </div>
            <input
              name="amount"
              value={amount || ""}
              readOnly
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-200 text-gray-600 font-semibold cursor-not-allowed"
              placeholder="Monto a pagar"
              type="number"
              tabIndex={-1}
            />
            <input
              name="description"
              value={description || ""}
              readOnly
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-200 text-gray-600 font-semibold cursor-not-allowed"
              placeholder="Descripción"
              tabIndex={-1}
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-3 py-3 rounded-lg font-bold text-white shadow-lg transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Procesando..." : "Pagar"}
            </button>
            {msg && (
              <p
                className={`text-center mt-2 font-bold ${
                  msg.includes("exitoso")
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {msg}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
