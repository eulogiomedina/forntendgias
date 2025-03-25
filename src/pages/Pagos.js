import React, { useEffect, useState } from "react";
import API_URL from "../apiConfig";
import { Link } from "react-router-dom";
import { FaMoneyBillWave, FaRegFileAlt, FaRegCheckCircle, FaExclamationCircle, FaCopy, FaCheckCircle } from 'react-icons/fa';

const Pagos = () => {
  const [tandas, setTandas] = useState([]);
  const [selectedTanda, setSelectedTanda] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [cuentaDestino, setCuentaDestino] = useState(null);
  const [pagosCargados, setPagosCargados] = useState(false);
  const [copiado, setCopiado] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const [mensajePago, setMensajePago] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("info"); // "info", "success", "warning", "error"
  const [enviandoPago, setEnviandoPago] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [contenidoModal, setContenidoModal] = useState("");


  const hoy = new Date();
  const lunesSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 1));
  const domingoSemana = new Date(hoy.setDate(lunesSemana.getDate() + 6));

  const convertirFechaLocal = (fechaISO) => {
    if (!fechaISO) return "No definida";
    const fecha = new Date(fechaISO);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha.toLocaleDateString("es-MX");
  };

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_URL}/api/tandas/gestion-cuenta-all/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setTandas(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error al obtener tandas:", err));
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && !pagosCargados) {
      const controller = new AbortController();
      fetch(`${API_URL}/api/pagos/${user.id}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 404) {
              setHistorial([]);
              setPagosCargados(true);
              return;
            }
            const error = await res.json();
            throw new Error(error.message || "Error al obtener historial.");
          }
          const data = await res.json();
          setHistorial(Array.isArray(data) ? data : []);
          setPagosCargados(true);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.warn("No hay historial de pagos:", err.message);
          }
        });

      return () => controller.abort();
    }
  }, [user, pagosCargados]);

  useEffect(() => {
    fetch(`${API_URL}/api/cuenta-destino`)
      .then((res) => res.json())
      .then((data) => setCuentaDestino(data))
      .catch((err) => console.error("Error al obtener cuenta destino:", err));
  }, []);

  const handleCardClick = (tanda) => {
    setSelectedTanda((prev) => (prev?._id === tanda._id ? null : tanda));
  };


  const handleArchivoChange = (e) => {
    if (e.target.files?.[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const obtenerDiaSemana = (fechaISO) => {
    const fecha = new Date(fechaISO);
    // Corrige la fecha para evitar el desfase de horario
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };   
  
  const yaPagoEstaSemana = (tanda) => {
    const hoy = new Date();
    return tanda.fechasPago?.some(f =>
      f.userId === user.id &&
      f.fechaPago &&
      new Date(f.fechaPago) >= lunesSemana &&
      new Date(f.fechaPago) <= domingoSemana &&
      historial.some(h =>
        h.userId === user.id &&
        h.tandaId === tanda._id &&
        new Date(h.fechaPago).getTime() === new Date(f.fechaPago).getTime()
      )
    );
  };  

  const handleRegistrarPago = async () => {
    if (!selectedTanda) return alert("Selecciona una tanda a pagar.");
    if (!cuentaDestino) return alert("⚠️ No hay cuenta destino registrada.");
  
    const penalizacion = estaAtrasado(selectedTanda) ? 80 : 0;
    const totalPagar = selectedTanda.monto + penalizacion;
  
    try {
      setEnviandoPago(true);
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("tandaId", selectedTanda._id);
      formData.append("monto", totalPagar);
      if (archivo) formData.append("comprobante", archivo);
  
      const response = await fetch(`${API_URL}/api/pagos`, {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al registrar el pago.");
  
      setMensajePago(`${data.message} (Estado: ${data.pago.estado})`);
      setTipoMensaje(
        data.pago.estado === "Aprobado"
          ? "success"
          : data.pago.estado === "Rechazado"
          ? "error"
          : "warning"
      );
  
      if (data.pago.estado === "Aprobado") {
        let mensajeModal = "✅ ¡Gracias por tu pago! Ha sido aprobado correctamente.";
      
        const historialActualizado = [...historial, data.pago];
        const proxima = obtenerProximaFechaPagoConHistorial(selectedTanda, historialActualizado);
        const fechaHoy = new Date();
        const proximaFecha = proxima?.fechaPago ? new Date(proxima.fechaPago) : null;
        const siguienteSemanaInicio = new Date(lunesSemana);
        siguienteSemanaInicio.setDate(siguienteSemanaInicio.getDate() + 7);
        const siguienteSemanaFin = new Date(domingoSemana);
        siguienteSemanaFin.setDate(siguienteSemanaFin.getDate() + 7);
      
        if (proxima?.fechaPago) {
          mensajeModal += `\n🗓️ Tu siguiente fecha de pago es el ${obtenerDiaSemana(proxima.fechaPago)}.`;
        } else {
          mensajeModal += `\n✅ ¡No tienes pagos pendientes por ahora!`;
        }        
      
        // Solo mostrar que le toca recibir si no está pagando tarde
        const yaPagoEstaSemana = selectedTanda.fechasPago?.some(f => 
          f.userId === user.id &&
          new Date(f.fechaPago).toDateString() === fechaHoy.toDateString() &&
          historial.some(h => h.tandaId === selectedTanda._id && new Date(h.fechaPago).toDateString() === fechaHoy.toDateString())
        );
      
        const tocaRecibirLaProxima = selectedTanda.fechasPago?.some(f =>
          f.userId === user.id &&
          f.fechaRecibo &&
          new Date(f.fechaRecibo) >= siguienteSemanaInicio &&
          new Date(f.fechaRecibo) <= siguienteSemanaFin
        );
      
        if (tocaRecibirLaProxima && !estaAtrasado(selectedTanda)) {
          mensajeModal += `\n🎁 La próxima semana te toca recibir. ¡No necesitarás pagar!`;
        }
      
        setMostrarModal(true);
        setContenidoModal(mensajeModal);
      } else if (data.pago.estado === "Rechazado") {
        setMostrarModal(true);
        setContenidoModal(data.message || "Tu pago ha sido rechazado.");
        setMensajePago(null);
        setTipoMensaje("info");
      }           
  
      setHistorial((prev) => [...prev, data.pago]);
      // 🔄 Volver a cargar todas las tandas y actualizar la seleccionada
    const resTandas = await fetch(`${API_URL}/api/tandas/gestion-cuenta-all/${user.id}`);
    const nuevasTandas = await resTandas.json();
    setTandas(nuevasTandas);
    const tandaActualizada = nuevasTandas.find(t => t._id === selectedTanda._id);
    if (tandaActualizada) {
      setSelectedTanda(tandaActualizada);
    }

    } catch (error) {
      setMensajePago(error.message || "Ocurrió un error.");
      setTipoMensaje("error");
    } finally {
      setEnviandoPago(false);
    }
  };  

  const obtenerProximaFechaPagoConHistorial = (tanda, historialLocal) => {
    return tanda?.fechasPago
      ?.filter(f =>
        f.userId === user.id &&
        f.fechaPago &&
        !historialLocal.some(h =>
          h.userId === user.id &&
          h.tandaId === tanda._id &&
          new Date(h.fechaPago).getTime() === new Date(f.fechaPago).getTime()
        )
      )
      .sort((a, b) => new Date(a.fechaPago) - new Date(b.fechaPago))[0] || null;
  };  

  const estaAtrasado = (tanda) => {
    const hoy = new Date();
    const pagosPendientes = tanda.fechasPago?.filter(f => 
      f.userId === user.id &&
      f.fechaPago &&
      new Date(f.fechaPago) < hoy &&
      !historial.some(h => new Date(h.fechaPago).toDateString() === new Date(f.fechaPago).toDateString())
    );
    return pagosPendientes?.length > 0;
  };

  const obtenerProximaFechaPago = (tanda) => {
    if (!tanda?.fechasPago || !user?.id) return null;
  
    const pendientes = tanda.fechasPago
      .filter(f =>
        f.userId === user.id &&
        f.fechaPago &&
        !historial.some(h =>
          h.userId === user.id &&
          h.tandaId === tanda._id &&
          new Date(h.fechaPago).getTime() === new Date(f.fechaPago).getTime()
        )
      )
      .sort((a, b) => new Date(a.fechaPago) - new Date(b.fechaPago));
  
    return pendientes[0] || null;
  };  

  const usuarioRecibeEstaSemana = (tanda) => {
    if (!tanda?.fechasPago || !user?.id) return false;
    return tanda.fechasPago.some((f) => {
      if (f.userId !== user.id || !f.fechaRecibo) return false;
      const fechaRecibo = new Date(f.fechaRecibo);
      return fechaRecibo >= lunesSemana && fechaRecibo <= domingoSemana;
    });
  };

  const handleCopiar = (valor, tipo) => {
    navigator.clipboard.writeText(valor);
    setCopiado(tipo);
    setTimeout(() => setCopiado(""), 1500);
  };

  const fondoTarjeta = cuentaDestino?.banco?.toLowerCase().includes("coppel")
    ? "from-yellow-500 via-yellow-400 to-yellow-300"
    : "from-indigo-900 via-blue-700 to-blue-500";

  return (
    <div className="max-w-[800px] mx-auto my-[40px] p-[40px] bg-white rounded-lg shadow-lg border border-gray-300">
      <h2 className="text-3xl text-gray-800 mb-6 text-center font-semibold border-b-2 border-blue-600 pb-2">
      {mensajePago && (
        <div
          className={`my-4 p-4 rounded-md text-sm border ${
            tipoMensaje === "success"
              ? "bg-green-100 text-green-800 border-green-300"
              : tipoMensaje === "error"
              ? "bg-red-100 text-red-800 border-red-300"
              : tipoMensaje === "warning"
              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
              : "bg-blue-100 text-blue-800 border-blue-300"
          }`}
        >
          {mensajePago}
        </div>
      )}
        <FaMoneyBillWave className="inline-block mr-2" /> Registrar Pago
      </h2>

      {cuentaDestino ? (
        <div className="flex justify-center my-8">
          <div className={`relative bg-gradient-to-br ${fondoTarjeta} text-white rounded-2xl shadow-xl p-6 w-full sm:max-w-[500px] font-sans overflow-hidden`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold tracking-wider uppercase">{cuentaDestino.banco}</h3>
              <div className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm">🏦</div>
            </div>

            <div className="mb-6">
              <div className="w-12 h-8 bg-yellow-300 rounded-md shadow-inner border border-yellow-500"></div>
            </div>

            {cuentaDestino.numeroTarjeta && (
              <div className="text-xl font-mono tracking-wider mb-5 text-center">
                {cuentaDestino.numeroTarjeta.replace(/(\d{4})(?=\d)/g, "$1 ")}
                <button onClick={() => handleCopiar(cuentaDestino.numeroTarjeta, "tarjeta")} className="ml-3 text-white text-sm hover:text-yellow-300">
                  <FaCopy className="inline" />
                </button>
                {copiado === "tarjeta" && <FaCheckCircle className="inline ml-1 text-green-300" title="Copiado" />}
              </div>
            )}

            <div className="text-center mb-4">
              <p className="text-xs uppercase text-white/70 font-medium mb-1 tracking-wide">Titular</p>
              <p className="font-semibold text-base">{cuentaDestino.titular}</p>
            </div>

            <div className="text-center mb-4">
              <p className="text-xs uppercase text-white/70 font-medium mb-1 tracking-wide">Número de cuenta</p>
              <p className="font-mono text-base text-white">
                {cuentaDestino.numeroCuenta}
                <button onClick={() => handleCopiar(cuentaDestino.numeroCuenta, "cuenta")} className="ml-3 text-white text-sm hover:text-yellow-300">
                  <FaCopy className="inline" />
                </button>
                {copiado === "cuenta" && <FaCheckCircle className="inline ml-1 text-green-300" title="Copiado" />}
              </p>
            </div>

            <div className="mt-4 text-center px-2">
              <p className="text-xs text-white font-medium tracking-wide flex items-center justify-center gap-2">
                <span role="img" aria-label="info">💡</span>
                <span className="text-[14px] leading-tight">Estos son los datos bancarios para realizar el pago</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-red-600 font-bold text-center mt-4">
          <FaExclamationCircle className="inline-block mr-1" /> ⚠️ No hay cuenta destino registrada.
        </p>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {tandas.length > 0 ? (
          tandas.map((tanda) => (
            <div
              key={tanda._id}
              onClick={() => handleCardClick(tanda)}
              className={`p-5 border rounded-lg cursor-pointer transition-transform w-[250px] text-center shadow-md hover:shadow-lg ${
                selectedTanda?._id === tanda._id ? "border-blue-600 bg-blue-100" : "border-gray-300"
              }`}
            >
              <p className="text-lg font-semibold">{tanda.monto} {tanda.tipo}</p>
              <p>Posición {tanda.orden ?? "-"} de {Array.isArray(tanda.participantes) ? tanda.participantes.length : 0}</p>
            </div>
          ))
        ) : (
          <p>No tienes tandas activas.</p>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md shadow-2xl relative border border-red-400">
          <h2 className="text-xl font-bold mb-4 text-center">
            {contenidoModal.includes("¡Gracias por tu pago!") ? (
              <span className="text-green-600">Pago Aprobado</span>
            ) : (
              <span className="text-red-600">Pago Rechazado</span>
            )}
          </h2>

            <p className="text-gray-800">{contenidoModal}</p>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
              onClick={() => setMostrarModal(false)}
            >
              ×
            </button>
            <div className="mt-4 text-right">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => setMostrarModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
 
      {selectedTanda && (
        <div className="p-5 border rounded-lg mt-5 bg-blue-50 shadow-md">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Detalles de la Tanda</h4>
          <p><strong>Base Monto:</strong> ${selectedTanda.monto}</p>
          <p><strong>Tipo:</strong> {selectedTanda.tipo}</p>

          <div className="mt-2 space-y-2">
          {usuarioRecibeEstaSemana(selectedTanda) && (
            <p className="text-green-600 font-bold">
              <FaRegCheckCircle className="inline-block mr-1" /> 🎉 Esta semana te toca recibir. ¡No necesitas pagar!
            </p>
          )}

          {(() => {
            const historialLocal = [...historial];
            const proxima = obtenerProximaFechaPagoConHistorial(selectedTanda, historialLocal);

            return (
              <div className="space-y-1">
                {yaPagoEstaSemana(selectedTanda) && (
                  <p className="text-green-700 font-semibold">
                    ✅ Ya realizaste tu pago esta semana.
                  </p>
                )}

                {proxima?.fechaPago ? (
                  <p>
                    <strong>Siguiente pago programado:</strong> {convertirFechaLocal(proxima.fechaPago)}
                  </p>
                ) : (
                  <p className="text-green-600 font-bold">
                    <FaRegCheckCircle className="inline-block mr-1" /> ✅ ¡Estás al día! No hay pagos pendientes.
                  </p>
                )}
              </div>
            );
          })()}

        </div>


          {/* 🧾 Resumen de pago formal */}
          <div className="mt-4 border-t pt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Resumen de pago</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 font-medium">Subtotal:</td>
                  <td>${selectedTanda.monto.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Penalización:</td>
                  <td className={estaAtrasado(selectedTanda) ? "text-red-600 font-semibold" : "text-gray-500"}>
                    {estaAtrasado(selectedTanda) ? "$80.00" : "$0.00"}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 font-bold">Total a pagar:</td>
                  <td className="font-bold text-green-600">
                    ${(selectedTanda.monto + (estaAtrasado(selectedTanda) ? 80 : 0)).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-5">
        <label className="text-lg text-gray-800">Subir comprobante:</label>
        <input type="file" onChange={handleArchivoChange} className="p-2 border rounded-md mt-2" />
        <button
          onClick={handleRegistrarPago}
          disabled={enviandoPago}
          className={`py-2 px-4 rounded-md mt-3 transition ${
            enviandoPago
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {enviandoPago ? "Verificando..." : "Confirmar Pago"}
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl text-gray-800 font-semibold mb-2">Historial de Pagos</h3>
        {Array.isArray(historial) && historial.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
          {historial.map((pago) => (
            <li key={pago._id}>
              <div>
                <FaRegFileAlt className="inline-block mr-1" /> 📅 {new Date(pago.fechaPago || pago.fecha).toLocaleDateString("es-MX")} - 
                💰 <strong>${pago.monto}</strong> - 
                🏷️ <em className={pago.estado === "Aprobado" ? "text-green-600" : "text-yellow-600"}>
                  {pago.estado}
                </em>
        
                {pago.atraso && (
                  <span className="text-red-600 font-semibold ml-2">
                    (Con penalización de ${pago.comision || 80})
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>        
        ) : (
          <p className="text-gray-600">Aún no has registrado pagos en esta cuenta.</p>
        )}
      </div>

      <Link to="/" className="mt-5 py-2 px-4 bg-blue-600 text-white rounded-md inline-block hover:bg-blue-700 transition">
        Regresar
      </Link>
    </div>
  );
};

export default Pagos;
