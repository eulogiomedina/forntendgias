import React, { createContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const INACTIVITY_MINUTES = 30; // minutos
const INACTIVITY_MS = INACTIVITY_MINUTES * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmpleado, setIsEmpleado] = useState(false);

  // 👇 Agrega esto:
  const navigate = typeof window !== "undefined" && window.location ? require('react-router-dom').useNavigate() : () => {};

  // Ref para el timer de inactividad
  const inactivityTimeout = useRef();

  // Detecta y resetea el timer de inactividad
  const resetInactivityTimer = () => {
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    inactivityTimeout.current = setTimeout(() => {
      logout();
      // Puedes mostrar un toast o redireccionar si quieres
    }, INACTIVITY_MS);

    // Guarda la última vez de actividad
    localStorage.setItem('lastActivity', Date.now());
  };

  // Efecto para inicializar sesión desde localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setIsAuthenticated(true);
      setIsAdmin(user.role === 'admin');
      setIsEmpleado(user.role === 'empleado');
      resetInactivityTimer();
    }
  }, []);

  // Efecto para escuchar actividad del usuario y reiniciar timer
  useEffect(() => {
    if (isAuthenticated) {
      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetInactivityTimer));
      return () => {
        events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
        if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      };
    }
  }, [isAuthenticated]);

  // Cerrar sesión y limpiar + redirigir
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsEmpleado(false);
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);

    // 👇 Redirecciona al login
    if (typeof window !== "undefined" && window.location) {
      window.location.href = "/login";
      // O con navigate("/login"); si el AuthProvider está DENTRO del BrowserRouter.
    }
  };

  // Login normal
  const login = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
    setIsAdmin(user.role === 'admin');
    setIsEmpleado(user.role === 'empleado');
    resetInactivityTimer();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isEmpleado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
