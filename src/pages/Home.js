import React, { useEffect, useState } from "react";
import "../styles/Home.css"; // Archivo CSS para estilos
import CarouselOportunidades from "../components/CarouselOportunidades";
import { Link } from "react-router-dom"; // Para navegación interna
import axios from "axios"; // Para obtener datos dinámicos del backend
import API_URL from '../apiConfig';

const Home = () => {
  const [latestPolicies, setLatestPolicies] = useState([]);
  const [latestTerms, setLatestTerms] = useState([]);
  const [latestDisclaimer, setLatestDisclaimer] = useState(null);

  // ✅ Obtener la última versión de Políticas de Privacidad
  useEffect(() => {
    const fetchLatestPolicies = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/policies`);
        const latestPolicy = response.data.reduce((prev, current) =>
          prev.version > current.version ? prev : current
        );
        setLatestPolicies([latestPolicy]); // Guardamos solo la última versión
      } catch (error) {
        console.error("Error fetching policies:", error);
      }
    };
    fetchLatestPolicies();
  }, []);

  // ✅ Obtener la última versión de Términos y Condiciones
  useEffect(() => {
    const fetchLatestTerms = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/terms`);
        const latestTerm = response.data.reduce((prev, current) =>
          prev.version > current.version ? prev : current
        );
        setLatestTerms([latestTerm]);
      } catch (error) {
        console.error("Error fetching terms:", error);
      }
    };
    fetchLatestTerms();
  }, []);

  // ✅ Obtener la última versión del Deslinde
  useEffect(() => {
    const fetchLatestDisclaimer = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/legal-boundaries`);
        const latestDisclaimer = response.data.reduce((prev, current) =>
          prev.version > current.version ? prev : current
        );
        setLatestDisclaimer(latestDisclaimer);
      } catch (error) {
        console.error("Error fetching disclaimer version:", error);
      }
    };
    fetchLatestDisclaimer();
  }, []);

  return (
    <div className="home-container">
      <h1 className="main-title">Bienvenido a GIAS</h1>
      <CarouselOportunidades />

      <div className="info-container">
        <div className="info-block red">
          <h2>Pagos Desde</h2>
          <ul>
            <li>$334 - $1,000 SEMANAL</li>
            <li>$2,500 - $3,400 MENSUAL</li>
          </ul>
        </div>

        <div className="info-block blue">
          <h2>Recibe</h2>
          <ul>
            <li>$10,000 mil</li>
            <li>$30,000 mil</li>
            <li>$40,000 mil</li>
            <li>$50,000 mil</li>
          </ul>
        </div>

        <div className="info-block red">
          <h2>Beneficios</h2>
          <ul>
            <li>Contrato</li>
            <li>Tú eliges cuándo cobrar</li>
            <li>Recibes pagaré</li>
            <li>Préstamos individuales</li>
            <li>Bonos finales de participación</li>
            <li>Evidencias de entregas y pagos en tiempo real por grupo de WPP</li>
          </ul>
        </div>

        <div className="info-block blue">
          <h2>¿Para qué ser parte de GIAS?</h2>
          <ul>
            <li>Ampliar tu negocio</li>
            <li>Mejorar tu salud</li>
            <li>Ahorrar de manera segura</li>
            <li>Mejoras del hogar</li>
            <li>Pagar deudas</li>
            <li>Iniciar un negocio</li>
            <li>Viajar</li>
            <li>Comprar un auto</li>
          </ul>
        </div>
      </div>

      {/* ✅ Sección de Mapa del Sitio con datos obtenidos del backend */}
      <div className="sitemap">
        <h2>Mapa del Sitio</h2>
        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/register">Registrarse</Link></li>
          <li><Link to="/login">Iniciar sesión</Link></li>
          <li><Link to="/forgot-password">Olvidé mi contraseña</Link></li>

          {/* ✅ Términos y Condiciones dinámicos */}
          {latestTerms.map(term => (
            <li key={term._id}>
              <Link to={`/terminos/${term._id}`}>{term.title}</Link>
            </li>
          ))}

          {/* ✅ Deslinde dinámico */}
          {latestDisclaimer && (
            <li key={latestDisclaimer._id}>
              <Link to={`/deslinde/${latestDisclaimer._id}`}>{latestDisclaimer.title}</Link>
            </li>
          )}

          {/* ✅ Políticas de Privacidad dinámicas */}
          {latestPolicies.map(policy => (
            <li key={policy._id}>
              <Link to={`/politicas/${policy._id}`}>{policy.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
