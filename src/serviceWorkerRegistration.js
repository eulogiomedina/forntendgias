// src/serviceWorkerRegistration.js
export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("✅ Service Worker registrado:", registration);
        })
        .catch((error) => {
          console.error("❌ Error al registrar el Service Worker:", error);
        });
    });
  }
}
