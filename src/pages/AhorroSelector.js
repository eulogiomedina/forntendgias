import { useState, useEffect } from "react";
import "../styles/AhorroSelector.css";
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
    <div className="ahorro-selector-container">
      <div className="ahorro-selector">
        <h2>Selecciona tu tipo de ahorro</h2>
        <div className="ahorro-buttons">
          {ahorros.map((ahorro) => (
            <button
              key={ahorro._id}
              onClick={() => handleSelect(`${ahorro.monto} ${ahorro.tipo}`)}
              className={selected === `${ahorro.monto} ${ahorro.tipo}` ? "selected" : ""}
            >
              {ahorro.monto} {ahorro.tipo}
            </button>
          ))}
        </div>
        {selected && <p className="selected-ahorro">Seleccionaste: {selected}</p>}
      </div>
    </div>
  );
};

export default AhorroSelector;
