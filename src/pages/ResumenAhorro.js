import React from "react";
import { FaPiggyBank, FaCheckCircle } from "react-icons/fa"; // Íconos de FontAwesome
import "../styles/ResumenAhorro.css"; // Asegúrate de importar los estilos

const ResumenAhorro = ({ ahorros, setAhorroSeleccionado }) => {
  return (
    <div>
      {ahorros.map((ahorro, index) => (
        <div key={index} className="ahorro-item">
          {/* Icono de Cerdito (Alcancía) */}
          <div className="icono-cerdito">
            <FaPiggyBank />
          </div>

          {/* Información del Ahorro */}
          <div className="detalle-ahorro">
            <h1 className="monto">${ahorro.monto}</h1>
            <p className="tipo">{ahorro.tipo}</p>
          </div>

          {/* Fecha de inicio */}
          <div className="fecha-inicio">
            📅 <strong>Inicio:</strong> {new Date(ahorro.fechaInicio).toLocaleDateString()}
          </div>

          {/* Mensaje de confirmación */}
          <p className="mensaje-confirmacion">
            <FaCheckCircle className="icon-success" /> ¡Tu plan de ahorro ha sido registrado con éxito!
          </p>
        </div>
      ))}

      {/* Botón para agregar otro ahorro */}
      <div className="botones-container">
        <button className="btn-nuevo-ahorro" onClick={() => setAhorroSeleccionado(null)}>
          ➕ Agregar otro ahorro
        </button>
      </div>
    </div>
  );
};

export default ResumenAhorro;
