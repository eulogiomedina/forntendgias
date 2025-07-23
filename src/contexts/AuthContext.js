import React, { createContext, useState, useEffect, useRef } from 'react';

export const AuthContext = createContext();

const INACTIVITY_MINUTES = 30; // minutos
const INACTIVITY_MS = INACTIVITY_MINUTES * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmpleado, setIsEmpleado] = useState(false);

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

  // Cerrar sesión y limpiar
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsEmpleado(false);
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
  };

  // Login normal
  const login = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
    setIsAdmin(user.role === 'admin');
    setIsEmpleado(user.role === 'empleado');
    resetInactivityTimer();
  };

  // Limpiar sesión al cerrar pestaña (pero no al recargar)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Si es recarga, NO borres nada
      if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
        return;
      }
      logout();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    // eslint-disable-next-line
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isEmpleado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
