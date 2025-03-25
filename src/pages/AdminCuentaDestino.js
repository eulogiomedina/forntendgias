import React, { useState, useEffect } from "react";
import API_URL from "../apiConfig";

const AdminCuentaDestino = () => {
  const [cuenta, setCuenta] = useState(null);
  const [formData, setFormData] = useState({
    titular: "",
    numeroCuenta: "",
    numeroTarjeta: "",
    banco: ""
  });
  const [loadingBanco, setLoadingBanco] = useState(false);
  const [errorBanco, setErrorBanco] = useState(false); // 🔸 nuevo estado

  // Obtener la cuenta destino existente
  useEffect(() => {
    fetch(`${API_URL}/api/cuenta-destino`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data._id) {
          setCuenta(data);
          setFormData(data);
        }
      })
      .catch((err) => console.error("Error al obtener la cuenta destino:", err));
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    if (name === "numeroTarjeta" && value.replace(/\s/g, "").length >= 6) {
      try {
        setLoadingBanco(true);
        setErrorBanco(false); // Reiniciar error

        const bin = value.replace(/\s/g, "").substring(0, 6);
        const res = await fetch(`${API_URL}/api/cuenta-destino/detectar-banco/${bin}`);
        const data = await res.json();

        if (res.ok && data.banco) {
          setFormData((prevForm) => ({ ...prevForm, banco: data.banco }));
        } else {
          setErrorBanco(true);
        }
      } catch (err) {
        console.error("Error al detectar banco:", err);
        setErrorBanco(true);
      } finally {
        setLoadingBanco(false);
      }
    }
  };

  const handleGuardar = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cuenta-destino`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al guardar la cuenta destino.");

      alert("Cuenta destino guardada exitosamente.");
      setCuenta(data.cuenta);
    } catch (error) {
      console.error("Error al guardar cuenta destino:", error);
      alert(error.message);
    }
  };

  const handleNuevaCuenta = () => {
    setCuenta(null);
    setFormData({
      titular: "",
      numeroCuenta: "",
      numeroTarjeta: "",
      banco: ""
    });
    setErrorBanco(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-5 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-[#0d47a1] mb-5 text-center">
        {cuenta ? "Editar Cuenta Destino" : "Registrar Cuenta Destino"}
      </h2>

      <label className="block text-lg text-gray-700">Titular:</label>
      <input
        type="text"
        name="titular"
        value={formData.titular}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <label className="block text-lg text-gray-700">Número de Cuenta:</label>
      <input
        type="text"
        name="numeroCuenta"
        value={formData.numeroCuenta}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <label className="block text-lg text-gray-700">Número de Tarjeta (Opcional):</label>
      <input
        type="text"
        name="numeroTarjeta"
        value={formData.numeroTarjeta}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <label className="block text-lg text-gray-700">Banco:</label>
      <input
        type="text"
        name="banco"
        value={formData.banco}
        onChange={handleChange}
        readOnly={loadingBanco === true || (!errorBanco && formData.numeroTarjeta.length >= 6)}
        className="w-full p-2 border rounded mb-1"
      />
      {loadingBanco && (
        <p className="text-sm text-blue-600 italic mb-2">Detectando banco...</p>
      )}
      {errorBanco && (
        <p className="text-sm text-red-600 italic mb-2">
          No se pudo detectar el banco. Por favor, ingréselo manualmente.
        </p>
      )}

      <button
        onClick={handleGuardar}
        className="w-full py-2 px-4 bg-[#0d47a1] text-white font-bold rounded hover:bg-[#06357a] transition mb-3"
      >
        {cuenta ? "Actualizar Cuenta" : "Guardar Cuenta"}
      </button>

      {cuenta && (
        <button
          onClick={handleNuevaCuenta}
          className="w-full py-2 px-4 bg-gray-500 text-white font-bold rounded hover:bg-gray-700 transition"
        >
          Registrar Otra Cuenta
        </button>
      )}
    </div>
  );
};

export default AdminCuentaDestino;
