import React from "react";
import { FaPiggyBank, FaCheckCircle } from "react-icons/fa";

const ResumenAhorro = ({ ahorros, setAhorroSeleccionado }) => {
  return (
    <div className="max-w-[400px] mx-auto mt-[40px] mb-[50px] p-[25px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-[15px] text-center font-Poppins animate-[fadeIn_0.6s_ease-in-out] relative">
      {ahorros.map((ahorro, index) => (
        <div
          key={index}
          className="max-w-[400px] mx-auto my-[20px] p-[25px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-[15px] text-center font-Poppins animate-[fadeIn_0.6s_ease-in-out] relative"
        >
          {/* Icono de Cerdito */}
          <div className="text-[70px] text-[#ff69b4] mb-[15px] animate-bounce">
            <FaPiggyBank />
          </div>

          {/* Información del Ahorro */}
          <div className="bg-gradient-to-br from-[#a2d9ff] to-[#00bcd4] text-white rounded-full w-[160px] h-[160px] mx-auto flex flex-col items-center justify-center font-bold shadow-[0_6px_18px_rgba(0,188,212,0.3)]">
            <h1 className="text-[38px] font-bold m-0">${ahorro.monto}</h1>
            <p className="text-[22px] font-bold">{ahorro.tipo}</p>
          </div>

          {/* Fecha de inicio */}
          <div className="text-[16px] font-bold text-[#333] mt-[10px]">
            📅 <strong>Inicio:</strong>{" "}
            {new Date(ahorro.fechaInicio).toLocaleDateString()}
          </div>

          {/* Mensaje de confirmación */}
          <p className="text-[16px] font-bold text-[#28a745] bg-[#e9f7ef] p-[12px] rounded-[10px] mt-[20px] flex items-center justify-center shadow-[0_3px_8px_rgba(40,167,69,0.2)]">
            <FaCheckCircle className="text-[20px] text-[#28a745] mr-[8px]" /> ¡Tu plan de ahorro ha sido registrado con éxito!
          </p>
        </div>
      ))}

      {/* Botón para agregar otro ahorro se puede agregar aquí si es necesario */}
    </div>
  );
};

export default ResumenAhorro;
