import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faMapMarkedAlt, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import '../styles/Footer.css';
import axios from 'axios';

const Footer = () => {
  const [contactData, setContactData] = useState({
    direccion: '',
    correo: '',
    telefono: '',
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [latestPolicies, setLatestPolicies] = useState([]);
  const [latestTerms, setLatestTerms] = useState([]);
  const [latestDisclaimer, setLatestDisclaimer] = useState(null);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch('https://backendgias.onrender.com/api/contact/contact-info');
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        const data = await response.json();
        setContactData(data);
      } catch (error) {
        console.error('Error al cargar los datos de contacto:', error);
      }
    };
    fetchContactData();
  }, []);

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

  useEffect(() => {
    const fetchLatestPolicies = async () => {
      try {
        const response = await axios.get('https://backendgias.onrender.com/api/policies');
        const latestPolicy = response.data.reduce((prev, current) => (prev.version > current.version ? prev : current));
        setLatestPolicies([latestPolicy]);
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    };
    fetchLatestPolicies();
  }, []);

  useEffect(() => {
    const fetchLatestTerms = async () => {
      try {
        const response = await axios.get('https://backendgias.onrender.com/api/terms');
        const latestTerm = response.data.reduce((prev, current) => (prev.version > current.version ? prev : current));
        setLatestTerms([latestTerm]);
      } catch (error) {
        console.error('Error fetching terms:', error);
      }
    };
    fetchLatestTerms();
  }, []);

  useEffect(() => {
    const fetchLatestDisclaimer = async () => {
      try {
        const response = await axios.get('https://backendgias.onrender.com/api/legal-boundaries');
        const latestDisclaimer = response.data.reduce((prev, current) => (prev.version > current.version ? prev : current));
        setLatestDisclaimer(latestDisclaimer);
      } catch (error) {
        console.error('Error fetching disclaimer version:', error);
      }
    };
    fetchLatestDisclaimer();
  }, []);

  return (
    <footer className="footer">
      <div className="container">
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
                <FontAwesomeIcon
                  icon={
                    link.platform === 'Facebook'
                      ? faFacebookF
                      : link.platform === 'Instagram'
                      ? faInstagram
                      : link.platform === 'WhatsApp'
                      ? faWhatsapp
                      : null
                  }
                />
                {link.platform}
              </a>
            ))}
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Contenedor para la sección de enlaces legales */}
        <div className="legal-container">
          <h3>Enlaces Legales</h3>
          <ul>
            {latestPolicies.map(policy => (
              <li key={policy._id}>
                <Link to={`/politicas/${policy._id}`}>{policy.title}</Link>
              </li>
            ))}
            {latestTerms.map(term => (
              <li key={term._id}>
                <Link to={`/terminos/${term._id}`}>{term.title}</Link>
              </li>
            ))}
            {latestDisclaimer && (
              <li key={latestDisclaimer._id}>
                <Link to={`/deslinde/${latestDisclaimer._id}`}>{latestDisclaimer.title}</Link>
              </li>
            )}
          </ul>
        </div>

        <hr className="footer-divider" />

        {/* Datos de contacto */}
        <div className="contact-info">
          <h3>Datos de Contacto:</h3>
          <p>
            <FontAwesomeIcon icon={faMapMarkedAlt} /> Dirección: {contactData.direccion || 'Cargando...'}
          </p>
          <p>
            <FontAwesomeIcon icon={faEnvelope} /> Correo Electrónico: {contactData.correo || 'Cargando...'}
          </p>
          <p>
            <FontAwesomeIcon icon={faPhone} /> Número de Teléfono: {contactData.telefono || 'Cargando...'}
          </p>
        </div>

        
      </div>
    </footer>
  );
};

export default Footer;
