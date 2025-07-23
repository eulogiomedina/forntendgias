import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../apiConfig";

function Toast({ message, type = "success", onClose }) {
  return (
    <div
      className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-xl shadow-lg text-white transition-all duration-500
        ${type === "error" ? "bg-red-600" : "bg-green-600"}
      `}
    >
      {message}
      <button className="ml-2 text-xl leading-3" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

function getWeekLabel(tipo = "", idx) {
  if (tipo.toLowerCase().includes("semana")) return `Semana ${idx + 1}`;
  if (tipo.toLowerCase().includes("quincena")) return `Quincena ${idx + 1}`;
  if (tipo.toLowerCase().includes("mes")) return `Mes ${idx + 1}`;
  return `Ciclo ${idx + 1}`;
}

const nombreTanda = (t) =>
  t && t.tipo ? `${t.tipo} $${t.monto} (${t._id?.slice(-3)})` : "";

export default function ValidarPagos() {
  const [tandas, setTandas] = useState([]);
  const [tandaSeleccionada, setTandaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagos, setPagos] = useState([]);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showComprobante, setShowComprobante] = useState(null);
  const [manualPago, setManualPago] = useState(null);
  const [comprobante, setComprobante] = useState(null);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [submittingValidar, setSubmittingValidar] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [semanaIdx, setSemanaIdx] = useState(0);

  // Toast auto-hide
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/api/tandas`)
      .then((res) => setTandas(res.data))
      .catch(() => setTandas([]));
  }, []);

  useEffect(() => {
    if (tandaSeleccionada) {
      axios
        .get(`${API_URL}/api/pagos`)
        .then((res) => setPagos(res.data))
        .catch(() => setPagos([]));
      setSemanaIdx(0); // Siempre iniciar en semana 1
    }
  }, [tandaSeleccionada]);

  const participantes = tandaSeleccionada?.participantes || [];
  const fechasPago = tandaSeleccionada?.fechasPago || [];

  // Agrupa fechas únicas por ciclo/semana (solo fechasPago reales, no recibo)
  const semanasUnicas = fechasPago
    .filter(f => f.fechaPago)
    .map(f => f.fechaPago)
    .filter((v, i, a) => a.indexOf(v) === i); // únicas

  const semanas = semanasUnicas.length > 0 ? semanasUnicas : [null];
  const fechaSeleccionada = semanas[semanaIdx];

  // -------------------------
  // LÓGICA DE HABILITACIÓN DE BOTONES
  // -------------------------
  const hoy = new Date();
  // Para cada semana, el botón se habilita si:
  // - Es el primer botón (idx === 0)
  // - O la fecha de hoy es > a la fecha de la semana anterior
  // Para evitar errores con fechas null o mal formateadas
  function isSemanaEnabled(idx) {
    if (idx === 0) return true;
    const fechaPrev = semanas[idx - 1];
    if (!fechaPrev) return false;
    const fechaPrevDate = new Date(fechaPrev);
    // Si hoy es al menos un día después de la anterior
    return hoy > fechaPrevDate;
  }

  // --- Tabla de integrantes para esa semana ---
  const semanaIntegrantes = participantes.map(user => {
    // Busca la fechaPagoObj de este user para la semana seleccionada
    const fechaPagoObj = fechasPago.find(
      (f) => f.userId === user.userId._id && f.fechaPago === fechaSeleccionada
    );
    // Busca el pago en la colección de pagos para este user en esa fecha
    const pagoObj = pagos.find(
      (p) =>
        p.userId &&
        p.userId._id === user.userId._id &&
        (p.tandaId === tandaSeleccionada._id || (p.tandaId?._id === tandaSeleccionada._id)) &&
        p.fechaPago?.slice(0, 10) === (fechaSeleccionada ? fechaSeleccionada.slice(0, 10) : "")
    );
    let estado = "-";
    let fecha = fechaSeleccionada ? fechaSeleccionada.slice(0, 10) : "-";
    if (fechaPagoObj) estado = "Pendiente";
    if (pagoObj) {
      estado =
      pagoObj.estado === "Verificado" || pagoObj.estado === "Aprobado"
        ? "Pagado"
        : pagoObj.estado === "Rechazado"
        ? "Rechazado"
        : "Pendiente";

      fecha = pagoObj.fechaPago ? pagoObj.fechaPago.slice(0, 10) : fecha;
    }
    return {
      nombre: user.userId?.nombre + (user.userId?.apellidos ? " " + user.userId.apellidos : ""),
      userId: user.userId?._id,
      id: user._id,
      estado,
      fecha,
      pagoObj,
    };
  });

  const semanaFiltrada = busqueda
    ? semanaIntegrantes.filter((i) =>
        i.nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    : semanaIntegrantes;

  // Validar pago
  const handleValidarPago = async (pagoId) => {
    setSubmittingValidar(pagoId);
    try {
      await axios.patch(`${API_URL}/api/pagos/${pagoId}/verificar`);
      showToast("Pago verificado exitosamente.", "success");
      const res = await axios.get(`${API_URL}/api/pagos`);
      setPagos(res.data);
    } catch (err) {
      showToast("Error al verificar pago.", "error");
    }
    setSubmittingValidar("");
  };

  // Pago manual
  const handleRegistrarManual = (userId) => {
    setManualPago({ userId });
    setShowManualModal(true);
  };

  const registrarPagoManual = async () => {
    if (!comprobante) {
      showToast("Sube un comprobante", "error");
      return;
    }
    setSubmittingManual(true);
    try {
      const formData = new FormData();
      formData.append("userId", manualPago.userId);
      formData.append("tandaId", tandaSeleccionada._id);
      formData.append("fechaPago", fechaSeleccionada);
      formData.append("comprobante", comprobante);

      await axios.post(`${API_URL}/api/pagos/manual`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowManualModal(false);
      setManualPago(null);
      setComprobante(null);
      showToast("Pago manual registrado.", "success");
      const res = await axios.get(`${API_URL}/api/pagos`);
      setPagos(res.data);
    } catch (e) {
      showToast("Error al registrar pago manual.", "error");
    }
    setSubmittingManual(false);
  };

  // Ver comprobante/rechazo
  const handleShowComprobante = (pagoObj) => {
    setShowComprobante({
      url: pagoObj.comprobanteUrl,
      estado: pagoObj.estado,
      mensajeOCR: pagoObj.mensajeOCR || null,
    });
  };

  if (!tandaSeleccionada) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
        {tandas.map((t) => {
          if (t.estado !== "Activa") return null;
          const pendientes =
            t.participantes?.filter((p) => !p.usuarioHaPagado).length || 0;
          return (
            <div
              key={t._id}
              tabIndex={0}
              className="bg-white rounded-2xl shadow-md p-6 cursor-pointer border-2 border-blue-300 focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition group outline-none"
              onClick={() => setTandaSeleccionada(t)}
            >
              <div className="text-xl font-bold text-blue-700 group-hover:text-blue-900">
                {nombreTanda(t)}
              </div>
              <div className="text-gray-500 mb-1">
                {t.totalCiclos} ciclos &bull; {t.tipo}
              </div>
              <div className="text-xs bg-blue-50 inline-block px-2 py-1 rounded text-blue-700 mb-2">
                Inicio: {t.fechaInicio?.slice(0, 10)}
              </div>
              <div className="flex gap-4 mt-2">
                <div className="font-semibold text-gray-700">
                  Integrantes:{" "}
                  <span className="text-black">{t.participantes?.length || 0}</span>
                </div>
                <div className="font-semibold text-red-600">
                  Pendientes: <span className="text-black">{pendientes}</span>
                </div>
              </div>
            </div>
          );
        })}
        {tandas.length === 0 && (
          <div className="text-center text-gray-400 mt-8 col-span-2">
            No hay tandas activas.
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <button
        className="mb-3 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded shadow"
        onClick={() => {
          setTandaSeleccionada(null);
          setBusqueda("");
          setPagos([]);
        }}
      >
        ← Volver a listado de tandas
      </button>

      <div className="bg-white rounded-2xl shadow p-6">
        {tandaSeleccionada && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div>
              <span className="text-2xl font-bold text-blue-700">
                {nombreTanda(tandaSeleccionada)}
              </span>
              <span className="ml-2 text-gray-500">
                ({tandaSeleccionada.totalCiclos} ciclos - {tandaSeleccionada.tipo})
              </span>
              <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Inicio: {tandaSeleccionada.fechaInicio?.slice(0, 10)}
              </span>
            </div>
            <input
              type="text"
              placeholder="Buscar integrante..."
              className="border rounded px-3 py-1 text-sm focus:ring focus:ring-blue-300"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ maxWidth: 220 }}
            />
          </div>
        )}

        {/* Selector de semana/ciclo */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {semanas.map((semana, idx) => {
            const fecha = semana ? semana.slice(0, 10) : "-";
            const enabled = isSemanaEnabled(idx);
            return (
              <button
                key={idx}
                className={`px-4 py-1 rounded-xl border text-sm font-bold 
                  ${idx === semanaIdx
                    ? "bg-blue-700 text-white border-blue-700 shadow"
                    : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"}
                  ${!enabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={() => enabled && setSemanaIdx(idx)}
                disabled={!enabled}
              >
                {getWeekLabel(tandaSeleccionada?.tipo, idx)}{" "}
                <span className="text-xs ml-1">{fecha}</span>
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-blue-50 rounded shadow-sm text-base">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-center">Monto</th>
                <th className="px-4 py-2 text-center">Estado</th>
                <th className="px-4 py-2 text-center">Fecha</th>
                <th className="px-4 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {semanaFiltrada.length > 0 ? (
                semanaFiltrada.map((p, idx) => (
                  <tr key={p.id + "-" + idx} className="border-t hover:bg-blue-100">
                    <td className="px-4 py-2">{p.nombre}</td>
                    <td className="px-4 py-2 text-center">${tandaSeleccionada.monto}</td>
                    <td className={`px-4 py-2 text-center font-semibold ${
                      p.estado === "Pagado" ? "text-green-700" :
                      p.estado === "Rechazado" ? "text-red-700" :
                      p.estado === "Pendiente" ? "text-yellow-700" : "text-gray-500"
                    }`}>
                      {p.estado}
                    </td>
                    <td className="px-4 py-2 text-center">{p.fecha}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {p.pagoObj && p.pagoObj.comprobanteUrl && (
                          <button
                            className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700 text-xs"
                            onClick={() => handleShowComprobante(p.pagoObj)}
                          >
                            Ver Comprobante
                          </button>
                        )}
                        {p.estado === "Pendiente" && p.pagoObj && (
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded-xl hover:bg-green-700 text-xs"
                            onClick={() => handleValidarPago(p.pagoObj._id)}
                            disabled={submittingValidar === p.pagoObj._id}
                          >
                            {submittingValidar === p.pagoObj._id ? "Validando..." : "Validar"}
                          </button>
                        )}
                        {p.estado === "Rechazado" && p.pagoObj && (
                          <>
                            <button
                              className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700 text-xs"
                              onClick={() => handleShowComprobante(p.pagoObj)}
                            >
                              Ver Detalles
                            </button>
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded-xl hover:bg-blue-700 text-xs"
                              onClick={() => handleRegistrarManual(p.userId)}
                              disabled={submittingManual}
                            >
                              Reintentar Manual
                            </button>
                          </>
                        )}
                        {p.estado !== "Pagado" && (
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded-xl hover:bg-blue-700 text-xs"
                            onClick={() => handleRegistrarManual(p.userId)}
                            disabled={submittingManual}
                          >
                            Pago Manual
                          </button>
                        )}
                        {p.estado === "Pagado" && (
                          <span className="text-green-700 font-semibold text-lg">✔</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No hay integrantes para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal pago manual */}
      {showManualModal && (
        <div
          className="fixed z-40 inset-0 bg-black bg-opacity-40 flex items-center justify-center"
          onClick={() => {
            if (!submittingManual) {
              setShowManualModal(false);
              setManualPago(null);
              setComprobante(null);
            }
          }}
        >
          <div
            className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => {
                setShowManualModal(false);
                setManualPago(null);
                setComprobante(null);
              }}
              disabled={submittingManual}
              tabIndex={0}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-2">Registrar Pago Manual</h2>
            <input
              type="file"
              accept="image/*"
              className="mb-4 block w-full text-gray-700 border border-gray-300 rounded px-3 py-2"
              onChange={(e) => setComprobante(e.target.files[0])}
              disabled={submittingManual}
            />
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400"
                disabled={submittingManual}
                onClick={() => {
                  setShowManualModal(false);
                  setManualPago(null);
                  setComprobante(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-70"
                disabled={submittingManual}
                onClick={registrarPagoManual}
              >
                {submittingManual ? "Registrando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal comprobante */}
      {showComprobante && (
        <div
          className="fixed z-50 inset-0 bg-black bg-opacity-40 flex items-center justify-center"
          onClick={() => setShowComprobante(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowComprobante(null)}
              aria-label="Cerrar"
            >×</button>
            <h2 className="text-lg font-bold mb-2">Comprobante de pago</h2>
            {showComprobante.url && (
              <img
                src={showComprobante.url}
                alt="Comprobante"
                className="w-full mb-2 rounded border"
                style={{ maxHeight: 320, objectFit: "contain" }}
              />
            )}
            {showComprobante.estado && (
              <div className="mb-2">
                <span className={`font-semibold ${showComprobante.estado === "Verificado" ? "text-green-700" : showComprobante.estado === "Rechazado" ? "text-red-700" : "text-gray-700"}`}>
                  Estado: {showComprobante.estado}
                </span>
              </div>
            )}
            {showComprobante.mensajeOCR && (
              <pre className="text-xs bg-gray-100 rounded p-2 overflow-x-auto mb-1 text-red-700">{showComprobante.mensajeOCR}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
