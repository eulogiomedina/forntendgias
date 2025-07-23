import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import API_URL from "../apiConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function DashboardPagos() {
  const [tandasActivas, setTandasActivas] = useState([{ nombre: "Todas las Tandas", id: "todas" }]);
  const [tandasDatos, setTandasDatos] = useState([]); // <-- Datos completos de todas las tandas
  const [tandaSeleccionada, setTandaSeleccionada] = useState("todas");
  const [actividadPorTanda, setActividadPorTanda] = useState([]);
  const [resumen, setResumen] = useState([
    { label: "Pagos Pendientes", count: 0, color: "bg-blue-100", textColor: "text-blue-700" },
    { label: "Pagos Verificados", count: 0, color: "bg-green-100", textColor: "text-green-700" },
    { label: "Pagos en Revisión", count: 0, color: "bg-yellow-100", textColor: "text-yellow-800" }
  ]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, eventos: [], titulo: "" });
  const searchInputRef = useRef();

  // --- Cargar tandas (con participantes) sólo una vez
  useEffect(() => {
    axios.get(`${API_URL}/api/tandas`).then(res => {
      const tandas = res.data.map((t) => ({
        nombre: `${t.tipo || "Tanda"}${t.monto ? ` - $${t.monto}` : ""}`,
        id: t._id
      }));
      setTandasActivas([{ nombre: "Todas las Tandas", id: "todas" }, ...tandas]);
      setTandasDatos(res.data); // <-- guarda datos completos de cada tanda con participantes
    });
  }, []);

  // --- Cargar actividad y resumen cada vez que cambia tanda seleccionada
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/pagos/actividad-reciente`)
      .then(r => setActividadPorTanda(r.data))
      .catch(() => setActividadPorTanda([]));

    axios.get(`${API_URL}/api/pagos/resumen`, { params: { tandaId: tandaSeleccionada } })
      .then(r => setResumen([
        { label: "Pagos Pendientes", count: r.data.pendientes || 0, color: "bg-blue-100", textColor: "text-blue-700" },
        { label: "Pagos Verificados", count: r.data.verificados || 0, color: "bg-green-100", textColor: "text-green-700" },
        { label: "Pagos en Revisión", count: r.data.revision || 0, color: "bg-yellow-100", textColor: "text-yellow-800" }
      ]))
      .catch(() => setResumen([
        { label: "Pagos Pendientes", count: 0, color: "bg-blue-100", textColor: "text-blue-700" },
        { label: "Pagos Verificados", count: 0, color: "bg-green-100", textColor: "text-green-700" },
        { label: "Pagos en Revisión", count: 0, color: "bg-yellow-100", textColor: "text-yellow-800" }
      ]))
      .finally(() => setLoading(false));
  }, [tandaSeleccionada]);

  // --- Filtro por tanda y búsqueda
  let actividadFiltrada = tandaSeleccionada === "todas"
    ? actividadPorTanda
    : actividadPorTanda.filter((t) => t.id === tandaSeleccionada);

  if (search.trim()) {
    actividadFiltrada = actividadFiltrada.map(tanda => ({
      ...tanda,
      eventos: tanda.eventos.filter(ev =>
        (ev.usuario && ev.usuario.toLowerCase().includes(search.toLowerCase())) ||
        (ev.estado && ev.estado.toLowerCase().includes(search.toLowerCase()))
      )
    })).filter(tanda => tanda.eventos.length > 0);
  }

  // --- Exportar Excel
  const exportarExcel = () => {
    const rows = [];
    actividadFiltrada.forEach((t) => {
      t.eventos.forEach((ev) => {
        rows.push({
          Tanda: t.nombre,
          Usuario: ev.usuario,
          Estado: ev.estado,
          Fecha: ev.fecha
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ActividadPagos");
    XLSX.writeFile(wb, "ActividadPagos.xlsx");
  };

  // --- Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Pagos", 14, 14);
    actividadFiltrada.forEach((t, idx) => {
      autoTable(doc, {
        startY: idx === 0 ? 22 : doc.lastAutoTable.finalY + 10,
        head: [[t.nombre, "", "", ""]],
        body: t.eventos.map(ev => [ev.usuario, ev.estado, ev.fecha]),
        columns: [
          { header: "Usuario", dataKey: "usuario" },
          { header: "Estado", dataKey: "estado" },
          { header: "Fecha", dataKey: "fecha" }
        ],
        styles: { fontSize: 10 }
      });
    });
    doc.save("ActividadPagos.pdf");
  };

  // --- Modal Detalle (ahora agrega los que nunca han pagado en "pendiente")
  const handleCardClick = (estado, label) => {
    setSearch("");
    setTandaSeleccionada("todas");
    let eventos = [];
    if (estado === "pendiente") {
      // 1. Usuarios nunca han pagado (pendientes puros)
      tandasDatos.forEach(tanda => {
        if (!tanda.participantes) return;
        tanda.participantes.forEach(part => {
          // Busca en actividadPorTanda de la tanda correspondiente
          const pagosDeTanda = actividadPorTanda.find(t => t.id === tanda._id);
          // Si no existe pago del usuario en esta tanda, lo agregamos como pendiente
          const haPagado = pagosDeTanda && pagosDeTanda.eventos.some(ev =>
            ev.usuario &&
            (
              ev.usuario.toLowerCase().includes(part.userId.nombre.toLowerCase()) ||
              (part.userId.apellidos && ev.usuario.toLowerCase().includes(part.userId.apellidos.toLowerCase()))
            )
          );
          if (!haPagado) {
            eventos.push({
              usuario: `${part.userId.nombre} ${part.userId.apellidos || ""}`.trim(),
              estado: "pendiente",
              fecha: "—",
              tanda: `${tanda.tipo || "Tanda"}${tanda.monto ? ` - $${tanda.monto}` : ""}`
            });
          }
        });
      });
      // 2. También incluye los pagos registrados en estado "pendiente"
      actividadPorTanda.forEach(tanda => {
        tanda.eventos.forEach(ev => {
          if (ev.estado === "pendiente") {
            eventos.push({ ...ev, tanda: tanda.nombre });
          }
        });
      });
    } else {
      // verificados o revision, igual que antes
      actividadPorTanda.forEach(tanda => {
        tanda.eventos.forEach(ev => {
          if (ev.estado === estado) {
            eventos.push({ ...ev, tanda: tanda.nombre });
          }
        });
      });
    }
    abrirModal(`Detalle de ${label}`, eventos);
  };

  // --- Modal abrir/cerrar
  const abrirModal = (titulo, eventos) => {
    setModal({ open: true, eventos, titulo });
    setTimeout(() => searchInputRef.current?.focus(), 200);
  };

  // --- Cerrar modal con ESC o clic fuera
  useEffect(() => {
    if (!modal.open) return;
    const onKeyDown = (e) => e.key === "Escape" && setModal({ open: false, eventos: [], titulo: "" });
    const onClick = (e) => e.target.classList?.contains("modal-bg") && setModal({ open: false, eventos: [], titulo: "" });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
    };
  }, [modal.open]);

  return (
    <div className="space-y-8">
      {/* --- CARDS DE RESUMEN --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resumen.map(({ label, count, color, textColor }, idx) => (
          <div
            key={label}
            className={`cursor-pointer rounded-xl p-6 shadow hover:shadow-lg transition border border-gray-200 ${color} flex flex-col items-center`}
            onClick={() => handleCardClick(
              idx === 0 ? "pendiente" : idx === 1 ? "verificado" : "revision", label
            )}
            title={`Ver detalle de ${label.toLowerCase()}`}
          >
            <div className={`text-3xl font-bold mb-2 ${textColor}`}>{count}</div>
            <div className="text-gray-700 font-semibold">{label}</div>
          </div>
        ))}
      </div>

      {/* --- ACCIONES RÁPIDAS --- */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow" onClick={exportarExcel}>
          Exportar Excel
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow" onClick={exportarPDF}>
          Exportar PDF
        </button>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar usuario o estado..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ minWidth: 180 }}
        />
      </div>

      {/* --- FILTRO DE TANDA --- */}
      <div className="flex justify-end mb-4">
        <select
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={tandaSeleccionada}
          onChange={e => setTandaSeleccionada(e.target.value)}
        >
          {tandasActivas.map((t) => (
            <option value={t.id} key={t.id}>{t.nombre}</option>
          ))}
        </select>
      </div>

      {/* --- ACTIVIDAD RECIENTE --- */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="font-bold text-blue-700 mb-4 text-lg">Actividad reciente</div>
        {loading ? (
          <div className="text-gray-400 text-center py-8">Cargando...</div>
        ) : actividadFiltrada.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No hay actividad para la tanda seleccionada.</div>
        ) : (
          actividadFiltrada.map((tanda, idx) => (
            <div key={idx} className="mb-6">
              <div className={`font-semibold mb-1 ${tanda.color || "text-blue-700"}`}>{tanda.nombre}</div>
              <ol className="relative border-l border-blue-200 ml-4">
                {tanda.eventos.map((item, i) => (
                  <li key={i} className="mb-4 ml-4 flex items-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full border border-white mr-2 ${
                        item.estado === "verificado"
                          ? "bg-green-500"
                          : item.estado === "pendiente"
                          ? "bg-yellow-400"
                          : "bg-red-500"
                      }`}
                    ></span>
                    <span className="font-semibold">{item.usuario}</span>
                    <span
                      className={
                        item.estado === "verificado"
                          ? "text-green-600 font-semibold ml-2"
                          : item.estado === "pendiente"
                          ? "text-yellow-700 font-semibold ml-2"
                          : "text-red-600 font-semibold ml-2"
                      }
                    >
                      {item.estado === "verificado"
                        ? "Pago verificado"
                        : item.estado === "pendiente"
                        ? "Pendiente de revisión"
                        : "Rechazado"}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">{item.fecha}</span>
                  </li>
                ))}
              </ol>
              {/* Ver más si hay muchos */}
              {tanda.eventos.length > 3 && (
                <button
                  className="text-blue-500 text-xs mt-1"
                  onClick={() => abrirModal(`Pagos de ${tanda.nombre}`, tanda.eventos)}
                >
                  Ver más
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- MODAL DETALLE --- */}
      {modal.open && (
        <div className="modal-bg fixed inset-0 z-30 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full">
            <div className="font-bold text-lg mb-4">{modal.titulo}</div>
            <ol className="space-y-2 max-h-80 overflow-y-auto">
              {modal.eventos.length === 0 ? (
                <div className="text-gray-500">No hay información.</div>
              ) : modal.eventos.map((ev, idx) => (
                <li key={idx} className="flex flex-col md:flex-row items-start md:items-center">
                  <span className="font-semibold">{ev.usuario}</span>
                  <span className={
                    ev.estado === "verificado"
                      ? "text-green-600 font-semibold ml-2"
                      : ev.estado === "pendiente"
                      ? "text-yellow-700 font-semibold ml-2"
                      : "text-red-600 font-semibold ml-2"
                  }>
                    {ev.estado === "verificado"
                      ? "Pago verificado"
                      : ev.estado === "pendiente"
                      ? "Pendiente de revisión"
                      : "Rechazado"}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">{ev.fecha}</span>
                  {ev.tanda && <span className="ml-2 text-xs text-gray-500">({ev.tanda})</span>}
                </li>
              ))}
            </ol>
            <button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
              onClick={() => setModal({ open: false, eventos: [], titulo: "" })}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
