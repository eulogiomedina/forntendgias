import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../apiConfig";

export default function PuntosUsuario() {
  const [puntos, setPuntos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const puntosParaSiguiente = 100; // Puedes hacerlo dinámico más adelante
  const progreso = Math.min((total / puntosParaSiguiente) * 100, 100);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?._id || storedUser?.id;

    if (!userId) {
      setLoading(false);
      return;
    }

    const obtenerPuntos = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/puntos/historial/${userId}`);
        const data = res.data || [];
        const suma = data.reduce((acc, item) => acc + item.puntos, 0);
        setPuntos(data);
        setTotal(suma);
      } catch {
        setPuntos([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    obtenerPuntos();
  }, []);

  if (loading) {
    return (
      <div className="bg-white animate-pulse shadow-md rounded-xl p-6 mb-6">
        <p className="text-gray-500">Cargando tus puntos...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-200 animate-fade-in">
      {/* Header de puntos */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🎯 Tus Puntos</h2>
          <p className="text-gray-500 text-sm">Sistema de Gamificación GIAS</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Puntos acumulados</p>
          <p className="text-4xl font-extrabold text-blue-600">{total}</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <p className="font-semibold text-gray-700 mb-2">
        Progreso hacia próxima recompensa ({total}/{puntosParaSiguiente})
      </p>
      <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mb-4">
        <div
          className="h-4 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-[800ms]"
          style={{ width: `${progreso}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {total >= puntosParaSiguiente
          ? "🎉 ¡Felicidades! ¡Ya puedes reclamar una recompensa!"
          : `📈 Te faltan ${puntosParaSiguiente - total} puntos para tu próxima recompensa`}
      </p>

      {/* Historial */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">📜 Historial de puntos</h3>

      {puntos.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Aún no has generado puntos. Participa para comenzar a ganar recompensas. 🚀
        </p>
      ) : (
        <ul className="max-h-48 overflow-y-auto divide-y divide-gray-200">
          {puntos.map((p, i) => (
            <li key={i} className="py-2 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{p.motivo}</p>
                <p className="text-xs text-gray-500">
                  {new Date(p.fechaRegistro).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`font-bold ${
                  p.puntos > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {p.puntos > 0 ? `+${p.puntos}` : p.puntos}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
