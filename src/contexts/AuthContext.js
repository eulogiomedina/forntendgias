import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmpleado, setIsEmpleado] = useState(false); // 👈 NUEVA LINEA

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setIsAuthenticated(true);
      setIsAdmin(user.role === 'admin');
      setIsEmpleado(user.role === 'empleado'); // 👈 NUEVA LINEA
    }
  }, []);

  const login = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
    setIsAdmin(user.role === 'admin');
    setIsEmpleado(user.role === 'empleado'); // 👈 NUEVA LINEA
  };

  const logout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsEmpleado(false); // 👈 NUEVA LINEA
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isEmpleado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
