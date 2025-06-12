import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchTandas();
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

    if (filtros.estado) {
      filtradas = filtradas.filter((t) => t.estado === filtros.estado);
    }

    if (filtros.frecuencia) {
      filtradas = filtradas.filter((t) => t.tipo === filtros.frecuencia);
    }

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

  const indexOfLastTanda = currentPage * tandasPerPage;
  const indexOfFirstTanda = indexOfLastTanda - tandasPerPage;
  const currentTandas = filteredTandas.slice(indexOfFirstTanda, indexOfLastTanda);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-[1200px] mx-auto mt-[110px] mb-5 p-5 bg-white shadow-xl rounded-lg">
      <h2 className="text-3xl font-extrabold mb-6 text-blue-800">Gestión de Ahorros (Empleado)</h2>

      {/* Filtros Avanzados */}
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
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-xl w-full relative animate-fade-in">
            <h3 className="text-2xl font-extrabold mb-4 text-blue-600">Detalles de la Tanda</h3>
            <p><strong>Monto:</strong> ${selectedTanda.monto}</p>
            <p><strong>Frecuencia:</strong> {selectedTanda.tipo}</p>
            <p><strong>Estado:</strong> {selectedTanda.estado || 'N/A'}</p>
            <p><strong>Total Ciclos:</strong> {selectedTanda.totalCiclos || 'N/A'}</p>
            <p><strong>Fecha de Inicio:</strong> {selectedTanda.fechaInicio ? new Date(selectedTanda.fechaInicio).toLocaleDateString() : 'No disponible'}</p>

            <div className="mt-4">
              <h4 className="text-lg font-bold mb-2 text-blue-700">Participantes:</h4>
              {selectedTanda.participantes?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {selectedTanda.participantes.map((p, index) => (
                    <li key={index}>
                      {p.userId?.nombre || 'Sin nombre'} ({p.userId?.correo || 'Sin correo'})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay participantes en esta tanda.</p>
              )}
            </div>

            <button
              onClick={() => setSelectedTanda(null)}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition transform hover:scale-105"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAhorrosEmpleado;
