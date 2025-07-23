import React, { useState, useEffect } from "react";
import API_URL from "../apiConfig";
import {
  FaFilePdf, FaFilter, FaCheckCircle, FaTimesCircle, FaUser, FaChevronDown, FaChevronUp,
  FaDownload, FaMoneyBillWave, FaCheck, FaTimes, FaHistory, FaSearch, FaClock
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import 'chart.js/auto';

const estados = ["Todos", "Verificado", "Pendiente", "Rechazado"];
const registrosPorPagina = 5;

const formatoDinero = num => "$" + Number(num || 0).toLocaleString();

function nombreTanda(t) {
  if (!t) return "Sin tanda";
  const tipo = t.tipo || "-";
  const monto = t.monto !== undefined
    ? t.monto
    : (t.montoBase !== undefined
      ? t.montoBase
      : (t.recaudado !== undefined
        ? t.recaudado
        : "-"));
  const idCorto = t._id ? String(t._id).slice(-3) : "---";
  return `${tipo} $${monto} (${idCorto})`;
}

export default function HistorialPagos() {
  const [tandas, setTandas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [filtroTanda, setFiltroTanda] = useState("Todas las tandas");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [expandida, setExpandida] = useState(null);
  const [modalUsuario, setModalUsuario] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [verTandasAnteriores, setVerTandasAnteriores] = useState(false);

  // Trae datos reales
  useEffect(() => {
    fetch(`${API_URL}/api/tandas`).then(res => res.json()).then(setTandas);
    fetch(`${API_URL}/api/pagos`).then(res => res.json()).then(setPagos);
  }, []);

  // Filtrado de tandas por estado (arreglado y a prueba de errores)
  const tandasActuales = tandas.filter(t =>
    ["activa", "en curso", "abierta"].includes((t.estado || "").trim().toLowerCase())
  );
  const tandasAnteriores = tandas.filter(t =>
    ["finalizada", "cerrada", "terminada"].includes((t.estado || "").trim().toLowerCase())
  );

  // Historial plano por pago
  const historialPagos = pagos.map(p => {
    const tandaObj = tandas.find(t => t._id && t._id === (p.tandaId?._id || p.tandaId));
    let usuario = "Desconocido";
    let email = "";
    let telefono = "";
    if (p.userId && typeof p.userId === "object") {
      usuario = [p.userId.nombre, p.userId.apellidos].filter(Boolean).join(" ") || p.userId.nombre || "Desconocido";
      email = p.userId.correo || "";
      telefono = p.userId.telefono || "";
    }
    return {
      usuario,
      email,
      telefono,
      tanda: tandaObj ? nombreTanda(tandaObj) : (p.tandaId ? p.tandaId : "Sin tanda"),
      tipo: tandaObj?.tipo || "-",
      monto: p.monto ? formatoDinero(p.monto) : "-",
      fecha: (p.fechaPago || p.fecha || "").slice(0, 10),
      estado: p.estado || "Pendiente",
      periodo: (() => {
        if (!tandaObj) return "-";
        const idx = tandaObj.fechasPago?.findIndex(fp =>
          String(fp.userId) === String(p.userId?._id || p.userId) &&
          (fp.fechaPago && (fp.fechaPago.slice(0, 10) === (p.fechaPago || p.fecha)?.slice(0, 10)))
        );
        if (idx >= 0) {
          if (tandaObj.tipo?.toLowerCase().includes("semana")) return `Semana ${idx + 1}`;
          if (tandaObj.tipo?.toLowerCase().includes("quincena")) return `Quincena ${idx + 1}`;
          if (tandaObj.tipo?.toLowerCase().includes("mes")) return `Mes ${idx + 1}`;
          return `Ciclo ${idx + 1}`;
        }
        return "-";
      })(),
      badge: (() => {
        if (!tandaObj) return "-";
        const idx = tandaObj.fechasPago?.findIndex(fp =>
          String(fp.userId) === String(p.userId?._id || p.userId) &&
          (fp.fechaPago && (fp.fechaPago.slice(0, 10) === (p.fechaPago || p.fecha)?.slice(0, 10)))
        );
        if (idx >= 0) {
          if (tandaObj.tipo?.toLowerCase().includes("semana")) return `Semana ${idx + 1}`;
          if (tandaObj.tipo?.toLowerCase().includes("quincena")) return `Quincena ${idx + 1}`;
          if (tandaObj.tipo?.toLowerCase().includes("mes")) return `Mes ${idx + 1}`;
          return `Ciclo ${idx + 1}`;
        }
        return "-";
      })(),
      tandaRaw: tandaObj,
      id: p._id,
      statusTanda: tandaObj?.estado || "",
    };
  });

  // Todas las opciones de tandas incluyendo "Sin tanda" si existen pagos sueltos
  const listaTandas = [
    "Todas las tandas",
    ...tandas.map(nombreTanda),
    ...(pagos.filter(p => !p.tandaId).length ? ["Sin tanda"] : []),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const usuarios = Array.from(new Set(historialPagos.map(p => p.usuario).filter(Boolean)));

  useEffect(() => { setPagina(1); }, [filtroTanda, filtroUsuario, filtroEstado, verTandasAnteriores]);

  // Muestra pagos según la vista actual
  const registros = historialPagos
    // Filtrar tandas activas/anteriores, si el pago tiene tanda asociada
    .filter(p =>
      filtroTanda === "Todas las tandas" ||
      (filtroTanda === "Sin tanda" ? (p.tanda === "Sin tanda" || !p.tandaRaw) : p.tanda === filtroTanda)
    )
    .filter(p => !filtroUsuario || p.usuario === filtroUsuario)
    .filter(p => filtroEstado === "Todos" || p.estado === filtroEstado)
    .filter(p => !busqueda || p.usuario.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const totalPaginas = Math.ceil(registros.length / registrosPorPagina);
  const registrosPagina = registros.slice((pagina - 1) * registrosPorPagina);

  // Sumatorias por estado
  const sumaTotal = registros.reduce((acc, p) => acc + Number((p.monto || "0").replace(/[\$,]/g, "")), 0);
  const sumaVerificado = registros.filter(p => p.estado === "Verificado").reduce((acc, p) => acc + Number((p.monto || "0").replace(/[\$,]/g, "")), 0);
  const sumaRechazado = registros.filter(p => p.estado === "Rechazado").reduce((acc, p) => acc + Number((p.monto || "0").replace(/[\$,]/g, "")), 0);

  // Gráfica de pagos
  const dataGrafica = {
    labels: ["Verificado", "Pendiente", "Rechazado"],
    datasets: [{
      label: "Pagos",
      data: [
        registros.filter(r => r.estado === "Verificado").length,
        registros.filter(r => r.estado === "Pendiente").length,
        registros.filter(r => r.estado === "Rechazado").length,
      ],
      backgroundColor: ["#22c55e", "#eab308", "#ef4444"]
    }]
  };

  // Exportación a PDF (global, por tanda, usuario, o periodo)
  function exportarPDF(datos, nombreArchivo = "Reporte.pdf", titulo = "Reporte de Pagos") {
    const doc = new jsPDF();
    doc.text(titulo, 12, 16);
    autoTable(doc, {
      startY: 24,
      head: [["Usuario", "Tanda", "Monto", "Fecha", "Periodo", "Estado"]],
      body: datos.map(p => [
        p.usuario,
        p.tanda,
        p.monto,
        p.fecha,
        p.badge,
        p.estado
      ]),
    });
    doc.save(nombreArchivo);
  }
  const exportarHistorial = () => exportarPDF(registros, `Reporte_Pagos.pdf`, "Pagos - Todas las tandas");
  const exportarTanda = tanda =>
    exportarPDF(
      registros.filter(p => p.tanda === tanda),
      `Pagos_${tanda.replace(/[\s\$\(\)]/g, "_")}.pdf`,
      `Pagos de la tanda ${tanda}`
    );
  const exportarUsuario = usuario =>
    exportarPDF(
      registros.filter(p => p.usuario === usuario),
      `Pagos_${usuario.replace(/[\s\$\(\)]/g, "_")}.pdf`,
      `Pagos de ${usuario}`
    );
  const exportarPeriodo = periodo =>
    exportarPDF(
      registros.filter(p => p.badge === periodo),
      `Pagos_Periodo_${periodo.replace(/[\s\$\(\)]/g, "_")}.pdf`,
      `Pagos de ${periodo}`
    );

  // Colores
  const cardStyles = [
    "bg-blue-100 text-blue-700 border border-blue-200",
    "bg-green-100 text-green-700 border border-green-200",
    "bg-red-100 text-red-600 border border-red-200"
  ];
  const fondoMain = "bg-[#f5faff] min-h-screen";
  const tableHeader = "bg-blue-50 text-blue-700";
  const tableBody = "bg-white text-gray-700";

  // Todos los periodos disponibles
  const todosPeriodos = Array.from(new Set(registros.map(p => p.badge)));

  // Función para mostrar acciones extra
  function accionesFilaPago(p) {
    return (
      <div className="flex flex-col gap-1">
        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs mr-2 shadow"
          title="Ver historial del usuario"
          onClick={() => setModalUsuario(p.usuario)}
        >Detalle usuario</button>
        <button className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-xs shadow"
          title="Exportar usuario"
          onClick={() => exportarUsuario(p.usuario)}
        >Exportar usuario</button>
        <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded text-xs shadow"
          title="Exportar periodo"
          onClick={() => exportarPeriodo(p.badge)}
        >Exportar periodo</button>
      </div>
    );
  }

  return (
    <div className={fondoMain}>
      <div className="max-w-6xl mx-auto py-8 px-2 md:px-0 space-y-8">
        {/* Encabezado y acciones */}
        <div className="flex flex-wrap justify-between items-center gap-3 bg-blue-100 rounded-xl py-4 px-5 shadow border border-blue-200">
          <div className="font-bold text-2xl flex items-center gap-2 text-blue-700">
            <FaFilePdf /> Reportes de Pagos
            <span className="text-sm ml-3 flex items-center gap-2 text-gray-500">
              <FaHistory className="text-gray-400" />
            </span>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2"
              onClick={exportarHistorial}>
              <FaDownload /> Descargar Todo (PDF)
            </button>
            <input
              className="border rounded px-3 py-2"
              placeholder="Buscar usuario..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ minWidth: 180 }}
            />
          </div>
        </div>
        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-xl p-6 flex flex-col items-center ${cardStyles[0]} shadow-md`}>
            <FaMoneyBillWave className="text-3xl mb-1" />
            <span className="text-3xl font-extrabold">{formatoDinero(sumaTotal)}</span>
            <span className="text-base font-semibold opacity-80 mt-1">Pagos Recibidos</span>
          </div>
          <div className={`rounded-xl p-6 flex flex-col items-center ${cardStyles[1]} shadow-md`}>
            <FaCheck className="text-3xl mb-1" />
            <span className="text-3xl font-extrabold">{formatoDinero(sumaVerificado)}</span>
            <span className="text-base font-semibold opacity-80 mt-1">Pagos Verificados</span>
          </div>
          <div className={`rounded-xl p-6 flex flex-col items-center ${cardStyles[2]} shadow-md`}>
            <FaTimes className="text-3xl mb-1" />
            <span className="text-3xl font-extrabold">{formatoDinero(sumaRechazado)}</span>
            <span className="text-base font-semibold opacity-80 mt-1">Pagos Rechazados</span>
          </div>
        </div>
        {/* Gráfica */}
        <div className="rounded-xl bg-white border border-gray-100 shadow p-4">
          <Bar data={dataGrafica} options={{ plugins: { legend: { display: false } }, responsive: true }} />
        </div>
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center py-4 px-4 rounded-xl shadow-sm border border-blue-100 bg-blue-50">
          <select className="border rounded-lg px-3 py-2" value={filtroTanda} onChange={e => setFiltroTanda(e.target.value)}>
            {listaTandas.map(tanda => (<option key={tanda}>{tanda}</option>))}
          </select>
          <select className="border rounded-lg px-3 py-2" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            {estados.map(e => (<option key={e}>{e}</option>))}
          </select>
          <select className="border rounded-lg px-3 py-2" value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)}>
            <option value="">Todos los usuarios</option>
            {usuarios.map(u => (<option key={u}>{u}</option>))}
          </select>
          <button className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center gap-2"
            onClick={() => { setFiltroTanda("Todas las tandas"); setFiltroUsuario(""); setFiltroEstado("Todos"); setBusqueda(""); }}>
            <FaFilter /> Limpiar filtros
          </button>
        </div>
        {/* Pagos global (tabla principal) */}
        <div className="rounded-xl bg-white border border-blue-100 shadow p-4">
          <div className="font-bold text-blue-600 mb-2 text-xl">Pagos</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] rounded-xl overflow-hidden">
              <thead>
                <tr className={tableHeader}>
                  <th className="px-4 py-2">Usuario</th>
                  <th className="px-4 py-2">Tanda</th>
                  <th className="px-4 py-2">Monto</th>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Periodo</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registrosPagina.map((p, i) => (
                  <tr key={i} className={`${tableBody} text-center border-b border-blue-100`}>
                    <td className="px-4 py-2 flex items-center gap-2 justify-center">
                      <FaUser className="text-gray-400" /> {p.usuario}
                    </td>
                    <td className="px-4 py-2">{p.tanda}</td>
                    <td className="px-4 py-2">{p.monto}</td>
                    <td className="px-4 py-2">{p.fecha}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block rounded px-2 py-1 text-xs font-bold ${
                        p.tipo === "Semanal"
                          ? "bg-blue-200 text-blue-700"
                          : p.tipo === "Quincenal"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-gray-200 text-gray-700"
                      }`}>
                        {p.badge}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {p.estado === "Verificado" ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold">
                          <FaCheckCircle /> Verificado
                        </span>
                      ) : p.estado === "Pendiente" ? (
                        <span className="flex items-center gap-1 text-yellow-600 font-bold">
                          <FaClock /> Pendiente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 font-bold">
                          <FaTimesCircle /> Rechazado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{accionesFilaPago(p)}</td>
                  </tr>
                ))}
                {registrosPagina.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-gray-400 py-8">No hay pagos para los filtros seleccionados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(totalPaginas)].map((_, i) => (
              <button key={i}
                className={`w-8 h-8 rounded ${i + 1 === pagina
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
                onClick={() => setPagina(i + 1)}
              >{i + 1}</button>
            ))}
          </div>
        </div>
        {/* ----------- TABLA PRO POR PERIODOS/CICLOS ----------- */}
        <div className="rounded-xl bg-white border border-blue-100 shadow p-4 overflow-x-auto">
          <div className="font-bold text-blue-600 mb-2 text-lg">Resumen por Periodos/Ciclos</div>
          <table className="min-w-full rounded-xl overflow-hidden">
            <thead>
              <tr>
                <th className={`${tableHeader} px-2 py-1 text-xs text-left`}>Integrante</th>
                {todosPeriodos.map(periodo => {
                  const pagosPeriodo = registros.filter(p => p.badge === periodo);
                  const totalVerificados = pagosPeriodo.filter(p => p.estado === "Verificado").length;
                  const totalPendientes = pagosPeriodo.filter(p => p.estado === "Pendiente").length;
                  const totalRechazados = pagosPeriodo.filter(p => p.estado === "Rechazado").length;
                  return (
                    <th key={periodo} className={`${tableHeader} px-2 py-1 text-xs text-center min-w-[100px]`}>
                      <div className="font-semibold">{periodo}</div>
                      <div className="flex justify-center gap-1 mt-1 text-xs">
                        <span className="bg-green-100 text-green-700 px-1 rounded">{totalVerificados}✓</span>
                        <span className="bg-yellow-100 text-yellow-700 px-1 rounded">{totalPendientes}•</span>
                        <span className="bg-red-100 text-red-700 px-1 rounded">{totalRechazados}✗</span>
                      </div>
                      <button
                        className="mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                        onClick={() => exportarPeriodo(periodo)}
                        title={`Exportar pagos de ${periodo}`}
                      >
                        <FaFilePdf className="inline" /> PDF
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(registros.map(p => p.usuario))).map(integrante => (
                <tr key={integrante}>
                  <td className={`${tableBody} px-2 py-1 font-medium flex items-center gap-1 whitespace-nowrap`}>
                    <FaUser /> {integrante}
                  </td>
                  {todosPeriodos.map(periodo => {
                    const pago = registros.find(p => p.usuario === integrante && p.badge === periodo);
                    let bg = "bg-gray-50";
                    let text = "text-gray-700";
                    if (pago) {
                      if (pago.estado === "Verificado") { bg = "bg-green-100"; text = "text-green-700"; }
                      else if (pago.estado === "Pendiente") { bg = "bg-yellow-100"; text = "text-yellow-700"; }
                      else if (pago.estado === "Rechazado") { bg = "bg-red-100"; text = "text-red-700"; }
                    }
                    return (
                      <td
                        key={periodo}
                        className={`px-2 py-1 text-center cursor-pointer ${bg} ${text} rounded transition duration-150`}
                        title={pago ? `Monto: ${pago.monto}\nFecha: ${pago.fecha}` : "Sin registro"}
                        onClick={() => pago && setModalUsuario(`${pago.usuario}|${pago.badge}`)}
                        style={{ minWidth: 80, fontWeight: 500 }}
                      >
                        {pago ? (
                          pago.estado === "Verificado"
                            ? <FaCheckCircle className="inline" />
                            : pago.estado === "Pendiente"
                              ? "•"
                              : <FaTimesCircle className="inline" />
                        ) : <span>–</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* ----------- MODAL DETALLE USUARIO AVANZADO ----------- */}
        {modalUsuario && (() => {
          const [nombre, periodo] = modalUsuario.split("|");
          const detalles = registros.filter(
            r => r.usuario === nombre && (!periodo || r.badge === periodo)
          );
          return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
              <div className="rounded-xl bg-white border border-blue-200 p-8 max-w-md w-full shadow">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-bold text-lg flex items-center gap-2 text-blue-700">
                    <FaUser /> {nombre} {periodo && <span className="ml-2 text-xs text-blue-400">{periodo}</span>}
                  </div>
                  <button onClick={() => setModalUsuario(null)} className="text-gray-400 hover:text-gray-800 text-xl">&times;</button>
                </div>
                <div>
                  <div className="mb-2 font-semibold text-gray-700">
                    {periodo ? `Detalle de pago en ${periodo}:` : "Historial del usuario:"}
                  </div>
                  <ul className="space-y-2">
                    {detalles.length ? detalles.map((p, i) => (
                      <li key={i} className="flex flex-col gap-0.5 border-b pb-1 border-gray-200">
                        <span>
                          <b>{p.tanda}</b> – {p.monto} – {p.fecha} –
                          <span className={`font-bold ml-1 ${p.estado === "Verificado" ? "text-green-600" : p.estado === "Rechazado" ? "text-red-600" : "text-yellow-700"}`}>
                            {p.estado}
                          </span>
                          <span className="ml-2 text-xs text-gray-400">{p.badge}</span>
                        </span>
                        <span className="text-xs text-gray-500">Correo: {p.email} | Tel: {p.telefono}</span>
                      </li>
                    )) : <li className="text-gray-400">Sin registro</li>}
                  </ul>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={() => setModalUsuario(null)}>
                    Cerrar
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    onClick={() => exportarUsuario(nombre)}>
                    <FaFilePdf className="inline mb-1 mr-1" /> Exportar historial usuario
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
