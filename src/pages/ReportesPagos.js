import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../apiConfig";
import {
  FaMoneyCheckAlt, FaCheckCircle, FaTimesCircle, FaSearch,
  FaChartPie, FaEye, FaDownload, FaFilter, FaFilePdf
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Nombre de tanda con formato: Tipo $Monto (últimos 3 ID)
function nombreTanda(t) {
  if (!t) return "";
  const tipo = t.tipo || "-";
  // Busca el monto en posibles propiedades
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

function getWeekLabel(tipo = "", idx) {
  if (tipo.toLowerCase().includes("semana")) return `Semana ${idx + 1}`;
  if (tipo.toLowerCase().includes("quincena")) return `Quincena ${idx + 1}`;
  if (tipo.toLowerCase().includes("mes")) return `Mes ${idx + 1}`;
  return `Ciclo ${idx + 1}`;
}

export default function ReportesPagos() {
  const [tandas, setTandas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [filtroTanda, setFiltroTanda] = useState("Todas las tandas");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [tandaDetalle, setTandaDetalle] = useState(null);
  const [pagoDetalle, setPagoDetalle] = useState(null);
  const [showGrafica, setShowGrafica] = useState(null);
  const [semanaIdx, setSemanaIdx] = useState(0);
  const [busqueda, setBusqueda] = useState("");

  // Cargar tandas y pagos de la API
  useEffect(() => {
    axios.get(`${API_URL}/api/tandas`).then(res => setTandas(res.data || []));
    axios.get(`${API_URL}/api/pagos`).then(res => setPagos(res.data || []));
  }, []);

  // Resumen global y clasificaciones
  const pagosRecibidos = pagos.length;
  const pagosVerificados = pagos.filter(p => p.estado === "Verificado").length;
  const pagosRechazados = pagos.filter(p => p.estado === "Rechazado").length;
  const pagosPendientes = pagos.filter(p => !["Verificado", "Rechazado"].includes(p.estado)).length;

  // Tandas cards resumen con nombre consistente
  const tandasResumen = tandas.map(t => {
    const pagosTanda = pagos.filter(p =>
      p.tandaId === t._id || (p.tandaId?._id === t._id)
    );
    const verificados = pagosTanda.filter(p => p.estado === "Verificado").length;
    const pendientes = pagosTanda.filter(p => !["Verificado", "Rechazado"].includes(p.estado)).length;
    const recaudado = pagosTanda
      .filter(p => p.estado === "Verificado" && p.monto)
      .reduce((acc, p) => acc + Number(p.monto), 0);

    return {
      ...t,
      nombre: nombreTanda({ ...t, monto: t.monto }), // Usa el nombre normalizado
      ciclo: t.totalCiclos,
      integrantes: t.participantes?.length || 0,
      recaudado,
      verificados,
      pendientes,
      fechasPago: t.fechasPago || [],
      participantes: t.participantes || [],
    };
  });

  // Todos los pagos según filtros generales
  const pagosFiltrados = pagos
    .filter(p =>
      (filtroTanda === "Todas las tandas" ||
        nombreTanda(tandas.find(t => t._id === p.tandaId || t._id === p.tandaId?._id)) === filtroTanda) &&
      (!fechaDesde || (p.fechaPago || p.fecha) >= fechaDesde) &&
      (!fechaHasta || (p.fechaPago || p.fecha) <= fechaHasta)
    )
    .map(p => {
      const tandaObj = tandas.find(t => t._id === p.tandaId || t._id === p.tandaId?._id);
      return {
        ...p,
        nombre: p.userId?.nombre + (p.userId?.apellidos ? ` ${p.userId.apellidos}` : ""),
        tanda: nombreTanda({ ...tandaObj, monto: tandaObj?.monto }),
        monto: p.monto ? `$${p.monto}` : "-",
        estado: p.estado || "-",
        fecha: (p.fechaPago || p.fecha || "").slice(0, 10)
      };
    });

  // Exportar a PDF
  function exportarPDF(datos, nombreArchivo = "Reporte.pdf", titulo = "Reporte de Pagos") {
    const doc = new jsPDF();
    doc.text(titulo, 12, 16);
    autoTable(doc, {
      startY: 24,
      head: [["Nombre", "Tanda", "Monto", "Estado", "Fecha"]],
      body: datos.map(p => [p.nombre, p.tanda, p.monto, p.estado, p.fecha]),
    });
    doc.save(nombreArchivo);
  }

  // Exportar general
  const exportarPDFTodo = () => exportarPDF(pagosFiltrados, "Reporte_Pagos_Todas_Tandas.pdf");

  // Exportar pagos por clasificación (recibidos, verificados, rechazados, pendientes)
  const exportarPDFClasificados = (clasificador, nombre = "Reporte.pdf", titulo = "Reporte") => {
    exportarPDF(
      pagosFiltrados.filter(clasificador),
      nombre, titulo
    );
  };

  // Exportar pagos de una tanda específica
  const exportarPDFTanda = (tanda) => {
    const pagosTanda = pagosFiltrados.filter(p => p.tanda === tanda.nombre);
    exportarPDF(
      pagosTanda,
      `Reporte_Pagos_${tanda.nombre}.pdf`,
      `Pagos de ${tanda.nombre}`
    );
  };

  // Exportar pendientes de una tanda específica
  const exportarPDFPendientesTanda = (tanda) => {
    const pagosPendientes = pagosFiltrados.filter(
      p => p.tanda === tanda.nombre && !["Verificado", "Rechazado"].includes(p.estado)
    );
    exportarPDF(
      pagosPendientes,
      `Pendientes_${tanda.nombre}.pdf`,
      `Pendientes de ${tanda.nombre}`
    );
  };

  // Exportar pagos de una semana específica en el modal de tandaDetalle
  const exportarPDFSemanaTanda = (tanda, idx, lista) => {
    exportarPDF(
      lista,
      `Pagos_${tanda.nombre}_${getWeekLabel(tanda.tipo, idx)}.pdf`,
      `Pagos de ${tanda.nombre} - ${getWeekLabel(tanda.tipo, idx)}`
    );
  };

  // Modal: detalles de tanda y de pago individual
  const verDetalleTanda = (tanda) => {
    setTandaDetalle(tanda);
    setSemanaIdx(0); // Siempre iniciar en semana 1
    setBusqueda("");
  };
  const cerrarDetalle = () => setTandaDetalle(null);
  const verDetallePago = (pago) => setPagoDetalle(pago);
  const cerrarPagoDetalle = () => setPagoDetalle(null);

  // Gráfica de pagos por tanda
  const abrirGraficaTanda = (tanda) => setShowGrafica(tanda);
  const cerrarGrafica = () => setShowGrafica(null);

  // Datos para la gráfica de barras de pagos por estado en cada tanda
  const getDataGraficaTanda = (tanda) => {
    const pagosTanda = pagos.filter(p =>
      p.tandaId === tanda._id || (p.tandaId?._id === tanda._id)
    );
    const estados = ["Verificado", "Pendiente", "Rechazado"];
    const counts = [
      pagosTanda.filter(p => p.estado === "Verificado").length,
      pagosTanda.filter(p => !["Verificado", "Rechazado"].includes(p.estado)).length,
      pagosTanda.filter(p => p.estado === "Rechazado").length,
    ];
    return {
      labels: estados,
      datasets: [
        {
          label: "Pagos",
          data: counts,
          backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
        },
      ],
    };
  };

  // ---- Integrantes por semana/ciclo ----
  let listaIntegrantesSemana = [];
  if (tandaDetalle && tandaDetalle.participantes && tandaDetalle.fechasPago?.length > semanaIdx) {
    const fechaSemana = tandaDetalle.fechasPago[semanaIdx]?.fechaPago?.slice(0, 10) || "";
    const integrantes = tandaDetalle.participantes.map(int =>
      int.userId ? { ...int.userId, _id: int.userId._id } : { ...int, _id: int._id }
    );
    const pagosSemana = pagosFiltrados.filter(
      p => p.tanda === tandaDetalle.nombre && p.fecha === fechaSemana
    );
    listaIntegrantesSemana = integrantes.map(int => {
      const pago = pagosSemana.find(p => p.userId?._id === int._id);
      return {
        nombre: int.nombre + (int.apellidos ? ` ${int.apellidos}` : ""),
        estado: pago ? pago.estado : "Pendiente",
        monto: pago ? pago.monto : "-",
        fecha: pago ? pago.fecha : fechaSemana,
        comprobanteUrl: pago?.comprobanteUrl,
      };
    });
    if (busqueda) {
      listaIntegrantesSemana = listaIntegrantesSemana.filter(
        i => i.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
  }

  return (
    <div className="space-y-8">
      {/* Título y acción global */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="font-bold text-blue-700 text-2xl flex items-center gap-2">
          <FaFilePdf className="text-xl" /> Reportes de Pagos
        </div>
        <button
          onClick={exportarPDFTodo}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow"
          title="Descargar todos los reportes"
        >
          <FaDownload /> Descargar Todo (PDF)
        </button>
      </div>

      {/* Cards tipo resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          className="rounded-xl p-5 shadow border flex flex-col items-center transition hover:scale-105 hover:shadow-lg bg-blue-100 focus:outline-none"
          onClick={() => exportarPDFClasificados(() => true, "Reporte_Pagos_Recibidos.pdf", "Pagos Recibidos")}
        >
          <div className="text-3xl mb-2"><FaMoneyCheckAlt /></div>
          <div className="text-2xl font-bold text-blue-800">{pagosRecibidos}</div>
          <div className="text-gray-700">Pagos Recibidos</div>
          <div className="mt-1 text-xs text-blue-700 font-semibold">Descargar PDF</div>
        </button>
        <button
          className="rounded-xl p-5 shadow border flex flex-col items-center transition hover:scale-105 hover:shadow-lg bg-green-100 focus:outline-none"
          onClick={() => exportarPDFClasificados(p => p.estado === "Verificado", "Reporte_Pagos_Verificados.pdf", "Pagos Verificados")}
        >
          <div className="text-3xl mb-2"><FaCheckCircle /></div>
          <div className="text-2xl font-bold text-green-800">{pagosVerificados}</div>
          <div className="text-gray-700">Pagos Verificados</div>
          <div className="mt-1 text-xs text-blue-700 font-semibold">Descargar PDF</div>
        </button>
        <button
          className="rounded-xl p-5 shadow border flex flex-col items-center transition hover:scale-105 hover:shadow-lg bg-red-100 focus:outline-none"
          onClick={() => exportarPDFClasificados(p => p.estado === "Rechazado", "Reporte_Pagos_Rechazados.pdf", "Pagos Rechazados")}
        >
          <div className="text-3xl mb-2"><FaTimesCircle /></div>
          <div className="text-2xl font-bold text-red-700">{pagosRechazados}</div>
          <div className="text-gray-700">Pagos Rechazados</div>
          <div className="mt-1 text-xs text-blue-700 font-semibold">Descargar PDF</div>
        </button>
        <button
          className="rounded-xl p-5 shadow border flex flex-col items-center transition hover:scale-105 hover:shadow-lg bg-yellow-100 focus:outline-none"
          onClick={() => exportarPDFClasificados(p => !["Verificado", "Rechazado"].includes(p.estado), "Reporte_Pagos_Pendientes.pdf", "Pagos Pendientes")}
        >
          <div className="text-3xl mb-2"><FaMoneyCheckAlt /></div>
          <div className="text-2xl font-bold text-yellow-700">{pagosPendientes}</div>
          <div className="text-gray-700">Pagos Pendientes</div>
          <div className="mt-1 text-xs text-blue-700 font-semibold">Descargar PDF</div>
        </button>
      </div>

      {/* Tandas cards */}
      <div className="flex flex-wrap gap-6 mt-6">
        {tandasResumen.map((t, i) => (
          <div key={i} className="bg-white border shadow rounded-xl p-5 w-full md:w-80 flex flex-col gap-2 relative group hover:ring-2 ring-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-blue-700">{t.nombre}</span>
              <span className="text-xs text-gray-400">{t.tipo} (Ciclo {t.ciclo})</span>
            </div>
            <div className="text-sm text-gray-600">{t.integrantes} integrantes</div>
            <div className="font-bold text-xl text-green-700">${t.recaudado.toLocaleString()}</div>
            <div className="flex gap-3 items-center text-sm">
              <span className="text-green-700">{t.verificados} verificados</span>
              <span className="text-yellow-600">{t.pendientes} pendientes</span>
            </div>
            {/* Acciones rápidas */}
            <div className="flex gap-2 mt-2 flex-wrap">
              <button className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 flex items-center gap-1 text-sm"
                title="Ver detalles"
                onClick={() => verDetalleTanda(t)}
              ><FaEye /> Detalles</button>
              <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1 text-sm"
                title="Descargar PDF solo de esta tanda"
                onClick={() => exportarPDFTanda(t)}
              ><FaFilePdf /> PDF</button>
              <button className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 flex items-center gap-1 text-sm"
                title="Descargar solo pendientes"
                onClick={() => exportarPDFPendientesTanda(t)}
              ><FaFilePdf /> Pendientes</button>
              <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 flex items-center gap-1 text-sm"
                title="Ver gráfica de pagos"
                onClick={() => abrirGraficaTanda(t)}
              ><FaChartPie /> Gráfica</button>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="border rounded px-3 py-2"
            value={filtroTanda}
            onChange={(e) => setFiltroTanda(e.target.value)}
            title="Filtrar por tanda"
          >
            <option value="Todas las tandas">Todas las tandas</option>
            {tandasResumen.map((t) => (
              <option key={t.nombre} value={t.nombre}>{t.nombre}</option>
            ))}
          </select>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            title="Desde"
          />
          <span className="mx-1 text-gray-400">a</span>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            title="Hasta"
          />
          <button className="bg-gray-200 hover:bg-blue-100 px-3 py-2 rounded flex items-center gap-2 text-sm"
            title="Buscar pagos filtrados"
          ><FaSearch /> Buscar</button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded shadow text-sm"
            onClick={() => exportarPDF(pagosFiltrados, "Reporte_Pagos_Filtrado.pdf", "Pagos Filtrados")}
            title="Exportar pagos filtrados"
          >Exportar filtrado</button>
        </div>
        <button className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 px-3 py-2 rounded flex items-center gap-2 text-sm"
          title="Opciones avanzadas de filtrado"
        ><FaFilter /> Filtros avanzados</button>
      </div>

      {/* Tabla de pagos recientes */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="font-semibold text-blue-700 mb-2">Pagos recientes</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-blue-50 text-blue-700">
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Tanda</th>
                <th className="px-4 py-2">Monto</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((p, i) => (
                <tr key={i} className="text-center border-b hover:bg-blue-50">
                  <td className="px-4 py-2">{p.nombre}</td>
                  <td className="px-4 py-2">{p.tanda}</td>
                  <td className="px-4 py-2">{p.monto}</td>
                  <td className={
                    p.estado === "Verificado"
                      ? "text-green-700 font-semibold"
                      : p.estado === "Rechazado"
                        ? "text-red-600 font-semibold"
                        : "text-yellow-700 font-semibold"
                  }>
                    {p.estado}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{p.fecha}</td>
                  <td className="px-4 py-2">
                    <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs mr-1"
                      title="Ver detalles del pago"
                      onClick={() => verDetallePago(p)}
                    >Detalles</button>
                  </td>
                </tr>
              ))}
              {pagosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-gray-400 py-8">No hay pagos para los filtros seleccionados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles de tanda con selector de semana y búsqueda */}
      {tandaDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative">
            <button className="absolute top-2 right-4 text-lg text-gray-400 hover:text-blue-700"
              onClick={cerrarDetalle}>×</button>
            <div className="font-bold text-xl text-blue-800 mb-2">
              Detalles de Tanda: {tandaDetalle.nombre}
            </div>
            <div className="mb-4 text-gray-600">
              Tipo: <span className="font-semibold">{tandaDetalle.tipo}</span> | Ciclos: <span className="font-semibold">{tandaDetalle.participantes.length}</span> | Integrantes: <span className="font-semibold">{tandaDetalle.participantes.length}</span>
            </div>
            {/* Selector de semana/ciclo */}
            <div className="mb-3 flex gap-2 flex-wrap">
              {[...Array(tandaDetalle.participantes.length)].map((_, idx) => {
                // Buscar las fechas de pago de todos, ordenadas
                const cicloFechas = tandaDetalle.fechasPago
                  .filter(fp => fp.fechaPago)
                  .sort((a, b) => new Date(a.fechaPago) - new Date(b.fechaPago));
                const fechaPago = cicloFechas[idx]?.fechaPago;
                return (
                  <button
                    key={idx}
                    className={`px-4 py-1 rounded-xl border text-sm font-bold
                      ${idx === semanaIdx
                        ? "bg-blue-700 text-white border-blue-700 shadow"
                        : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"}
                    `}
                    onClick={() => setSemanaIdx(idx)}
                  >
                    {getWeekLabel(tandaDetalle.tipo, idx)}{" "}
                    {fechaPago && <span className="text-xs ml-1">{fechaPago.slice(0, 10)}</span>}
                  </button>
                );
              })}
            </div>
            {/* Búsqueda de integrantes */}
            <div className="mb-3 flex items-center gap-2">
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Buscar integrante..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              <FaSearch className="text-gray-400" />
            </div>
            {/* Tabla solo de la semana/ciclo seleccionado */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div className="text-sm text-gray-800 mb-2 font-bold">
                {getWeekLabel(tandaDetalle.tipo, semanaIdx)} - Integrantes y pagos:
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Nombre</th>
                    <th className="px-2 py-1 text-center">Estado</th>
                    <th className="px-2 py-1 text-center">Monto</th>
                    <th className="px-2 py-1 text-center">Fecha</th>
                    <th className="px-2 py-1 text-center">Comprobante</th>
                  </tr>
                </thead>
                <tbody>
                  {tandaDetalle.participantes
                    .filter(int =>
                      !busqueda ||
                      (`${int.userId.nombre} ${int.userId.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()))
                    )
                    .map((int, i) => {
                      // Buscar el objeto de fecha de pago para este ciclo y este participante
                      const cicloFechas = tandaDetalle.fechasPago
                        .filter(fp => fp.fechaPago)
                        .sort((a, b) => new Date(a.fechaPago) - new Date(b.fechaPago));
                      const pagoCiclo = cicloFechas[semanaIdx];
                      // Si el pagoCiclo es del usuario
                      let pagoUsuario = null;
                      if (pagoCiclo && pagoCiclo.userId === int.userId._id) {
                        // Buscar pago en la lista global de pagos por fecha y tanda y user
                        pagoUsuario = pagos.find(
                          p =>
                            p.userId?._id === int.userId._id &&
                            p.fecha === (pagoCiclo?.fechaPago ? pagoCiclo.fechaPago.slice(0, 10) : undefined) &&
                            p.tandaId === tandaDetalle._id
                        );
                      }
                      return (
                        <tr key={int.userId._id}>
                          <td className="px-2 py-1 font-semibold">{int.userId.nombre} {int.userId.apellidos}</td>
                          <td className="px-2 py-1 text-center">
                            {pagoUsuario
                              ? (
                                <span className={
                                  pagoUsuario.estado === "Verificado"
                                    ? "text-green-700 font-bold"
                                    : pagoUsuario.estado === "Rechazado"
                                      ? "text-red-700 font-bold"
                                      : "text-yellow-700 font-bold"
                                }>
                                  {pagoUsuario.estado}
                                </span>
                              )
                              : <span className="text-yellow-600">Pendiente</span>
                            }
                          </td>
                          <td className="px-2 py-1 text-center">{pagoUsuario?.monto || "-"}</td>
                          <td className="px-2 py-1 text-center">{pagoCiclo?.fechaPago ? pagoCiclo.fechaPago.slice(0, 10) : "-"}</td>
                          <td className="px-2 py-1 text-center">
                            {pagoUsuario?.comprobanteUrl &&
                              <a href={pagoUsuario.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Comprobante</a>
                            }
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {/* Botón para exportar PDF de la semana/ciclo seleccionada */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => exportarPDFSemanaTanda(
                    tandaDetalle,
                    semanaIdx,
                    tandaDetalle.participantes.map(int => {
                      // Buscar cicloFechas y pago por ciclo
                      const cicloFechas = tandaDetalle.fechasPago
                        .filter(fp => fp.fechaPago)
                        .sort((a, b) => new Date(a.fechaPago) - new Date(b.fechaPago));
                      const pagoCiclo = cicloFechas[semanaIdx];
                      let pagoUsuario = null;
                      if (pagoCiclo && pagoCiclo.userId === int.userId._id) {
                        pagoUsuario = pagos.find(
                          p =>
                            p.userId?._id === int.userId._id &&
                            p.fecha === (pagoCiclo?.fechaPago ? pagoCiclo.fechaPago.slice(0, 10) : undefined) &&
                            p.tandaId === tandaDetalle._id
                        );
                      }
                      return {
                        nombre: `${int.userId.nombre} ${int.userId.apellidos}`,
                        estado: pagoUsuario ? pagoUsuario.estado : "Pendiente",
                        monto: pagoUsuario?.monto || "-",
                        fecha: pagoCiclo?.fechaPago ? pagoCiclo.fechaPago.slice(0, 10) : "-",
                        comprobanteUrl: pagoUsuario?.comprobanteUrl || ""
                      };
                    })
                  )}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
                >
                  <FaFilePdf /> Descargar PDF de {getWeekLabel(tandaDetalle.tipo, semanaIdx)} de {tandaDetalle.nombre}
                </button>
              </div>
            </div>
            {/* Botones globales */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => exportarPDFTanda(tandaDetalle)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
              ><FaFilePdf /> Exportar PDF de toda la tanda {tandaDetalle.nombre}</button>
              <button
                onClick={() => exportarPDFPendientesTanda(tandaDetalle)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
              ><FaFilePdf /> Pendientes de {tandaDetalle.nombre}</button>
            </div>
          </div>
        </div>
      )}


      {/* Modal de detalles individuales de pago */}
      {pagoDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-4 text-lg text-gray-400 hover:text-blue-700"
              onClick={cerrarPagoDetalle}>×</button>
            <div className="font-bold text-xl text-blue-800 mb-4">
              Detalle de Pago
            </div>
            <div className="mb-2"><span className="font-bold">Integrante:</span> {pagoDetalle.nombre}</div>
            <div className="mb-2"><span className="font-bold">Tanda:</span> {pagoDetalle.tanda}</div>
            <div className="mb-2"><span className="font-bold">Monto:</span> {pagoDetalle.monto}</div>
            <div className="mb-2"><span className="font-bold">Estado:</span> <span className={
              pagoDetalle.estado === "Verificado"
                ? "text-green-700 font-semibold"
                : pagoDetalle.estado === "Rechazado"
                  ? "text-red-600 font-semibold"
                  : "text-yellow-700 font-semibold"
            }>{pagoDetalle.estado}</span></div>
            <div className="mb-2"><span className="font-bold">Fecha:</span> {pagoDetalle.fecha}</div>
            {pagoDetalle.comprobanteUrl && (
              <div className="mt-2">
                <a href={pagoDetalle.comprobanteUrl} target="_blank" rel="noopener noreferrer"
                  className="underline text-blue-700">Ver comprobante</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de gráfica de pagos por tanda */}
      {showGrafica && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
            <button className="absolute top-2 right-4 text-lg text-gray-400 hover:text-blue-700"
              onClick={cerrarGrafica}>×</button>
            <div className="font-bold text-xl text-blue-800 mb-4">
              Gráfica de Pagos - {showGrafica.nombre}
            </div>
            <Bar data={getDataGraficaTanda(showGrafica)} />
          </div>
        </div>
      )}
    </div>
  );
}
