import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import PuntosUsuario from "../components/PuntosUsuario";
import RecompensasUsuario from "../components/RecompensasUsuario";
import { FaBookOpen } from "react-icons/fa";

export default function GamificacionDashboard() {
  const { user } = useContext(AuthContext);
  const [mostrarReglas, setMostrarReglas] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="max-w-3xl w-full bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#0F2B45] text-center mb-4">
          🧩 Panel de Gamificación GIAS
        </h1>

        {/* Botón para ver reglas */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setMostrarReglas(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-5 py-3 rounded-lg shadow-md transition-transform hover:scale-105"
          >
            <FaBookOpen className="text-xl" /> Ver reglas del sistema
          </button>
        </div>

        {/* Componentes de Puntos y Recompensas */}
        <PuntosUsuario userId={user?._id} />
        <RecompensasUsuario userId={user?._id} />
      </div>

      {/* Modal con reglas */}
      {mostrarReglas && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl overflow-y-auto max-h-[90vh] animate-fade-in p-8 border border-gray-200 relative">
            
            {/* Botón Cerrar */}
            <button
              onClick={() => setMostrarReglas(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
            >
              ✖
            </button>

            {/* Encabezado */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-[#0F2B45]">
                🎮 Sistema de Gamificación GIAS
              </h2>
              <p className="text-gray-600 mt-2">
                Descubre cómo ganar puntos, desbloquear insignias y evitar penalizaciones.
              </p>
            </div>

            {/* Contenedor de reglas */}
            <div className="space-y-6">
              {/* Sección 1 */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-5 shadow-sm">
                <h3 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                  ⭐ 1. Acumulación de Puntos
                </h3>
                <ul className="mt-2 text-gray-700 space-y-1">
                  <li>✅ <strong>+10 pts</strong> por depósitos puntuales</li>
                  <li>⚡ <strong>+5 pts</strong> por depósitos adelantados</li>
                  <li>⏳ <strong>0 pts</strong> por depósitos atrasados</li>
                  <li>🎯 <strong>+100 pts</strong> al completar un ciclo de ahorro</li>
                  <li>🏅 <strong>+50 pts</strong> por constancia (3 pagos puntuales seguidos)</li>
                </ul>
              </div>

              {/* Sección 2 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-5 shadow-sm">
                <h3 className="text-xl font-bold text-green-700 flex items-center gap-2">
                  🎁 2. Bonificaciones
                </h3>
                <ul className="mt-2 text-gray-700 space-y-1">
                  <li>🚀 <strong>+20 pts</strong> por integrarse a una tanda nueva</li>
                  <li>👥 <strong>+15 pts</strong> extra en tandas con más de 10 miembros</li>
                </ul>
              </div>

              {/* Sección 3 */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-5 shadow-sm">
                <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
                  ⚠️ 3. Penalizaciones
                </h3>
                <ul className="mt-2 text-gray-700 space-y-1">
                  <li>⌛ <strong>-2 pts</strong> por cada día de retraso</li>
                  <li>🚫 <strong>Abandono de tanda:</strong> se resta el <strong>50%</strong> de puntos acumulados</li>
                </ul>
              </div>

              {/* Sección 4 */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg p-5 shadow-sm">
                <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                  🏆 4. Recompensas Digitales
                </h3>
                <ul className="mt-2 text-gray-700 space-y-1">
                  <li>100 pts → Insignia Ahorrista Responsable</li>
                  <li>250 pts → Insignia Constancia Dorada</li>
                  <li>500 pts → Aparición en ranking de ahorristas</li>
                  <li>1000 pts → Maestro del Ahorro + cupón</li>
                </ul>
              </div>

              {/* Sección 5 */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg p-5 shadow-sm">
                <h3 className="text-xl font-bold text-yellow-700 flex items-center gap-2">
                  🎟 5. Rifa Final
                </h3>
                <p className="mt-2 text-gray-700">
                  Cada <strong>100 puntos</strong> equivale a <strong>1 boleto</strong> (máximo 5 boletos).  
                  La rifa se realiza al finalizar la tanda.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <button
                onClick={() => setMostrarReglas(false)}
                className="bg-[#0F2B45] hover:bg-blue-900 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-transform hover:scale-105"
              >
                Cerrar ✖
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
