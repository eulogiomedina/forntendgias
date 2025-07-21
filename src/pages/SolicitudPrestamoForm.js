import React, { useState } from "react";
import API_URL from "../apiConfig";
import { useNavigate } from "react-router-dom";

// Utilidad para transformar "Sí"/"No" a 1/0 antes de enviar al backend
function transformarBooleanos(datos) {
  const boolFields = [
    "tiene_ingreso_fijo",
    "cuenta_con_ahorros",
    "ahorra_mensualmente",
    "tiene_dependientes",
    "usa_apps_financieras",
    "ha_participado_en_ahorros"
  ];
  const nuevo = { ...datos };
  boolFields.forEach(field => {
    if (nuevo[field] === "Sí") nuevo[field] = 1;
    if (nuevo[field] === "No") nuevo[field] = 0;
    // Convierte también a número por si acaso
    if (typeof nuevo[field] === "string" && ["1", "0"].includes(nuevo[field]))
      nuevo[field] = Number(nuevo[field]);
  });
  // Asegura que todos los numéricos van como número
  [
    "ingreso_mensual_aprox",
    "egresos_mensuales_aprox",
    "monto_ahorro_mensual",
    "cuantos_dependientes",
    "nivel_compromiso_financiero",
    "educacion_financiera",
    "puntual_en_ahorros_previos"
  ].forEach(f => {
    if (typeof nuevo[f] === "string") nuevo[f] = Number(nuevo[f]);
  });
  return nuevo;
}

export default function SolicitudPrestamoForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre_completo: "",
    numero_telefonico: "",
    ingreso_mensual_aprox: "",
    egresos_mensuales_aprox: "",
    tiene_ingreso_fijo: "Sí",
    ocupacion: "Empleado",
    frecuencia_de_ingresos: "Mensual",
    cuenta_con_ahorros: "Sí",
    ahorra_mensualmente: "Sí",
    monto_ahorro_mensual: "",
    tiene_dependientes: "Sí",
    cuantos_dependientes: "0",
    nivel_compromiso_financiero: "1",
    usa_apps_financieras: "Sí",
    educacion_financiera: "1",
    ha_participado_en_ahorros: "Sí",
    puntual_en_ahorros_previos: 2, // NUMÉRICO, default a Siempre
    razon_para_ahorrar: "Meta"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Transforma campos al formato correcto
      const datos = transformarBooleanos(formData);

      const response = await fetch(`${API_URL}/api/solicitudes-prestamo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error al guardar solicitud.");
      alert("✅ Solicitud enviada correctamente");
      navigate("/dashboard");
    } catch (error) {
      alert("❌ Error al enviar la solicitud: " + error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-24 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-6 text-center">Formulario de Solicitud de Préstamo</h2>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            {/* Nombre completo */}
            <div className="mb-4">
              <label className="block font-medium">Nombre completo:</label>
              <input
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
            {/* Número telefónico */}
            <div className="mb-4">
              <label className="block font-medium">Número telefónico:</label>
              <input
                type="tel"
                name="numero_telefonico"
                value={formData.numero_telefonico}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
                pattern="[0-9]{10,15}"
                maxLength={15}
                minLength={10}
                placeholder="Ej: 7711234567"
              />
            </div>
            {[ // Resto de campos paso 1
              { label: "Ingreso mensual aprox", name: "ingreso_mensual_aprox", type: "number" },
              { label: "Egresos mensuales aprox", name: "egresos_mensuales_aprox", type: "number" },
            ].map(({ label, name, type }) => (
              <div className="mb-4" key={name}>
                <label className="block font-medium">{label}:</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
            ))}
            {/* Selects paso 1 */}
            {[
              {
                label: "¿Tiene ingreso fijo?",
                name: "tiene_ingreso_fijo",
                options: [
                  { label: "Sí", value: "Sí" },
                  { label: "No", value: "No" }
                ]
              },
              {
                label: "Ocupación",
                name: "ocupacion",
                options: ["Empleado", "Negocio propio", "Freelance", "Otro"].map(o => ({ label: o, value: o }))
              },
              {
                label: "Frecuencia de ingresos",
                name: "frecuencia_de_ingresos",
                options: ["Semanal", "Quincenal", "Mensual"].map(o => ({ label: o, value: o }))
              },
              {
                label: "¿Cuenta con ahorros?",
                name: "cuenta_con_ahorros",
                options: [
                  { label: "Sí", value: "Sí" },
                  { label: "No", value: "No" }
                ]
              },
              {
                label: "¿Ahorra mensualmente?",
                name: "ahorra_mensualmente",
                options: [
                  { label: "Sí", value: "Sí" },
                  { label: "No", value: "No" }
                ]
              }
            ].map(({ label, name, options }) => (
              <div className="mb-4" key={name}>
                <label className="block font-medium">{label}</label>
                <select
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  {options.map(opt =>
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  )}
                </select>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Siguiente
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {[ // Inputs paso 2
              { label: "Monto de ahorro mensual", name: "monto_ahorro_mensual", type: "number" },
              { label: "Número de dependientes", name: "cuantos_dependientes", type: "number" },
              { label: "Nivel de compromiso financiero (1-6)", name: "nivel_compromiso_financiero", type: "number" },
              { label: "Educación financiera (1-6)", name: "educacion_financiera", type: "number" },
            ].map(({ label, name, type }) => (
              <div className="mb-4" key={name}>
                <label className="block font-medium">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
            ))}
            {/* Selects paso 2 */}
            {[
              {
                label: "¿Tiene dependientes?",
                name: "tiene_dependientes",
                options: [
                  { label: "Sí", value: "Sí" },
                  { label: "No", value: "No" }
                ]
              },
              {
                label: "¿Usa apps financieras?",
                name: "usa_apps_financieras",
                options: [
                  { label: "Sí", value: "Sí" },
                  { label: "No", value: "No" }
                ]
              },
              {
                label: "¿Ha participado en ahorros?",
                name: "ha_participado_en_ahorros",
                options: [
                  { label: "Sí", value: "Sí" },
                  { label: "No", value: "No" }
                ]
              },
              {
                label: "¿Fue puntual en ahorros previos?",
                name: "puntual_en_ahorros_previos",
                options: [
                  { label: "Siempre", value: 2 },
                  { label: "A veces", value: 1 },
                  { label: "Nunca", value: 0 }
                ]
              },
              {
                label: "Razón para ahorrar",
                name: "razon_para_ahorrar",
                options: ["Emergencia", "Meta", "Inversión", "Otro"].map(o => ({ label: o, value: o }))
              }
            ].map(({ label, name, options }) => (
              <div className="mb-4" key={name}>
                <label className="block font-medium">{label}</label>
                <select
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  {options.map(opt =>
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  )}
                </select>
              </div>
            ))}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Anterior
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Enviar Solicitud
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
