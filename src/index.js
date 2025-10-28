import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { register as registerServiceWorker } from './serviceWorkerRegistration'; // 👈 Importa el SW

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 👇 Aquí registras el service worker
registerServiceWorker();

// Si quieres medir performance
reportWebVitals();
