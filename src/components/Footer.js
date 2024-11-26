import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import '../styles/Footer.css'; // Asegúrate de ajustar el CSS según el diseño
import axios from 'axios';

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [latestPolicies, setLatestPolicies] = useState([]);
  const [latestTerms, setLatestTerms] = useState([]);
  const [latestDisclaimer, setLatestDisclaimer] = useState(null); // Estado para la última versión del deslinde

  // Efecto para obtener las redes sociales activas
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await axios.get('https://backendgias.onrender.com/api/social-links');
        const activeLinks = response.data.filter(link => link.status === 'active');
        setSocialLinks(activeLinks);
      } catch (error) {
        console.error('Error fetching social links:', error);
      }
    };

    fetchSocialLinks();
  }, []);

  // Efecto para obtener la última política
  useEffect(() => {
    const fetchLatestPolicies = async () => {
      try {
        const response = await axios.get('https://backendgias.onrender.com/api/policies');
        const latestPolicy = response.data.reduce((prev, current) => {
          return (prev.version > current.version) ? prev : current;
        });
        setLatestPolicies([latestPolicy]); // Solo guardamos la última política
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    };

    fetchLatestPolicies();
  }, []);

  // Efecto para obtener el último término
  useEffect(() => {
    const fetchLatestTerms = async () => {
      try {
        const response = await axios.get('https://backendgias.onrender.com/api/terms');
        const latestTerm = response.data.reduce((prev, current) => {
          return (prev.version > current.version) ? prev : current;
        });
        setLatestTerms([latestTerm]); // Solo guardamos el último término
      } catch (error) {
        console.error('Error fetching terms:', error);
      }
    };

    fetchLatestTerms();
  }, []);

  // Efecto para obtener la última versión del deslinde
  useEffect(() => {
    const fetchLatestDisclaimer = async () => {
      try {
        const response = await axios.get('https://backendgias.onrender.com/api/legal-boundaries'); // Cambiar aquí
        const latestDisclaimer = response.data.reduce((prev, current) => {
          return (prev.version > current.version) ? prev : current;
        });
        setLatestDisclaimer(latestDisclaimer); // Guardamos la última versión del deslinde
      } catch (error) {
        console.error('Error fetching disclaimer version:', error);
      }
    };

    fetchLatestDisclaimer();
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-rights">© 2024 GIAS. Todos los derechos reservados.</p>

        <div className="footer-content">
          {/* Contenedor para la sección de redes sociales */}
          <div className="social-container">
            <h3>Nuestras Redes:</h3>
            <div className="social-icons">
              {socialLinks.map(link => (
                <a 
                  key={link._id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={link.platform}
                >
                  <FontAwesomeIcon icon={
                    link.platform === 'Facebook' ? faFacebookF :
                    link.platform === 'Instagram' ? faInstagram :
                    link.platform === 'WhatsApp' ? faWhatsapp : null
                  } />
                  {link.platform}
                </a>
              ))}
            </div>
          </div>

          {/* Contenedor para la sección de enlaces legales */}
          <div className="legal-container">
            <h3>Enlaces Legales</h3>
            <ul>
              {latestPolicies.map(policy => (
                <li key={policy._id}>
                  <Link to={`/politicas/${policy._id}`}>
                    {policy.title} 
                  </Link>
                </li>
              ))}
              {latestTerms.map(term => (
                <li key={term._id}>
                  <Link to={`/terminos/${term._id}`}>
                    {term.title} 
                  </Link>
                </li>
              ))}
              {/* Añadir la última versión del deslinde */}
              {latestDisclaimer && (
                <li key={latestDisclaimer._id}>
                  <Link to={`/deslinde/${latestDisclaimer._id}`}>
                    {latestDisclaimer.title}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
