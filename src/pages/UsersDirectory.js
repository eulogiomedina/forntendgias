import React, { useState, useEffect } from "react";
import API_URL from "../apiConfig";

// Página de directorio de usuarios tipo "user"
const UsersDirectory = () => {
  const [users, setUsers] = useState([]);
  const [ahorrosUsuarios, setAhorrosUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trae todos los usuarios
    const fetchData = async () => {
      try {
        const usersRes = await fetch(`${API_URL}/api/users`);
        const usersData = await usersRes.json();

        // Filtrar solo users (NO admins ni empleados)
        const onlyUsers = Array.isArray(usersData)
          ? usersData.filter(u => u.role === "user")
          : [];

        // Trae todos los registros de ahorros-usuarios
        const ahorrosRes = await fetch(`${API_URL}/api/ahorros-usuarios`);
        const ahorrosData = await ahorrosRes.json();

        // La clave: asegurar que SIEMPRE sea array
        let ahorrosArr = [];
        if (Array.isArray(ahorrosData)) {
          ahorrosArr = ahorrosData;
        } else if (ahorrosData && Array.isArray(ahorrosData.data)) {
          ahorrosArr = ahorrosData.data;
        } // Si hay otro wrapper cámbialo aquí

        setUsers(onlyUsers);
        setAhorrosUsuarios(ahorrosArr);
      } catch (error) {
        alert("Error cargando usuarios o ahorros-usuarios");
        setUsers([]);
        setAhorrosUsuarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Relaciona usuario con sus ahorros/credenciales
  function getAhorrosForUser(userId) {
    if (!Array.isArray(ahorrosUsuarios)) return [];
    return ahorrosUsuarios.filter(a => String(a.userId) === String(userId));
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-xl mt-8">
      <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">Directorio de Usuarios</h2>
      {loading ? (
        <div className="text-center text-blue-600">Cargando...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-600">No hay usuarios registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Teléfono</th>
                <th className="border p-2">Facebook</th>
                <th className="border p-2">Foto Credencial</th>
                <th className="border p-2">Foto Perfil</th>
                <th className="border p-2">Tandas (ahorros)</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const ahorros = getAhorrosForUser(u._id);

                return (
                  <tr key={u._id} className="hover:bg-blue-50">
                    <td className="border p-2 font-semibold">{u.nombre || "-"}</td>
                    <td className="border p-2">{u.correo || "-"}</td>
                    <td className="border p-2">{u.telefono || "-"}</td>
                    <td className="border p-2">
                      {ahorros[0]?.ahorros[0]?.facebook ? (
                        <a
                          href={ahorros[0]?.ahorros[0]?.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline"
                        >
                          Facebook
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border p-2">
                      {ahorros[0]?.ahorros[0]?.credencial ? (
                        <a
                          href={ahorros[0]?.ahorros[0]?.credencial}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={ahorros[0]?.ahorros[0]?.credencial}
                            alt="Credencial"
                            className="h-12 rounded shadow inline"
                          />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border p-2">
                      {ahorros[0]?.ahorros[0]?.fotoPersona ? (
                        <a
                          href={ahorros[0]?.ahorros[0]?.fotoPersona}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={ahorros[0]?.ahorros[0]?.fotoPersona}
                            alt="Perfil"
                            className="h-12 w-12 rounded-full shadow inline"
                          />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border p-2">
                      {/* Listar tandas/ahorros */}
                      {ahorros.length === 0 ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        <ul className="list-disc ml-4">
                          {ahorros.map((ah, idx2) =>
                            ah.ahorros.map((t, j) => (
                              <li key={j}>
                                <span className="font-semibold">
                                  {t.nombrePerfil || u.nombre || "-"}
                                </span>{" "}
                                <span className="text-gray-600">
                                  ({t.tipo} ${t.monto})
                                </span>
                                <span className="block text-xs text-gray-500">
                                  {t.fechaInicio
                                    ? new Date(t.fechaInicio).toLocaleDateString("es-MX")
                                    : ""}
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersDirectory;
