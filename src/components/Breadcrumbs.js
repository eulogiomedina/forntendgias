import React from "react";
import { Link, useLocation } from "react-router-dom";

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

  // Obtener segmentos de la ruta
  const pathSegments = location.pathname.split("/").filter((segment) => segment);

  return (
    <nav className="flex items-center gap-1 p-2 bg-[#1e3a8a] text-white fixed top-[90px] left-0 w-full z-50 shadow-lg font-semibold">
      <ul className="flex gap-3 m-0 p-0 list-none text-sm font-semibold">
        <li>
          <Link to="/" className="text-lightGray font-semibold hover:text-teal-200 transition-all">
            Inicio
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          // Si el segmento es un ID, lo ignoramos
          if (index > 0 && /^[a-f0-9]{24}$/.test(segment)) return null;

          const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const name = routeNames[segment] || decodeURIComponent(segment);

          return (
            <li key={index} className="flex items-center">
              <Link to={url} className="text-lightGray font-semibold hover:text-teal-200 transition-all relative">
                {name}
                {index < pathSegments.length - 1 && (
                  <span className="absolute right-0 top-0 text-lightGray opacity-60"> &gt; </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
