import { useState, useEffect } from "react";
import API_URL from '../apiConfig';

const AhorroSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState("");
  const [ahorros, setAhorros] = useState([]);

  // Cargar ahorros desde el backend
  useEffect(() => {
    fetch(`${API_URL}/api/nuevos-ahorros`)
      .then((res) => res.json())
      .then((data) => setAhorros(data))
      .catch((err) => console.error("Error al cargar ahorros:", err));
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    onSelect(option);
  };

  return (
    <div className="flex justify-center items-center mt-10 p-5">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Selecciona tu tipo de ahorro</h2>
        <div className="grid grid-cols-2 gap-4">
          {ahorros.map((ahorro) => (
            <button
              key={ahorro._id}
              onClick={() => handleSelect(`${ahorro.monto} ${ahorro.tipo}`)}
              className={`py-2 px-4 border-2 rounded-md text-lg cursor-pointer transition-all duration-300 
                          ${selected === `${ahorro.monto} ${ahorro.tipo}` ? 'bg-blue-600 text-white font-semibold' : 'bg-blue-700 text-white hover:bg-blue-600'}`}
            >
              {ahorro.monto} {ahorro.tipo}
            </button>
          ))}
        </div>
        {selected && <p className="mt-4 text-lg text-green-600 font-semibold">Seleccionaste: {selected}</p>}
      </div>
    </div>
  );
};

export default AhorroSelector;
