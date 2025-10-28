import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../apiConfig";

export default function RecompensasUsuario() {
  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?._id || storedUser?.id;

    if (!userId) {
      setLoading(false);
      return;
    }

    const obtenerRecompensas = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/recompensas/${userId}`);
        setRecompensas(res.data || []);
      } catch {
        setRecompensas([]);
      } finally {
        setLoading(false);
      }
    };

    obtenerRecompensas();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-xl p-6 mt-6 animate-pulse">
        <p className="text-gray-600">Cargando recompensas...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 mt-6 border border-gray-200 animate-fade-in">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        🏅 Recompensas obtenidas
      </h3>

      {recompensas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recompensas.map((r, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 200}ms`, animationFillMode: "backwards" }}
              className={`p-5 rounded-xl shadow-lg transition-all transform hover:scale-105 animate-slide-up
                ${
                  r.obtenida
                    ? "bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 border-yellow-500"
                    : "bg-gray-100 border border-gray-300"
                }`}
            >
              {/* Icons opcionales */}
              <div className="flex justify-center mb-3">
                <img
                  src={`/icons/${r.puntosRequeridos}.png`}
                  alt={r.nombre}
                  className="w-14 h-14 drop-shadow-md"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>

              <h4 className="text-lg font-bold text-center text-gray-800">
                {r.nombre}
              </h4>
              <p className="text-sm text-center text-gray-700">
                Requiere: <strong>{r.puntosRequeridos} pts</strong>
              </p>

              <div className="text-center mt-4">
                <span
                  className={`inline-block px-4 py-1 rounded-full text-sm font-semibold shadow-md ${
                    r.obtenida
                      ? "bg-green-600 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {r.obtenida ? "✅ Obtenida" : "🔒 Bloqueada"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm mt-4">
          Aún no tienes recompensas. ¡Sigue participando para desbloquear premios! 🎁
        </p>
      )}
    </div>
  );
}
