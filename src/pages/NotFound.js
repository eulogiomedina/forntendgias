import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';
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
          className="error-button"
        >
          Intentar de Nuevo
        </button>
      );
      break;

    case 401:
      errorMessage = 'No tienes permisos para acceder a esta página. Por favor, inicia sesión.';
      errorImageSrc = errorImage401;
      actionButton = <button onClick={() => navigate('/login')} className="error-button">Ir a inicio de sesión</button>;
      break;

    case 403:
      errorMessage = 'Tu cuenta no tiene permisos suficientes para acceder a esta página.';
      errorImageSrc = errorImage403;
      actionButton = <button onClick={() => navigate('/')} className="error-button">Volver al inicio</button>;
      break;

    case 404:
      errorMessage = 'Lo sentimos, no pudimos encontrar la página que buscas.';
      errorImageSrc = errorImage404;
      actionButton = <button onClick={() => navigate('/')} className="error-button">Volver al inicio</button>;
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
          className="error-button"
        >
          Reintentar
        </button>
      );
      break;

    default:
      errorMessage = 'Hubo un error inesperado. Por favor, intenta más tarde.';
      errorImageSrc = errorImage500;
      actionButton = <button onClick={() => navigate('/')} className="error-button">Volver al inicio</button>;
  }

  return (
    <main className="not-found-container">
      <img src={errorImageSrc} alt={`Error ${actualErrorCode}`} className="error-image" />
      <h1>Error {actualErrorCode}</h1>
      <p>{errorMessage}</p>
      {actionButton}
    </main>
  );
};

export default NotFound;
