import { useState, useEffect } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaRegFilePdf, FaRegEye, FaEnvelope, FaWhatsapp, FaCheckCircle
} from "react-icons/fa";
import API_URL from '../apiConfig';

const GestionAhorrosEmpleado = () => {
  const [tandas, setTandas] = useState([]);
  const [filteredTandas, setFilteredTandas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tandasPerPage] = useState(6);
  const [filtros, setFiltros] = useState({
    estado: '',
    frecuencia: '',
    usuario: '',
  });
  const [selectedTanda, setSelectedTanda] = useState(null);
  const [pagos, setPagos] = useState([]);

  useEffect(() => { fetchTandas(); }, []);
  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/pagos`);
        const data = await res.json();
        setPagos(data);
      } catch (err) {
        console.error('Error al cargar pagos:', err);
      }
    };
    fetchPagos();
  }, []);

  const fetchTandas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tandas`);
      const data = await res.json();
      setTandas(data);
      setFilteredTandas(data);
    } catch (err) {
      console.error('Error al cargar tandas:', err);
    }
  };

  const aplicarFiltros = () => {
    let filtradas = [...tandas];
    if (filtros.estado) filtradas = filtradas.filter((t) => t.estado === filtros.estado);
    if (filtros.frecuencia) filtradas = filtradas.filter((t) => t.tipo === filtros.frecuencia);
    if (filtros.usuario) {
      filtradas = filtradas.filter((t) =>
        t.participantes.some((p) =>
          p.userId?.nombre?.toLowerCase().includes(filtros.usuario.toLowerCase())
        )
      );
    }
    setFilteredTandas(filtradas);
    setCurrentPage(1);
  };

  // Calcula estado de pago
  const calcularEstadoParticipante = (tanda, participante, index) => {
    const frecuencia = tanda.tipo;
    const fechaInicio = new Date(tanda.fechaInicio);
    const hoy = new Date();
    const pagosUsuario = pagos.filter(p =>
      p.tandaId === tanda._id && p.userId?._id === participante.userId?._id
    );
    let diasPorTurno = 7;
    if (frecuencia === 'Quincenal') diasPorTurno = 14;
    else if (frecuencia === 'Mensual') diasPorTurno = 30;
    const fechaTurno = new Date(fechaInicio);
    fechaTurno.setDate(fechaTurno.getDate() + index * diasPorTurno);

    const yaPagoTurno = pagosUsuario.some(p => {
      const fechaPago = new Date(p.fechaPago);
      return (
        fechaPago >= fechaTurno &&
        fechaPago <= new Date(fechaTurno.getTime() + diasPorTurno * 24 * 60 * 60 * 1000)
      );
    });
    if (yaPagoTurno) return 'Pagado';
    if (hoy > fechaTurno) return 'Atrasado';
    return 'Pendiente';
  };

  // Ciclo actual (posición del participante + 1)
  const cicloActualParticipante = (tanda, participante, index) => {
    // Ejemplo básico: posición en el arreglo + 1 (puedes mejorar esto si hay lógica real de pagos)
    return `${index + 1} / ${tanda.totalCiclos}`;
  };

  // Descargar PDF de tanda
  const descargarPDFTanda = (soloAtrasados = false) => {
    if (!selectedTanda) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Tanda", 14, 18);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 26);
    doc.text(`Monto: $${selectedTanda.monto}`, 14, 32);
    doc.text(`Frecuencia: ${selectedTanda.tipo}`, 14, 38);
    doc.text(`Total Ciclos: ${selectedTanda.totalCiclos}`, 14, 44);
    doc.text(`Estado: ${selectedTanda.estado}`, 14, 50);

    autoTable(doc, {
      startY: 58,
      head: [['Participante', 'Correo', 'Ciclo Actual', 'Último Pago', 'Estado']],
      body: selectedTanda.participantes
        .map((p, idx) => {
          const estado = calcularEstadoParticipante(selectedTanda, p, idx);
          if (soloAtrasados && estado !== "Atrasado") return null;
          return [
            p.userId?.nombre || 'Sin nombre',
            p.userId?.correo || 'Sin correo',
            cicloActualParticipante(selectedTanda, p, idx),
            p.ultimoPago ? new Date(p.ultimoPago).toLocaleDateString() : 'No disponible',
            estado
          ];
        })
        .filter(Boolean)
    });
    doc.save(
      soloAtrasados
        ? `Atrasados_Tanda_${selectedTanda._id.slice(-5)}.pdf`
        : `Reporte_Tanda_${selectedTanda._id.slice(-5)}.pdf`
    );
  };

  // Enviar recordatorio (Email/WhatsApp)
  const enviarRecordatorio = async (p) => {
    if (!selectedTanda) return;
    const proximoPago = new Date(); // Puedes calcular la fecha real aquí
    await fetch(`${API_URL}/api/notificaciones/recordatorio`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: p.userId._id,
        tandaId: selectedTanda._id,
        fechaProximoPago: proximoPago
      })
    });
    alert("Recordatorio enviado correctamente.");
  };

  // Notificar atraso
  const notificarAtraso = async (p) => {
    if (!selectedTanda) return;
    const ultimoPago = pagos.find(
      pago => pago.userId?._id === p.userId?._id && pago.tandaId === selectedTanda._id
    );
    await fetch(`${API_URL}/api/notificaciones/atraso`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: p.userId._id,
        tandaId: selectedTanda._id,
        pagoId: ultimoPago?._id
      })
    });
    alert("Notificación de atraso enviada.");
  };

  const indexOfLastTanda = currentPage * tandasPerPage;
  const indexOfFirstTanda = indexOfLastTanda - tandasPerPage;
  const currentTandas = filteredTandas.slice(indexOfFirstTanda, indexOfLastTanda);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-[1200px] mx-auto mt-[110px] mb-5 p-5 bg-white shadow-xl rounded-lg">
      <h2 className="text-3xl font-extrabold mb-6 text-blue-800">Gestión de Ahorros (Empleado)</h2>
      {/* Filtros */}
      <div className="mb-6 p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold mb-4 text-blue-700">Filtros Avanzados</h3>
        <div className="flex flex-wrap gap-4">
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className="border border-gray-300 p-2 rounded w-48 shadow-sm focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Estado (Todos)</option>
            <option value="Activa">Activa</option>
            <option value="Cerrada">Cerrada</option>
            <option value="En espera">En espera</option>
          </select>
          <select
            value={filtros.frecuencia}
            onChange={(e) => setFiltros({ ...filtros, frecuencia: e.target.value })}
            className="border border-gray-300 p-2 rounded w-48 shadow-sm focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Frecuencia (Todas)</option>
            <option value="Semanal">Semanal</option>
            <option value="Quincenal">Quincenal</option>
            <option value="Mensual">Mensual</option>
          </select>
          <input
            type="text"
            placeholder="Buscar participante"
            value={filtros.usuario}
            onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
            className="border border-gray-300 p-2 rounded flex-grow shadow-sm focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={aplicarFiltros}
            className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold shadow-md transition transform hover:scale-105"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Cards de Tandas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentTandas.map((tanda) => (
          <div
            key={tanda._id}
            className="border border-gray-200 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-[1.02] p-5 rounded-xl bg-white flex flex-col justify-between"
          >
            <div>
              <h4 className="text-xl font-extrabold text-blue-700 mb-2">Tanda #{tanda._id.slice(-5)}</h4>
              <p className="text-gray-700 mb-1"><strong>Monto:</strong> ${tanda.monto}</p>
              <p className="text-gray-700 mb-1"><strong>Frecuencia:</strong> {tanda.tipo}</p>
              <p className="text-gray-700 mb-1"><strong>Participantes:</strong> {tanda.participantes?.length} / {tanda.totalCiclos || 'N/A'}</p>
              <p className="text-gray-700 mb-1"><strong>Estado:</strong> {tanda.estado || 'N/A'}</p>
            </div>
            <button
              onClick={() => setSelectedTanda(tanda)}
              className="mt-4 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold transition transform hover:scale-105"
            >
              Ver Detalles
            </button>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: Math.ceil(filteredTandas.length / tandasPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={`px-3 py-1 rounded border ${
              currentPage === i + 1
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
            } shadow-sm`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal Detalles */}
      {selectedTanda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl w-full relative overflow-y-auto max-h-[90vh] animate-fade-in">
            <h3 className="text-2xl font-extrabold mb-4 text-blue-600">Detalles de la Tanda</h3>
            <p><strong>Monto:</strong> ${selectedTanda.monto}</p>
            <p><strong>Frecuencia:</strong> {selectedTanda.tipo}</p>
            <p><strong>Estado:</strong> {selectedTanda.estado || 'N/A'}</p>
            <p><strong>Total Ciclos:</strong> {selectedTanda.totalCiclos || 'N/A'}</p>
            <p><strong>Fecha de Inicio:</strong> {selectedTanda.fechaInicio ? new Date(selectedTanda.fechaInicio).toLocaleDateString() : 'No disponible'}</p>

            <div className="mt-6">
              <h4 className="text-xl font-bold text-blue-700 mb-3">Participantes y Estado de Pagos</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 text-sm">
                  <thead className="bg-gray-100 text-left text-gray-600">
                    <tr>
                      <th className="py-2 px-4 border">Participante</th>
                      <th className="py-2 px-4 border">Ciclo Actual</th>
                      <th className="py-2 px-4 border">Último Pago</th>
                      <th className="py-2 px-4 border">Estado</th>
                      <th className="py-2 px-4 border">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTanda.participantes?.map((p, index) => {
                      const estado = calcularEstadoParticipante(selectedTanda, p, index);
                      // Encuentra pago actual del participante (para comprobante)
                      const pagoActual = pagos.find(
                        pago => pago.userId?._id === p.userId?._id && pago.tandaId === selectedTanda._id && pago.comprobanteUrl
                      );
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border">{p.userId?.nombre || 'Sin nombre'} ({p.userId?.correo || 'Sin correo'})</td>
                          <td className="py-2 px-4 border">{cicloActualParticipante(selectedTanda, p, index)}</td>
                          <td className="py-2 px-4 border">{p.ultimoPago ? new Date(p.ultimoPago).toLocaleDateString() : 'No disponible'}</td>
                          <td className={`py-2 px-4 border font-semibold ${
                            estado === 'Atrasado' ? 'text-red-600' :
                            estado === 'Pagado' ? 'text-green-600' :
                            'text-yellow-600'
                          }`}>
                            {estado}
                          </td>
                          <td className="py-2 px-4 border space-x-1 flex gap-1">
                            <button
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs"
                              title="Validar"
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-xs"
                              onClick={() => enviarRecordatorio(p)}
                              title="Recordar"
                            >
                              <FaEnvelope />
                            </button>
                            {estado === "Atrasado" && (
                              <button
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                                onClick={() => notificarAtraso(p)}
                                title="Notificar Atraso"
                              >
                                <FaWhatsapp />
                              </button>
                            )}
                            {pagoActual && (
                              <a
                                href={pagoActual.comprobanteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-400 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
                                title="Ver Comprobante"
                              >
                                <FaRegEye />
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded shadow-inner border border-gray-200">
              <h4 className="text-lg font-bold mb-2 text-blue-700">Resumen Financiero</h4>
              {/* Aquí puedes hacer una sumatoria real si quieres */}
              <p><strong>Avance:</strong> {selectedTanda.participantes.length} ciclos de {selectedTanda.totalCiclos}</p>
              <p><strong>Total pagado:</strong> ${selectedTanda.monto * selectedTanda.participantes.length}</p>
              <p><strong>Monto faltante:</strong> ${selectedTanda.monto * (selectedTanda.totalCiclos - selectedTanda.participantes.length)}</p>
            </div>

            <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
              <button
                onClick={() => descargarPDFTanda(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 text-sm flex items-center gap-2"
              >
                <FaRegFilePdf /> Descargar PDF
              </button>
              <button
                onClick={() => descargarPDFTanda(true)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm flex items-center gap-2"
              >
                <FaRegFilePdf /> Descargar Atrasados PDF
              </button>
              <button
                onClick={() => setSelectedTanda(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition transform hover:scale-105"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GestionAhorrosEmpleado;
