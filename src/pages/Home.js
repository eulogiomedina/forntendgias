import { useState, useEffect } from "react";
import CarouselOportunidades from "../components/CarouselOportunidades";
import { Link } from "react-router-dom"; // Para navegación interna
import axios from "axios"; // Para obtener datos dinámicos del backend
import API_URL from '../apiConfig';

const Home = () => {
  const [latestPolicies, setLatestPolicies] = useState([]);
  const [latestTerms, setLatestTerms] = useState([]);
  const [latestDisclaimer, setLatestDisclaimer] = useState(null);

  // Obtener la última versión de Políticas de Privacidad
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

  // Obtener la última versión de Términos y Condiciones
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

  // Obtener la última versión del Deslinde
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
    <div className="max-w-full mx-auto p-6 mt-28">
      <h1 className="text-4xl text-blue-800 font-bold mb-6">Bienvenido a GIAS</h1>
      <CarouselOportunidades />

      <div className="flex flex-wrap justify-center gap-6 mt-12">
        {/* Info Block 1 */}
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg w-full sm:w-1/2 lg:w-1/3">
          <h2 className="text-xl font-semibold mb-4">Pagos Desde</h2>
          <ul>
            <li>$334 - $1,000 SEMANAL</li>
            <li>$2,500 - $3,400 MENSUAL</li>
          </ul>
        </div>

        {/* Info Block 2 */}
        <div className="bg-blue-800 text-white p-6 rounded-lg shadow-lg w-full sm:w-1/2 lg:w-1/3">
          <h2 className="text-xl font-semibold mb-4">Recibe</h2>
          <ul>
            <li>$10,000 mil</li>
            <li>$30,000 mil</li>
            <li>$40,000 mil</li>
            <li>$50,000 mil</li>
          </ul>
        </div>

        {/* Info Block 3 */}
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg w-full sm:w-1/2 lg:w-1/3">
          <h2 className="text-xl font-semibold mb-4">Beneficios</h2>
          <ul>
            <li>Contrato</li>
            <li>Tú eliges cuándo cobrar</li>
            <li>Recibes pagaré</li>
            <li>Préstamos individuales</li>
            <li>Bonos finales de participación</li>
            <li>Evidencias de entregas y pagos en tiempo real por grupo de WPP</li>
          </ul>
        </div>

        {/* Info Block 4 */}
        <div className="bg-blue-800 text-white p-6 rounded-lg shadow-lg w-full sm:w-1/2 lg:w-1/3">
          <h2 className="text-xl font-semibold mb-4">¿Para qué ser parte de GIAS?</h2>
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

      {/* Mapa del Sitio */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-12">
        <h2 className="text-2xl font-semibold mb-4">Mapa del Sitio</h2>
        <ul className="space-y-2">
          <li><Link to="/" className="text-blue-700 font-semibold hover:underline">Inicio</Link></li>
          <li><Link to="/register" className="text-blue-700 font-semibold hover:underline">Registrarse</Link></li>
          <li><Link to="/login" className="text-blue-700 font-semibold hover:underline">Iniciar sesión</Link></li>
          <li><Link to="/forgot-password" className="text-blue-700 font-semibold hover:underline">Olvidé mi contraseña</Link></li>

          {/* Términos y Condiciones dinámicos */}
          {latestTerms.map(term => (
            <li key={term._id}>
              <Link to={`/terminos/${term._id}`} className="text-blue-700 font-semibold hover:underline">{term.title}</Link>
            </li>
          ))}

          {/* Deslinde dinámico */}
          {latestDisclaimer && (
            <li key={latestDisclaimer._id}>
              <Link to={`/deslinde/${latestDisclaimer._id}`} className="text-blue-700 font-semibold hover:underline">{latestDisclaimer.title}</Link>
            </li>
          )}

          {/* Políticas de Privacidad dinámicas */}
          {latestPolicies.map(policy => (
            <li key={policy._id}>
              <Link to={`/politicas/${policy._id}`} className="text-blue-700 font-semibold hover:underline">{policy.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
