import React from "react";

export default function PuntosDashboard() {
  const puntosActuales = 180;
  const puntosParaSiguiente = 250;
  const progreso = (puntosActuales / puntosParaSiguiente) * 100;

  const recompensas = [
    { nombre: "🏅 Ahorrista Responsable", puntos: 100, obtenida: true },
    { nombre: "⭐ Constancia Dorada", puntos: 250, obtenida: false },
    { nombre: "🏆 Ranking de Ahorristas", puntos: 500, obtenida: false },
    { nombre: "💎 Maestro del Ahorro + Cupón", puntos: 1000, obtenida: false },
  ];

  const historial = [
    { fecha: "10/10/2025", accion: "💰 Depósito puntual", puntos: "+10" },
    { fecha: "01/10/2025", accion: "⏰ Pago atrasado (2 días)", puntos: "-4" },
    { fecha: "25/09/2025", accion: "🎉 Ciclo completado", puntos: "+100" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🎯 Mis Puntos</h1>
          <p className="text-gray-600">Sistema de Gamificación GIAS</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Puntos actuales</p>
          <p className="text-4xl font-bold text-blue-600">{puntosActuales} ✨</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6 animate-slide-up">
        <p className="text-gray-700 font-semibold mb-2">
          Progreso hacia la próxima recompensa ({puntosActuales}/{puntosParaSiguiente})
        </p>
        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
          <div
            className="h-4 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-[800ms] ease-out"
            style={{ width: `${progreso}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">¡Sigue acumulando puntos para desbloquear más recompensas! 🚀</p>
      </div>

      {/* Rewards */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">🏅 Recompensas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {recompensas.map((item, index) => (
          <div
            key={index}
            style={{ animationDelay: `${index * 200}ms`, animationFillMode: "backwards" }}
            className={`p-4 rounded-lg shadow-md border hover:scale-105 transition-all animate-slide-up ${
              item.obtenida ? "bg-green-100 border-green-400" : "bg-white border-gray-300"
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-800">{item.nombre}</h3>
            <p className="text-sm text-gray-600">Requiere: {item.puntos} pts</p>
            <span
              className={`mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                item.obtenida ? "bg-green-500 text-white" : "bg-yellow-300 text-gray-700"
              }`}
            >
              {item.obtenida ? "✅ Obtenida" : "🔒 Bloqueada"}
            </span>
          </div>
        ))}
      </div>

      {/* Historial */}
      <div className="bg-white shadow-md rounded-xl p-6 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📜 Historial de puntos</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-2">Fecha</th>
              <th className="p-2">Acción</th>
              <th className="p-2 text-center">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-100 transition-all">
                <td className="p-2">{item.fecha}</td>
                <td className="p-2">{item.accion}</td>
                <td
                  className={`p-2 text-center font-bold ${
                    item.puntos.startsWith("+") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.puntos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
