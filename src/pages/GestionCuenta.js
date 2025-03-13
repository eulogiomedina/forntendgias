import React, { useEffect, useState } from "react";
import API_URL from "../apiConfig";

const GestionCuenta = () => {
  const [tanda, setTanda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener usuario almacenado
  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!storedUser || !storedUser.id) {
      console.error("❌ Error: No se encontró el usuario almacenado.");
      setError("No se encontró el usuario.");
      setLoading(false);
      return;
    }

    const userId = storedUser.id;
    const endpoint = `${API_URL}/api/tandas/gestion-cuenta/${userId}`;

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se encontró tanda para este usuario.");
        }
        return res.json();
      })
      .then((data) => {
        console.log("📌 Datos de tanda recibidos:", data);
        setTanda(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error al obtener tanda:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Función para convertir fechas correctamente
  const convertirFechaLocal = (fechaISO) => {
    if (!fechaISO) return "No asignado";
    return new Date(fechaISO)
      .toISOString()
      .split("T")[0]
      .split("-")
      .reverse()
      .join("/");
  };

  // Usamos optional chaining para evitar errores si tanda es null
  const fechaPagoUsuario = convertirFechaLocal(
    tanda?.fechasPago?.find(
      (fp) => String(fp.userId) === String(storedUser.id) && fp.fechaPago
    )?.fechaPago
  );

  const fechaReciboUsuario = convertirFechaLocal(
    tanda?.fechasPago
      ?.filter(
        (fp) => String(fp.userId) === String(storedUser.id) && fp.fechaRecibo
      )
      ?.sort((a, b) => new Date(a.fechaRecibo) - new Date(b.fechaRecibo))
      ?.map((fp) => fp.fechaRecibo)[0]
  );

  let siguienteReceptorDisplay = "Pendiente";

  const proximoPago = tanda?.fechasPago
    ?.filter((fp) => fp.fechaPago)
    ?.sort((a, b) => new Date(a.fechaPago) - new Date(b.fechaPago))
    ?.find((fp) => new Date(fp.fechaPago) >= new Date());

  if (proximoPago) {
    const proximoReceptor = tanda?.fechasPago
      ?.filter((fp) => fp.fechaRecibo && new Date(fp.fechaRecibo) >= new Date())
      ?.sort((a, b) => new Date(a.fechaRecibo) - new Date(b.fechaRecibo))[0];

    if (proximoReceptor) {
      const receptor = tanda?.participantes?.find((p) => {
        const participantId =
          typeof p.userId === "object" ? p.userId._id : p.userId;
        console.log("Comparando:", participantId, "con", proximoReceptor.userId);
        return participantId === proximoReceptor.userId;
      });

      if (receptor) {
        const participantData = receptor.userId;
        if (typeof participantData === "object") {
          siguienteReceptorDisplay =
            participantData._id === storedUser.id
              ? "Te toca a ti esta semana"
              : `${participantData.nombre} ${participantData.apellidos}`;
        } else {
          siguienteReceptorDisplay =
            participantData === storedUser.id
              ? "Te toca a ti esta semana"
              : participantData;
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto my-10 p-[110px] bg-[#f5f5f5] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-transform transition-shadow duration-300 hover:-translate-y-[5px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[800px] mx-auto my-10 p-[110px] bg-[#f5f5f5] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-transform transition-shadow duration-300 hover:-translate-y-[5px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
        <p>{error}</p>
      </div>
    );
  }

  if (!tanda) {
    return (
      <div className="max-w-[800px] mx-auto my-10 p-[110px] bg-[#f5f5f5] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-transform transition-shadow duration-300 hover:-translate-y-[5px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
        <p>No tienes tandas activas.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto my-10 p-[110px] font-['Roboto'] bg-[#f5f5f5] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-transform transition-shadow duration-300 hover:-translate-y-[5px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
      <h2 className="text-center text-[#2c3e50] mb-8 text-[2.5rem] font-bold border-b-[3px] border-b-[#3498db] pb-[10px]">
        Gestión de Cuenta
      </h2>
      <div className="bg-white p-5 rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-8">
        <p className="mb-4 text-[18px] leading-[1.6] text-[#34495e]">
          <strong className="text-[#3498db] font-semibold">Monto:</strong> ${tanda.monto}
        </p>
        <p className="mb-4 text-[18px] leading-[1.6] text-[#34495e]">
          <strong className="text-[#3498db] font-semibold">Tipo:</strong> {tanda.tipo}
        </p>
        <p className="mb-4 text-[18px] leading-[1.6] text-[#34495e]">
          <strong className="text-[#3498db] font-semibold">Fecha de inicio:</strong>{" "}
          {tanda.fechaInicio ? convertirFechaLocal(tanda.fechaInicio) : "No definida"}
        </p>
        <p className="mb-4 text-[18px] leading-[1.6] text-[#34495e]">
          <strong className="text-[#3498db] font-semibold">Día de pago:</strong> {tanda.diaPago}
        </p>
        <p className="mb-4 text-[18px] leading-[1.6] text-[#34495e]">
          <strong className="text-[#3498db] font-semibold">Fecha de tu pago:</strong> {fechaPagoUsuario}
        </p>
        <p className="mb-4 text-[18px] leading-[1.6] text-[#34495e]">
          <strong className="text-[#3498db] font-semibold">Fecha en la que recibirás:</strong> {fechaReciboUsuario}
        </p>
        <p className="mb-4 text-[18px] leading-[1.6] text-[#34495e]">
          <strong className="text-[#3498db] font-semibold">Tu posición en la tanda:</strong> {tanda.posicionUsuario}
        </p>
        <p className="mb-4 text-[18px] leading-[1.6] text-[#34495e]">
          <strong className="text-[#3498db] font-semibold">Ciclos restantes:</strong> {tanda.ciclosRestantes}
        </p>
        <p className="mb-4 text-[18px] leading-[1.6] text-[#34495e]">
          <strong className="text-[#3498db] font-semibold">Faltan para llenarse:</strong> {tanda.faltantesParaLlenarse}
        </p>
        <p className="mb-4 text-[18px] leading-[1.6] text-[#34495e]">
          <strong className="text-[#3498db] font-semibold">Siguiente receptor:</strong> {siguienteReceptorDisplay}
        </p>

        <div className="mt-6 text-[#c0392b] font-bold text-[16px] bg-[#fce4e4] p-[15px] rounded border border-[#c0392b]">
          <strong>¡Atención!</strong> Si no pagas a tiempo, tu turno se pospondrá una {tanda.tipo.toLowerCase()} más y se te agregarán $80 de penalización.
        </div>
      </div>
    </div>
  );
};

export default GestionCuenta;
