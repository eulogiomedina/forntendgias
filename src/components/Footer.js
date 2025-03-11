import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faMapMarkedAlt, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import API_URL from '../apiConfig';
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
        const response = await fetch(`${API_URL}/api/contact/contact-info`);
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
        const response = await axios.get(`${API_URL}/api/social-links`);
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
        const response = await axios.get(`${API_URL}/api/policies`);
        const latestPolicy = response.data.reduce((prev, current) => {
          return (prev.version > current.version) ? prev : current;
        });
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
        const response = await axios.get(`${API_URL}/api/terms`);
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
        const response = await axios.get(`${API_URL}/api/legal-boundaries`);
        const latestDisclaimer = response.data.reduce((prev, current) => (prev.version > current.version ? prev : current));
        setLatestDisclaimer(latestDisclaimer);
      } catch (error) {
        console.error('Error fetching disclaimer version:', error);
      }
    };
    fetchLatestDisclaimer();
  }, []);

  return (
    <footer className="bg-blue-800 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        {/* Redes Sociales */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Nuestras Redes:</h3>
          <div className="flex justify-center space-x-6">
            {socialLinks.map(link => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                className="text-white hover:text-gray-300"
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
                  className="text-2xl"
                />
              </a>
            ))}
          </div>
        </div>

        <hr className="border-t border-white my-6" />

        {/* Enlaces Legales */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Enlaces Legales</h3>
          <ul className="space-y-2">
            {latestPolicies.map(policy => (
              <li key={policy._id}>
                <Link to={`/politicas/${policy._id}`} className="text-white hover:text-gray-300">
                  {policy.title}
                </Link>
              </li>
            ))}
            {latestTerms.map(term => (
              <li key={term._id}>
                <Link to={`/terminos/${term._id}`} className="text-white hover:text-gray-300">
                  {term.title}
                </Link>
              </li>
            ))}
            {latestDisclaimer && (
              <li key={latestDisclaimer._id}>
                <Link to={`/deslinde/${latestDisclaimer._id}`} className="text-white hover:text-gray-300">
                  {latestDisclaimer.title}
                </Link>
              </li>
            )}
          </ul>
        </div>

        <hr className="border-t border-white my-6" />

        {/* Datos de Contacto */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Datos de Contacto:</h3>
          <p className="flex items-center justify-center space-x-2 mb-2">
            <FontAwesomeIcon icon={faMapMarkedAlt} />
            <span>{contactData.direccion || 'Cargando...'}</span>
          </p>
          <p className="flex items-center justify-center space-x-2 mb-2">
            <FontAwesomeIcon icon={faEnvelope} />
            <span>{contactData.correo || 'Cargando...'}</span>
          </p>
          <p className="flex items-center justify-center space-x-2">
            <FontAwesomeIcon icon={faPhone} />
            <span>{contactData.telefono || 'Cargando...'}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
