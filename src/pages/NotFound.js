import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import errorImage400 from '../assets/400Error.jpg';
import errorImage401 from '../assets/401Error.jpg';
import errorImage403 from '../assets/403Error.jpg';
import errorImage404 from '../assets/404Error.jpg';
import errorImage500 from '../assets/500Error.jpg';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener el código de error desde location.state
  const { errorCode } = location.state || {};
  const actualErrorCode = errorCode || 404;

  // Recuperar la página de origen desde sessionStorage
  const previousPath = sessionStorage.getItem('previousPath');

  console.log(`Código de error: ${actualErrorCode}`);
  console.log(`Página de origen guardada en sessionStorage: ${previousPath || 'No disponible'}`);

  let errorMessage;
  let errorImageSrc;
  let actionButton;

  // Si el error no es 500, eliminamos la URL almacenada
  useEffect(() => {
    if (actualErrorCode !== 500) {
      sessionStorage.removeItem('previousPath');
    }
  }, [actualErrorCode]);

  switch (actualErrorCode) {
    case 400:
      errorMessage = 'Hubo un problema con la solicitud. Por favor, revisa la información e intenta nuevamente.';
      errorImageSrc = errorImage400;
      actionButton = (
        <button
          onClick={() => {
            if (previousPath && previousPath !== "/error") {
              console.log("Redirigiendo a la página anterior para corregir el error:", previousPath);
              navigate(previousPath);
            } else {
              console.log("No se encontró página de origen válida. Volviendo al inicio.");
              navigate('/');
            }
          }}
          className="bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Intentar de Nuevo
        </button>
      );
      break;

    case 401:
      errorMessage = 'No tienes permisos para acceder a esta página. Por favor, inicia sesión.';
      errorImageSrc = errorImage401;
      actionButton = <button onClick={() => navigate('/login')} className="bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700">Ir a inicio de sesión</button>;
      break;

    case 403:
      errorMessage = 'Tu cuenta no tiene permisos suficientes para acceder a esta página.';
      errorImageSrc = errorImage403;
      actionButton = <button onClick={() => navigate('/')} className="bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700">Volver al inicio</button>;
      break;

    case 404:
      errorMessage = 'Lo sentimos, no pudimos encontrar la página que buscas.';
      errorImageSrc = errorImage404;
      actionButton = <button onClick={() => navigate('/')} className="bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700">Volver al inicio</button>;
      break;

    case 500:
      errorMessage = 'Lo sentimos, ha ocurrido un error interno en el servidor.';
      errorImageSrc = errorImage500;
      actionButton = (
        <button
          onClick={() => {
            if (previousPath && previousPath !== "/error") {
              console.log("Redirigiendo a la página de origen:", previousPath);
              navigate(previousPath);
            } else {
              console.log("No se encontró página de origen válida. Recargando la página actual.");
              window.location.reload();
            }
          }}
          className="bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Reintentar
        </button>
      );
      break;

    default:
      errorMessage = 'Hubo un error inesperado. Por favor, intenta más tarde.';
      errorImageSrc = errorImage500;
      actionButton = <button onClick={() => navigate('/')} className="bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700">Volver al inicio</button>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <img src={errorImageSrc} alt={`Error ${actualErrorCode}`} className="max-w-xs mb-4 rounded-lg shadow-lg" />
      <h1 className="text-4xl text-red-600 mb-4">Error {actualErrorCode}</h1>
      <p className="text-xl text-gray-700 mb-4">{errorMessage}</p>
      {actionButton}
    </main>
  );
};

export default NotFound;
