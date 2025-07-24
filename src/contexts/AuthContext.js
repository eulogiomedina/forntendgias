import React, { createContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const INACTIVITY_MINUTES = 30;
const INACTIVITY_MS = INACTIVITY_MINUTES * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmpleado, setIsEmpleado] = useState(false);
  const inactivityTimeout = useRef();
  const navigate = useNavigate();

  // ⏰ Timer de inactividad
  const resetInactivityTimer = () => {
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    inactivityTimeout.current = setTimeout(() => {
      logout(); // Solo logout después de 30 min sin actividad
    }, INACTIVITY_MS);
    localStorage.setItem('lastActivity', Date.now());
  };

  // Cargar sesión al iniciar (si está guardada)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setIsAuthenticated(true);
      setIsAdmin(user.role === 'admin');
      setIsEmpleado(user.role === 'empleado');
      resetInactivityTimer();
    }
  }, []);

  // Reset timer si hay interacción
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

  // Logout manual o por timeout
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsEmpleado(false);
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    navigate("/login");
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
