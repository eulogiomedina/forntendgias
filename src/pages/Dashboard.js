// src/pages/Dashboard.js
import React, { useState, useEffect, useRef } from "react";
import AhorroSelector from "./AhorroSelector";
import ResumenAhorro from "./ResumenAhorro";
import API_URL from "../apiConfig";
import { Link } from "react-router-dom";
import { openDB } from "idb"; // 💾 Librería para usar IndexedDB

const Dashboard = () => {
  const [ahorroSeleccionado, setAhorroSeleccionado] = useState(null);
  const [credencial, setCredencial] = useState(null);
  const [facebook, setFacebook] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [userId, setUserId] = useState(null);
  const [historialAhorros, setHistorialAhorros] = useState([]);
  const [fotoPersona, setFotoPersona] = useState(null);
  const [numeros, setNumeros] = useState(1);
  const [mensajePuntos, setMensajePuntos] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [vistaCamara, setVistaCamara] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 💾 Inicializar la base de datos local
  const initDB = async () => {
    return openDB("gias-ahorros-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("ahorrosPendientes")) {
          db.createObjectStore("ahorrosPendientes", { keyPath: "id", autoIncrement: true });
        }
      },
    });
  };

  // 💾 Guardar datos (incluyendo imágenes) en IndexedDB
  const guardarAhorroLocal = async (data) => {
    const db = await initDB();
    await db.add("ahorrosPendientes", data);
    console.log("✅ Ahorro guardado localmente en IndexedDB:", data);
  };

  // ☁️ Sincronizar los ahorros pendientes cuando vuelva la conexión
  const sincronizarAhorros = async () => {
    const db = await initDB();
    const pendientes = await db.getAll("ahorrosPendientes");
    if (pendientes.length === 0) return;

    for (const p of pendientes) {
      try {
        const fd = new FormData();
        fd.append("userId", p.userId);
        fd.append("monto", p.monto);
        fd.append("tipo", p.tipo);
        fd.append("numeros", p.numeros);
        fd.append("facebook", p.facebook);
        if (p.credencial) fd.append("credencial", p.credencial);
        if (p.fotoPersona) fd.append("fotoPersona", p.fotoPersona);

        const res = await fetch(`${API_URL}/api/ahorros-usuarios`, {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          await db.delete("ahorrosPendientes", p.id);
          enviarNotificacionLocal(
            "☁️ Sincronización completada",
            "Tu ahorro pendiente fue validado y subido correctamente."
          );
          console.log("✅ Sincronizado:", p);
        } else {
          console.warn("⚠️ Error al sincronizar:", await res.text());
        }
      } catch (err) {
        console.error("❌ Error en sincronización:", err);
      }
    }
  };

  // 🧭 Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.id) {
      setUserId(storedUser.id);
      fetch(`${API_URL}/api/ahorros-usuarios/${storedUser.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("No se encontraron ahorros.");
          return res.json();
        })
        .then((data) => {
          setHistorialAhorros(data);
        })
        .catch((err) => console.error("Error al obtener historial:", err));
    }
  }, []);

  useEffect(() => {
    // Solicitar permiso de notificaciones al cargar el Dashboard
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // 🔒 Bloquear scroll del fondo cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = mostrarModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mostrarModal]);

  // ☁️ Sincronizar ahorros pendientes al recuperar Internet
  // ☁️ Sincronizar automáticamente cuando vuelva la conexión
  useEffect(() => {
    if (isOnline) sincronizarAhorros();
  }, [isOnline]);

  const handleAgregarOtro = () => {
    setMostrarSelector(true);
  };

  const handleSelectAhorro = (plan) => {
    setAhorroSeleccionado(plan);
    setMostrarSelector(false);
    setMostrarConfirmacion(true);
  };

  function esFacebookPerfil(link) {
    const regex = /^https:\/\/(www\.)?facebook\.com\/(?!pages|groups|events|marketplace)[A-Za-z0-9.\-]+\/?$/i;
    return regex.test(link);
  }

  const handleFotoPersonaChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("No se seleccionó ninguna foto.");
      return;
    }
    const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedFormats.includes(file.type)) {
      alert("Formato no válido. Solo se permiten JPG, JPEG y PNG.");
      return;
    }
    setFotoPersona(file);
  };

  const confirmarSeleccion = () => {
    setMostrarConfirmacion(false);
    setMostrarModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("No se seleccionó ningún archivo.");
      return;
    }
    const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedFormats.includes(file.type)) {
      alert("Formato no válido. Solo se permiten JPG, JPEG y PNG.");
      return;
    }
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. El tamaño máximo es 2MB.");
      return;
    }
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 300 || img.height < 200) {
        alert("La imagen es demasiado pequeña. Debe ser al menos 300x200 píxeles.");
        return;
      }
      setCredencial(file);
    };
  };
  
  // Activar cámara
  const iniciarCamara = async () => {
    setVistaCamara(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert("Error al acceder a la cámara: " + error.message);
    }
  };

  // Capturar foto desde video y asignar a FormData
  const capturarFoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], "fotoPersona.png", { type: "image/png" });
      setFotoPersona(file);

      enviarNotificacionLocal(
        "📸 Foto capturada",
        "Tu imagen ha sido tomada correctamente y será enviada al registrarte."
      );
      setVistaCamara(false);

      // Apagar la cámara para liberar memoria
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    });
  };

  const apagarCamara = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      video.srcObject = null;
    }
  };

  // Notificación local
  const enviarNotificacionLocal = (titulo, mensaje) => {
    if (Notification.permission === "granted") {
      new Notification(titulo, { body: mensaje, icon: "/logo192.png" });
    } else {
      Notification.requestPermission().then((permiso) => {
        if (permiso === "granted") {
          new Notification(titulo, { body: mensaje, icon: "/logo192.png" });
        }
      });
    }
  };

  // 🧠 Guardado con validación diferida
  const handleSubmit = async () => {
    // 🧩 Validaciones básicas
    if (historialAhorros.length === 0 && !credencial) {
      alert("Por favor, sube una foto de tu credencial.");
      return;
    }
    if (!userId) {
      alert("Error: No se encontró el usuario logueado.");
      return;
    }
    if (!ahorroSeleccionado) {
      alert("Debes seleccionar un tipo de ahorro.");
      return;
    }

    // 🟩 Solo pedir foto y Facebook si es el primer ahorro
    if (historialAhorros.length === 0) {
      if (!fotoPersona) {
        alert("Debes subir una foto tuya con cabello recogido.");
        return;
      }
      if (!facebook) {
        alert("Debes ingresar el enlace de tu perfil de Facebook.");
        return;
      }
      if (!esFacebookPerfil(facebook)) {
        alert("Por favor, ingresa un enlace de perfil de Facebook válido.");
        return;
      }
    }

    // 🧮 Extraer monto y tipo del plan seleccionado
    const [montoStr, tipo] = ahorroSeleccionado.split(" ");
    const monto = parseFloat(montoStr);

    if (isNaN(monto)) {
      alert("Error: El monto no es un número válido.");
      return;
    }

    // 💾 Si no hay conexión, guardar localmente
    if (!isOnline) {
      const ahorroLocal = {
        userId,
        monto,
        tipo,
        numeros,
        facebook,
        credencial,
        fotoPersona,
        fechaLocal: new Date().toISOString(),
        estado: "pendiente_validacion",
      };
      await guardarAhorroLocal(ahorroLocal);

      enviarNotificacionLocal(
        "💾 Ahorro registrado localmente",
        "Tu ahorro será validado y subido automáticamente cuando vuelvas a tener conexión."
      );

      alert("✅ Ahorro guardado localmente. Se sincronizará al reconectarte.");
      setMostrarModal(false);
      return;
    }

    // ☁️ Si hay conexión, enviar al servidor
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("monto", monto);
      formData.append("tipo", tipo);

      // Solo enviar credencial, selfie y Facebook si es el primer ahorro
      if (historialAhorros.length === 0) {
        formData.append("credencial", credencial);
        formData.append("fotoPersona", fotoPersona);
        formData.append("facebook", facebook);
      }

      formData.append("numeros", numeros);

      // 📤 Registrar ahorro
      const response = await fetch(`${API_URL}/api/ahorros-usuarios`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error al guardar el ahorro.");

      alert("Ahorro registrado exitosamente.");
      enviarNotificacionLocal(
        "✅ Registro confirmado",
        "Tu foto fue subida y el ahorro quedó registrado."
      );

      // 🟩 Registrar en la tanda
      try {
        const tandaResponse = await fetch(`${API_URL}/api/tandas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            monto,
            tipo,
          }),
        });

        const tandaResult = await tandaResponse.json();
        if (!tandaResponse.ok) {
          throw new Error(tandaResult.message || "Error al registrar en la tanda.");
        }

        console.log("✅ Tanda registrada/unida:", tandaResult);
      } catch (tandaError) {
        console.error("❌ Error al registrar la tanda:", tandaError);
      }

      // 🎯 Actualizar puntos
      try {
        const puntosRes = await fetch(`${API_URL}/api/puntos/total/${userId}`);
        const puntosData = await puntosRes.json();
        const totalActual = puntosData.totalPuntos || 0;
        setMensajePuntos(`🎉 ¡Felicidades! Has acumulado 20 puntos.`);
      } catch (err) {
        console.error("⚠️ No se pudo mostrar los puntos acumulados:", err);
      }

      // 🔄 Resetear estado
      setMostrarModal(false);
      setHistorialAhorros((prev) => [...prev, ...result.nuevosAhorros]);
      setAhorroSeleccionado(null);
      setCredencial(null);
      setFacebook("");
    } catch (error) {
      console.error("❌ Error al guardar el ahorro:", error);
      alert(`Hubo un error al guardar el ahorro: ${error.message}`);
    }
  };

  // 🧱 Render UI principal
  return (
  <div className="p-5 max-w-[600px] mt-[110px] mx-auto bg-white shadow-lg rounded-[12px] relative text-center">
    {!isOnline && (
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded p-2 mb-3 text-sm animate-pulse">
        ⚠️ Estás sin conexión. Tu ahorro se registrará localmente y será validado al reconectarte.
      </div>
    )}

    <h1 className="text-center text-2xl font-semibold text-[#0F2B45] mb-1">Bienvenido al Dashboard</h1>
    <p className="text-gray-600 mb-4">Esta es la página principal para el usuario ya logueado.</p>

    {historialAhorros.length > 0 ? (
      <>
        <ResumenAhorro ahorros={historialAhorros} setAhorroSeleccionado={setAhorroSeleccionado} />
        <div className="flex flex-wrap justify-center gap-3 mt-5">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow transition-all"
            onClick={handleAgregarOtro}
          >
            ➕ Agregar otro ahorro
          </button>
          <Link to="/gestion-cuenta" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-lg shadow transition-all">
            Gestión de Cuenta
          </Link>
          <Link to="/solicitar-prestamo" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded-lg shadow transition-all">
            Solicitar préstamo
          </Link>
        </div>
      </>
    ) : (
      !mostrarSelector && <AhorroSelector onSelect={handleSelectAhorro} />
    )}

    {mostrarSelector && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-[400px] w-[90%]">
          <h3 className="text-lg font-semibold mb-4">Selecciona el tipo de ahorro</h3>
          <AhorroSelector onSelect={handleSelectAhorro} />
          <button 
            className="mt-5 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            onClick={() => setMostrarSelector(false)}
          >
            Cancelar
          </button>
        </div>
      </div>
    )}

    {mostrarConfirmacion && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-[400px] w-[90%]">
          <h3 className="text-lg font-semibold mb-3">Confirmar selección</h3>
          <p className="text-base text-blue-600 font-semibold mb-4">
            Estás seleccionando el plan de ahorro de <strong>{ahorroSeleccionado}</strong>. ¿Deseas continuar?
          </p>
          <div className="flex gap-3">
            <button 
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              onClick={confirmarSeleccion}
            >
              Sí, continuar
            </button>
            <button 
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              onClick={() => setMostrarConfirmacion(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

    {mostrarModal && (
      <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-start overflow-y-auto py-10">
        <div className="w-[92%] max-w-md bg-white rounded-xl shadow-2xl p-5 relative animate-fadeIn">
          <h3 className="text-lg font-semibold mb-3 text-[#0F2B45]">
            Información adicional para el ahorro
          </h3>
          <p className="text-base text-blue-600 font-semibold mb-4">
            Has seleccionado: <strong>{ahorroSeleccionado}</strong>
          </p>

          <div className="overflow-y-auto max-h-[70vh] pr-1">
            {historialAhorros.length === 0 && (
              <>
                {/* Credencial */}
                <label className="block mt-3 mb-2 font-bold text-gray-700">
                  Sube una foto de tu credencial de lector:
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300"
                />

                {/* Selfie */}
                <label className="block mb-2 font-bold text-gray-700">
                  Foto tuya con cabello recogido:
                </label>
                <div className="flex flex-col sm:flex-row gap-3 mb-4 justify-center">
                  <button
                    type="button"
                    onClick={iniciarCamara}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg w-full sm:w-auto transition"
                  >
                    📷 Tomar con cámara
                  </button>
                  <label className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg cursor-pointer w-full sm:w-auto transition">
                    📁 Subir desde dispositivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoPersonaChange}
                      className="hidden"
                      capture="environment"
                    />
                  </label>
                </div>

                {vistaCamara && (
                  <div className="mb-4 bg-gray-50 border rounded-lg p-3">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-h-72 rounded-lg border object-contain" />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={capturarFoto}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                      >
                        ✅ Capturar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setVistaCamara(false); apagarCamara(); }}
                        className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                      >
                        ✖ Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {fotoPersona && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      Archivo seleccionado: <b>{fotoPersona.name}</b>
                    </p>
                    <img
                      src={URL.createObjectURL(fotoPersona)}
                      alt="preview"
                      className="mt-2 w-full max-h-64 rounded-lg border object-cover"
                      onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                    />
                  </div>
                )}

                {/* Facebook */}
                <label className="block mt-4 mb-2 font-bold text-gray-700">
                  Enlace de tu perfil de Facebook:
                </label>
                <input
                  type="text"
                  placeholder="https://facebook.com/tu-perfil"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300"
                />
                {facebook && !esFacebookPerfil(facebook) && (
                  <p className="text-red-500 text-xs mt-1">
                    Ingresa un link válido, ej: https://facebook.com/tu.usuario
                  </p>
                )}
              </>
            )}
          </div>

          {/* Botonera */}
          <div className="sticky bottom-0 bg-white pt-3 mt-4 border-t flex gap-2">
            <button 
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              onClick={handleSubmit}
            >
              Confirmar
            </button>
            <button 
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              onClick={() => { 
                setMostrarModal(false); 
                setVistaCamara(false); 
                apagarCamara(); 
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

    {mensajePuntos && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-[350px] w-[90%]">
          <h3 className="text-xl font-bold text-green-600 mb-3">✅ Registro exitoso</h3>
          <p className="text-gray-700 mb-4">{mensajePuntos}</p>
          <button
            onClick={() => setMensajePuntos(null)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            ¡Genial!
          </button>
        </div>
      </div>
    )}
  </div>
);
};

export default Dashboard;
