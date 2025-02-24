import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Breadcrumbs.css"; // Asegúrate de que este archivo existe en styles

const routeNames = {
  "": "Inicio",
  register: "Registro",
  login: "Iniciar Sesión",
  "forgot-password": "Recuperar Contraseña",
  "reset-password": "Restablecer Contraseña",
  dashboard: "Panel de Usuario",
  "admin-dashboard": "Panel de Administrador",
  profile: "Perfil",
  savings: "Ahorros",
  ayuda: "Ayuda",
  chatbot: "Chatbot",
  "policy-crud": "Políticas",
  "terms-crud": "Términos y Condiciones",
  "social-links-manager": "Redes Sociales",
  "legal-boundary-crud": "Límites Legales",
  "slogan-manager": "Slogan",
  "logo-manager": "Gestión de Logo",
  "title-admin": "Títulos",
  "contact-edit": "Editar Contacto",
  "audit-logs": "Registros de Auditoría",
  "password-change-logs": "Historial de Contraseñas",
  "blocked-accounts": "Cuentas Bloqueadas",
  terminos: "Términos y Condiciones",
  deslinde: "Deslinde",
  politicas: "Política de Privacidad",
};

const Breadcrumbs = () => {
  const location = useLocation();
  console.log("Breadcrumbs: URL actual =>", location.pathname);

  // Obtener segmentos de la ruta
  const pathSegments = location.pathname.split("/").filter((segment) => segment);

  return (
    <nav className="breadcrumbs">
      <ul>
        <li><Link to="/">Inicio</Link></li>
        {pathSegments.map((segment, index) => {
          // Si el segmento es un ID (24+ caracteres de MongoDB), lo ignoramos
          if (index > 0 && /^[a-f0-9]{24}$/.test(segment)) return null;

          const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const name = routeNames[segment] || decodeURIComponent(segment);

          return (
            <li key={index}>
              <Link to={url}>{name}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
