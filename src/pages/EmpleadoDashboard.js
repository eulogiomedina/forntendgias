import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import {
  FaUsers, FaUserLock, FaMoneyCheckAlt, FaExclamationTriangle,
  FaRegClock, FaDownload, FaEye, FaTrophy
} from 'react-icons/fa';

import { useNavigate } from "react-router-dom";

// Importa pdfmake
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const cardStyle = "flex-1 rounded-2xl shadow px-6 py-7 flex flex-col items-center justify-center border-2";
const iconStyle = "text-3xl mb-2";
const valueStyle = "font-bold text-3xl mb-1";
const labelStyle = "text-gray-500";

export default function EmpleadoDashboard() {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [selectedPago, setSelectedPago] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [bloqueadas, setBloqueadas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [pagoSearch, setPagoSearch] = useState('');

  useEffect(() => {
    const fetchResumenOperativo = async () => {
      try {
        const [usuariosRes, bloqueadasRes, pagosRes] = await Promise.all([
          axios.get(`${API_URL}/api/acc`),
          axios.get(`${API_URL}/api/pagos`),
        ]);
        setResumen({
          totalUsuarios: usuariosRes.data.length,
          totalBloqueadas: bloqueadasRes.data.length,
          totalPagos: pagosRes.data.length,
        });
        setUsuarios(usuariosRes.data);
        setBloqueadas(bloqueadasRes.data);
        setPagos(pagosRes.data);

        const pagosAtrasados = pagosRes.data.filter((pago) => pago.atraso === true);
        setAlertas(pagosAtrasados.slice(0, 5));

        // Actividad Reciente (última semana)
        const ultimosUsuarios = usuariosRes.data.slice(-5).reverse();
        const ultimosPagos = pagosRes.data.slice(-5).reverse();
        const ultimasBloqueadas = bloqueadasRes.data.slice(-5).reverse();
        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);

        const actividad = [
          ...ultimosUsuarios.map((u) => ({
            tipo: 'Nuevo Usuario',
            icono: <FaUsers className="text-blue-400" />,
            color: "text-blue-600",
            detalle: `Nombre: ${u.nombre} ${u.apellidos} — Correo: ${u.correo}`,
            fecha: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Fecha no disponible',
          })),
          ...ultimosPagos.filter((p) => new Date(p.fecha) >= unaSemanaAtras).map((p) => ({
            tipo: 'Nuevo Pago',
            icono: <FaMoneyCheckAlt className="text-green-400" />,
            color: "text-green-600",
            detalle: `Usuario: ${p.userId?.nombre} — Correo: ${p.userId?.correo} — Monto: ${p.monto} — Estado: ${p.estado}`,
            fecha: new Date(p.fecha).toLocaleDateString(),
          })),
          ...ultimasBloqueadas.filter((b) => new Date(b.fechaBloqueo) >= unaSemanaAtras).map((b) => ({
            tipo: 'Cuenta Bloqueada',
            icono: <FaUserLock className="text-red-400" />,
            color: "text-red-600",
            detalle: `Correo: ${b.correo}`,
            fecha: new Date(b.fechaBloqueo).toLocaleDateString(),
          })),
        ];
        actividad.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setActividadReciente(actividad);

      } catch (error) {
        console.error('Error al obtener datos para Panel Principal:', error);
      }
    };
    fetchResumenOperativo();
  }, []);

  // ====== EXPORTACIÓN PDF ======

  // USUARIOS PDF
  function exportarUsuariosPDF() {
    const users = usuarios.filter(u => !u.hide);
    const fecha = new Date().toLocaleString();
    const body = [
      [
        { text: 'Nombre', style: 'tableHeader' },
        { text: 'Correo', style: 'tableHeader' }
      ],
      ...users.map(u => [
        { text: `${u.nombre} ${u.apellidos}`, style: 'tableCell' },
        { text: u.correo, style: 'tableCell' }
      ])
    ];

    const docDefinition = {
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: 'Grupo GIAS', style: 'title' },
        { text: 'Reporte de Usuarios', style: 'header', margin: [0, 0, 0, 10] },
        {
          table: { headerRows: 1, widths: ['*', '*'], body: body },
          layout: {
            fillColor: function (rowIndex) {
              return rowIndex === 0 ? '#2B6CB0' : rowIndex % 2 === 0 ? '#F7FAFC' : '#FFFFFF';
            },
            hLineWidth: function () { return 0.5; },
            vLineWidth: function () { return 0.5; },
            hLineColor: function () { return '#D1D5DB'; },
            vLineColor: function () { return '#D1D5DB'; }
          }
        },
        {
          columns: [
            { width: '*', text: '' },
            { width: 'auto', text: `Exportado por GIAS | ${fecha}`, style: 'footer', alignment: 'right', margin: [0, 20, 0, 0] }
          ]
        }
      ],
      styles: {
        title: { fontSize: 20, bold: true, color: '#1341A7', alignment: 'center', margin: [0, 0, 0, 8] },
        header: { fontSize: 15, bold: true, color: '#2B6CB0', alignment: 'center', margin: [0, 0, 0, 15] },
        tableHeader: { fillColor: '#2B6CB0', color: 'white', bold: true, fontSize: 12, alignment: 'center' },
        tableCell: { fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
        footer: { fontSize: 10, italics: true, color: '#777' }
      }
    };
    pdfMake.createPdf(docDefinition).download("usuarios.pdf");
  }

  // PAGOS PDF
  function exportarPagosPDF() {
    const pagosExport = pagos.filter(p => !p.hide);
    const fecha = new Date().toLocaleString();
    const body = [
      [
        { text: 'Usuario', style: 'tableHeader' },
        { text: 'Correo', style: 'tableHeader' },
        { text: 'Monto', style: 'tableHeader' },
        { text: 'Estado', style: 'tableHeader' },
        { text: 'Fecha', style: 'tableHeader' }
      ],
      ...pagosExport.map(p => [
        { text: p.userId?.nombre ?? "", style: 'tableCell' },
        { text: p.userId?.correo ?? "", style: 'tableCell' },
        { text: p.monto, style: 'tableCell' },
        { text: p.estado, style: 'tableCell' },
        { text: p.fecha ? new Date(p.fecha).toLocaleDateString() : "", style: 'tableCell' }
      ])
    ];

    const docDefinition = {
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: 'Grupo GIAS', style: 'title' },
        { text: 'Reporte de Pagos', style: 'header', margin: [0, 0, 0, 10] },
        {
          table: { headerRows: 1, widths: ['*', '*', '*', '*', '*'], body: body },
          layout: {
            fillColor: function (rowIndex) {
              return rowIndex === 0 ? '#319795' : rowIndex % 2 === 0 ? '#F7FAFC' : '#FFFFFF';
            },
            hLineWidth: function () { return 0.5; },
            vLineWidth: function () { return 0.5; },
            hLineColor: function () { return '#D1D5DB'; },
            vLineColor: function () { return '#D1D5DB'; }
          }
        },
        {
          columns: [
            { width: '*', text: '' },
            { width: 'auto', text: `Exportado por GIAS | ${fecha}`, style: 'footer', alignment: 'right', margin: [0, 20, 0, 0] }
          ]
        }
      ],
      styles: {
        title: { fontSize: 20, bold: true, color: '#1341A7', alignment: 'center', margin: [0, 0, 0, 8] },
        header: { fontSize: 15, bold: true, color: '#319795', alignment: 'center', margin: [0, 0, 0, 15] },
        tableHeader: { fillColor: '#319795', color: 'white', bold: true, fontSize: 12, alignment: 'center' },
        tableCell: { fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
        footer: { fontSize: 10, italics: true, color: '#777' }
      }
    };
    pdfMake.createPdf(docDefinition).download("pagos.pdf");
  }

  // BLOQUEADAS PDF
  function exportarBloqueadasPDF() {
    const fecha = new Date().toLocaleString();
    const body = [
      [
        { text: 'Correo', style: 'tableHeader' },
        { text: 'Fecha Bloqueo', style: 'tableHeader' }
      ],
      ...bloqueadas.map(b => [
        { text: b.correo, style: 'tableCell' },
        { text: b.fechaBloqueo ? new Date(b.fechaBloqueo).toLocaleDateString() : "", style: 'tableCell' }
      ])
    ];

    const docDefinition = {
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: 'Grupo GIAS', style: 'title' },
        { text: 'Cuentas Bloqueadas', style: 'header', margin: [0, 0, 0, 10] },
        {
          table: { headerRows: 1, widths: ['*', '*'], body: body },
          layout: {
            fillColor: function (rowIndex) {
              return rowIndex === 0 ? '#C53030' : rowIndex % 2 === 0 ? '#F7FAFC' : '#FFFFFF';
            },
            hLineWidth: function () { return 0.5; },
            vLineWidth: function () { return 0.5; },
            hLineColor: function () { return '#D1D5DB'; },
            vLineColor: function () { return '#D1D5DB'; }
          }
        },
        {
          columns: [
            { width: '*', text: '' },
            { width: 'auto', text: `Exportado por GIAS | ${fecha}`, style: 'footer', alignment: 'right', margin: [0, 20, 0, 0] }
          ]
        }
      ],
      styles: {
        title: { fontSize: 20, bold: true, color: '#1341A7', alignment: 'center', margin: [0, 0, 0, 8] },
        header: { fontSize: 15, bold: true, color: '#C53030', alignment: 'center', margin: [0, 0, 0, 15] },
        tableHeader: { fillColor: '#C53030', color: 'white', bold: true, fontSize: 12, alignment: 'center' },
        tableCell: { fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
        footer: { fontSize: 10, italics: true, color: '#777' }
      }
    };
    pdfMake.createPdf(docDefinition).download("bloqueadas.pdf");
  }

  const exportarUsuarios = exportarUsuariosPDF;
  const exportarPagos = exportarPagosPDF;
  const exportarBloqueadas = exportarBloqueadasPDF;

  const exportarTodo = () => {
    exportarUsuarios();
    exportarPagos();
    exportarBloqueadas();
  };

  // ------------ FILTRO DE BUSQUEDA ------------
  useEffect(() => {
    setUsuarios(prev => prev.map(u => ({
      ...u,
      hide: usuarioSearch
        ? !(`${u.nombre} ${u.apellidos} ${u.correo}`.toLowerCase().includes(usuarioSearch.toLowerCase()))
        : false
    })));
  }, [usuarioSearch]);

  useEffect(() => {
    setPagos(prev => prev.map(p => ({
      ...p,
      hide: pagoSearch
        ? !(`${p.userId?.correo ?? ""} ${p.monto ?? ""}`.toLowerCase().includes(pagoSearch.toLowerCase()))
        : false
    })));
  }, [pagoSearch]);
  // ------------ FIN FILTRO ------------

  return (
    <div className="bg-gray-100 min-h-screen transition">
      <div className="max-w-6xl mx-auto py-8 px-2 md:px-8">
        {/* Exportar todo */}
        <div className="flex justify-end gap-3 mb-3">
          <button onClick={exportarTodo}
            className="flex gap-2 items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">
            <FaDownload /> Exportar Todo (PDF)
          </button>
          <button
            onClick={() => navigate("/gamificacion")}
            className="flex gap-2 items-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow transition"
          >
            <FaTrophy /> Ver Gamificación
          </button>

        </div>
        <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
          Panel Principal - Empleado
        </h1>
        {/* Cards resumen operativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-7">
          <div className={cardStyle + " border-blue-200 bg-blue-50"}>
            <FaUsers className={iconStyle + " text-blue-400"} />
            <span className={valueStyle + " text-blue-800"}>{resumen.totalUsuarios ?? "--"}</span>
            <span className={labelStyle}>Usuarios activos</span>
            <div className="flex gap-2 mt-3">
              <button
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded shadow hover:bg-blue-200 flex gap-1 items-center"
                onClick={exportarUsuarios}
              ><FaDownload /> Exportar</button>
              <button
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded shadow hover:bg-blue-200 flex gap-1 items-center"
                onClick={() => setModalType('usuarios')}
              ><FaEye /> Ver</button>
            </div>
          </div>
          <div className={cardStyle + " border-green-200 bg-green-50"}>
            <FaMoneyCheckAlt className={iconStyle + " text-green-400"} />
            <span className={valueStyle + " text-green-700"}>{resumen.totalPagos ?? "--"}</span>
            <span className={labelStyle}>Pagos registrados</span>
            <div className="flex gap-2 mt-3">
              <button
                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded shadow hover:bg-green-200 flex gap-1 items-center"
                onClick={exportarPagos}
              ><FaDownload /> Exportar</button>
              <button
                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded shadow hover:bg-green-200 flex gap-1 items-center"
                onClick={() => setModalType('pagos')}
              ><FaEye /> Ver</button>
            </div>
          </div>
          <div className={cardStyle + " border-red-200 bg-red-50"}>
            <FaUserLock className={iconStyle + " text-red-400"} />
            <span className={valueStyle + " text-red-600"}>{resumen.totalBloqueadas ?? "--"}</span>
            <span className={labelStyle}>Cuentas bloqueadas</span>
            <div className="flex gap-2 mt-3">
              <button
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded shadow hover:bg-red-200 flex gap-1 items-center"
                onClick={exportarBloqueadas}
              ><FaDownload /> Exportar</button>
              <button
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded shadow hover:bg-red-200 flex gap-1 items-center"
                onClick={() => setModalType('bloqueadas')}
              ><FaEye /> Ver</button>
            </div>
          </div>
        </div>

        {/* Alertas de Retrasos Globales */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-red-600 flex items-center gap-2">
            <FaExclamationTriangle className="inline" /> Alertas de Retrasos Globales
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {alertas.length === 0 ? (
              <div className="bg-green-100 text-green-700 rounded-xl shadow p-4 flex items-center gap-2">
                <span className="font-bold">No hay pagos atrasados actualmente.</span>
              </div>
            ) : (
              alertas.map((pago) => (
                <div
                  key={pago._id}
                  onClick={() => setSelectedPago(pago)}
                  className="cursor-pointer bg-red-100 hover:bg-red-200 transition border-l-4 border-red-500 px-3 py-3 rounded-xl flex items-center gap-2 shadow"
                >
                  <FaExclamationTriangle className="text-red-500 text-xl" />
                  <div>
                    <b>{pago.userId?.nombre ?? "--"}</b> — {pago.userId?.correo ?? "--"}
                    <span className="mx-2 font-bold text-red-600">|</span>
                    Monto: <span className="font-bold">{pago.monto}</span>
                    <span className="mx-2">|</span>
                    Fecha: <span className="font-bold">{new Date(pago.fecha).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Buscador para usuarios y pagos */}
        <div className="flex flex-wrap gap-2 mb-7">
          <input
            type="text"
            placeholder="Buscar usuario (nombre/correo)"
            className="border rounded px-3 py-2 w-64"
            value={usuarioSearch}
            onChange={e => setUsuarioSearch(e.target.value)}
          />
          <input
            type="text"
            placeholder="Buscar pago (correo/monto)"
            className="border rounded px-3 py-2 w-64"
            value={pagoSearch}
            onChange={e => setPagoSearch(e.target.value)}
          />
        </div>

        {/* Actividad Reciente tipo timeline */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-blue-700 flex items-center gap-2">
            <FaRegClock className="inline" /> Actividad Reciente
          </h2>
          <div className="bg-white p-4 rounded-2xl shadow">
            {actividadReciente.length === 0 ? (
              <p className="text-gray-600">No hay actividad reciente.</p>
            ) : (
              <ul className="timeline space-y-3">
                {actividadReciente.map((item, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <div className="pt-2">{item.icono}</div>
                    <div>
                      <span className={"font-bold text-md " + item.color}>{item.tipo}</span>
                      <div className="text-gray-800">{item.detalle}</div>
                      <div className="text-xs text-gray-400">Fecha: {item.fecha}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Modal Detalle de Pago Atrasado */}
        {selectedPago && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full relative">
              <h3 className="text-2xl font-bold mb-4 text-red-600 text-center">Detalle del Pago Atrasado</h3>
              <p><strong>Usuario:</strong> {selectedPago.userId?.nombre} — {selectedPago.userId?.correo}</p>
              <p><strong>Monto:</strong> {selectedPago.monto}</p>
              <p><strong>Fecha:</strong> {new Date(selectedPago.fecha).toLocaleDateString()}</p>
              <p><strong>Estado:</strong> {selectedPago.estado}</p>
              <button
                onClick={() => setSelectedPago(null)}
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal General para listas */}
        {modalType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full relative">
              <h3 className="text-2xl font-bold mb-4 text-blue-600 text-center">
                {modalType === 'usuarios' && 'Lista de Usuarios'}
                {modalType === 'bloqueadas' && 'Lista de Cuentas Bloqueadas'}
                {modalType === 'pagos' && 'Lista de Pagos'}
              </h3>
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {modalType === 'usuarios' && usuarios.filter(u => !u.hide).map((user) => (
                  <li key={user._id} className="bg-gray-50 p-3 rounded-lg shadow border">
                    <p className="font-bold text-gray-800 mb-1">
                      Nombre: <span className="font-normal">{user.nombre} {user.apellidos}</span>
                    </p>
                    <p className="font-bold text-gray-600">
                      Correo: <span className="font-normal">{user.correo}</span>
                    </p>
                  </li>
                ))}
                {modalType === 'bloqueadas' && bloqueadas.map((cuenta) => (
                  <li key={cuenta._id} className="bg-gray-50 p-3 rounded-lg shadow border">
                    <p className="font-bold text-gray-800 mb-1">Correo: <span className="font-normal">{cuenta.correo}</span></p>
                    <p className="font-bold text-gray-600">
                      Fecha Bloqueo: <span className="font-normal">{new Date(cuenta.fechaBloqueo).toLocaleDateString()}</span>
                    </p>
                  </li>
                ))}
                {modalType === 'pagos' && pagos.filter(p => !p.hide).map((pago) => (
                  <li key={pago._id} className="bg-gray-50 p-3 rounded-lg shadow border">
                    <p className="font-bold text-gray-800 mb-1">
                      Usuario: <span className="font-normal">{pago.userId?.nombre} — {pago.userId?.correo}</span>
                    </p>
                    <p className="font-bold text-gray-600">
                      Monto: <span className="font-normal">{pago.monto}</span>
                      <span className="ml-2">Estado: <span className="font-normal">{pago.estado}</span></span>
                    </p>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setModalType(null)}
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
