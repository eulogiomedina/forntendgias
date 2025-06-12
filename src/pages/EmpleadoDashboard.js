import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';

const EmpleadoDashboard = () => {
  const [resumen, setResumen] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [selectedPago, setSelectedPago] = useState(null); // modal de pagos atrasados
  const [usuarios, setUsuarios] = useState([]);
  const [bloqueadas, setBloqueadas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [modalType, setModalType] = useState(null); // 'usuarios', 'bloqueadas', 'pagos'
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    const fetchResumenOperativo = async () => {
      try {
        const [usuariosRes, bloqueadasRes, pagosRes] = await Promise.all([
        
        axios.get(`${API_URL}/api/acc`),
        axios.get(`${API_URL}/api/accounts`),
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


        // Actividad Reciente → últimos registros
        const ultimosUsuarios = usuariosRes.data.slice(-5).reverse();
        const ultimosPagos = pagosRes.data.slice(-5).reverse();
        const ultimasBloqueadas = bloqueadasRes.data.slice(-5).reverse();

        // Obtener la fecha hace 7 días
        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);

        const actividad = [
        ...ultimosUsuarios
          .map((u) => ({
            tipo: 'Nuevo Usuario',
            detalle: `Nombre: ${u.nombre} ${u.apellidos} — Correo: ${u.correo}`,
            fecha: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString()
              : 'Fecha no disponible',
          })),
        ...ultimosPagos
          .filter((p) => new Date(p.fecha) >= unaSemanaAtras)
          .map((p) => ({
            tipo: 'Nuevo Pago',
            detalle: `Usuario: ${p.userId?.nombre} — Correo: ${p.userId?.correo} — Monto: ${p.monto} — Estado: ${p.estado}`,
            fecha: new Date(p.fecha).toLocaleDateString(),
          })),
        ...ultimasBloqueadas
          .filter((b) => new Date(b.fechaBloqueo) >= unaSemanaAtras)
          .map((b) => ({
            tipo: 'Cuenta Bloqueada',
            detalle: `Correo: ${b.correo}`,
            fecha: new Date(b.fechaBloqueo).toLocaleDateString(),
          })),
      ];

        // Ordenar actividad por fecha descendente (más reciente primero)
        actividad.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        setActividadReciente(actividad);

      } catch (error) {
        console.error('Error al obtener datos para Panel Principal:', error);
      }
    };

    fetchResumenOperativo();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Panel Principal - Empleado</h1>

      {/* Resumen Operativo */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Resumen Operativo</h2>
        <ul className="text-lg text-gray-700 space-y-2">
          <li className="cursor-pointer hover:text-blue-700" onClick={() => setModalType('usuarios')}>
            Total de Usuarios: {resumen.totalUsuarios}
          </li>
          <li className="cursor-pointer hover:text-blue-700" onClick={() => setModalType('bloqueadas')}>
            Total de Cuentas Bloqueadas: {resumen.totalBloqueadas}
          </li>
          <li className="cursor-pointer hover:text-blue-700" onClick={() => setModalType('pagos')}>
            Total de Pagos Registrados: {resumen.totalPagos}
          </li>
        </ul>
      </div>

      {/* Alertas de Retrasos Globales */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-red-600">Alertas de Retrasos Globales</h2>
        {alertas.length === 0 ? (
          <p className="text-green-600">No hay pagos atrasados actualmente.</p>
        ) : (
          <ul className="text-lg text-gray-700 space-y-2">
            {alertas.map((pago) => (
              <li
                key={pago._id}
                onClick={() => setSelectedPago(pago)} // clic para abrir modal
                className="cursor-pointer hover:bg-red-100 p-2 rounded transition"
              >
                Usuario: {pago.userId?.nombre} — Correo: {pago.userId?.correo} — 
                Monto: {pago.monto} — 
                Fecha: {new Date(pago.fecha).toLocaleDateString()}
              </li>

            ))}
          </ul>
        )}
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-purple-600">Actividad Reciente</h2>
        {actividadReciente.length === 0 ? (
          <p className="text-gray-600">No hay actividad reciente.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actividadReciente.map((item, index) => (
              <li key={index} className="bg-gray-50 p-4 rounded-lg shadow border">
                <h4 className="text-lg font-semibold mb-2 text-blue-700">{item.tipo}</h4>
                <p className="text-gray-800 mb-1">{item.detalle}</p>
                <p className="text-sm text-gray-500">Fecha: {item.fecha}</p>
              </li>
            ))}
          </ul>

        )}
      </div>

      {/* Modal Detalle de Pago Atrasado */}
      {selectedPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
            <h3 className="text-2xl font-bold mb-4 text-red-600">Detalle del Pago Atrasado</h3>
            <p><strong>Usuario:</strong> {selectedPago.userId?.nombre} — {selectedPago.userId?.correo}</p>
            <p><strong>Monto:</strong> {selectedPago.monto}</p>
            <p><strong>Fecha:</strong> {new Date(selectedPago.fecha).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> {selectedPago.estado}</p>

            <button
              onClick={() => setSelectedPago(null)}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal General para Usuarios, Bloqueadas o Pagos */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full relative">
            <h3 className="text-2xl font-bold mb-4 text-blue-600">
              {modalType === 'usuarios' && 'Lista de Usuarios'}
              {modalType === 'bloqueadas' && 'Lista de Cuentas Bloqueadas'}
              {modalType === 'pagos' && 'Lista de Pagos'}
            </h3>

            <ul className="space-y-3 max-h-60 overflow-y-auto">
              {modalType === 'usuarios' && usuarios.map((user) => (
                <li key={user._id} className="bg-gray-50 p-3 rounded-lg shadow border">
                  <p><strong>Nombre:</strong> {user.nombre} {user.apellidos}</p>
                  <p><strong>Correo:</strong> {user.correo}</p>
                </li>
              ))}
              {modalType === 'bloqueadas' && bloqueadas.map((cuenta) => (
                <li key={cuenta._id} className="bg-gray-50 p-3 rounded-lg shadow border">
                  <p><strong>Correo:</strong> {cuenta.correo}</p>
                  <p><strong>Fecha Bloqueo:</strong> {new Date(cuenta.fechaBloqueo).toLocaleDateString()}</p>
                </li>
              ))}
              {modalType === 'pagos' && pagos.map((pago) => (
                <li key={pago._id} className="bg-gray-50 p-3 rounded-lg shadow border">
                  <p><strong>Usuario:</strong> {pago.userId?.nombre} — {pago.userId?.correo}</p>
                  <p><strong>Monto:</strong> {pago.monto}</p>
                  <p><strong>Estado:</strong> {pago.estado}</p>
                </li>
              ))}
            </ul>


            <button
              onClick={() => setModalType(null)}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmpleadoDashboard;
