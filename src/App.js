
import React, { useState,useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Proveedor de contexto de autenticación
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Savings from './pages/Savings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TermsDetail from './components/TermsDetail';
import DisclaimerDetail from './components/DisclaimerDetail';
import PolicyCrud from './components/PolicyCrud';
import PolicyViewer from './components/PolicyDetail';
import TermsCrud from './components/TermsCrud';
import SocialLinksManager from './components/SocialLinksManager';
import LegalBoundaryCrud from './components/LegalBoundaryCrud';
import SloganManager from './components/SloganAdmin';
import LogoManager from './components/LogoAdmin';
import TitleAdmin from './components/TitleAdmin';
import ContactEdit from './components/ContactEdit';
import AuditLogs from './components/AuditLogs';
import PasswordChangeLogs from './components/PasswordChangeLogs';
import PrivateRoute from './components/PrivateRoute';
import BlockedAccounts from './components/BlockedAccounts';
import NotFound from './pages/NotFound';
import AxiosInterceptor from './pages/AxiosInterceptor'; // Importa el nuevo componente
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatbotPage from "./components/Chatbot";
import Help from "./pages/Help";
import Breadcrumbs from "./components/Breadcrumbs"; // Importamos las migas de pan
import AdminSidebar from './components/AdminSidebar';
import UserManagement from './pages/UserManagement';
import GestionAhorros from './pages/GestionAhorros';
import PerfilCliente from './pages/PerfilCliente';
import GestionCuenta from './pages/GestionCuenta';
import Pagos from "./pages/Pagos";
import AdminCuentaDestino from "./pages/AdminCuentaDestino";
import GestionPagos from "./pages/GestionPagos"; 
import EmpleadoDashboard from './pages/EmpleadoDashboard';
import GestionAhorrosEmpleado from './pages/GestionAhorrosEmpleado';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PagosEmpleado from './pages/PagosEmpleado';
import UsersDirectory from './pages/UsersDirectory';
import PagoExitoso from "./pages/PagoExitoso";
import SolicitudPrestamoForm from "./pages/SolicitudPrestamoForm";
import SolicitudesPrestamoAdmin from './pages/SolicitudesPrestamoAdmin';
import GamificacionDashboard from "./pages/GamificacionDashboard";
import PuntosDashboard from "./pages/PuntosDashboard";
// 🔥 Monitoreo de errores Frontend (SLO ≤ 1%)
window.onerror = function (message, source, lineno, colno, error) {
  console.log("🚨 Error capturado en frontend:");
  console.log("📄 Mensaje:", message);
  console.log("📁 Archivo:", source);
  console.log("🔢 Línea:", lineno, "Columna:", colno);
  console.log("🛑 Detalle del error:", error?.stack || error);
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [internetStatus, setInternetStatus] = useState(null);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // ✅ Solicitar permiso de notificaciones AUTOMÁTICAMENTE al primer clic
  useEffect(() => {
    const solicitarPermisoConInteraccion = () => {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then((resultado) => {
          console.log("🔔 Permiso de notificaciones:", resultado);
        });
      }

      // eliminar tras el primer intento
      document.removeEventListener("click", solicitarPermisoConInteraccion);
    };

    document.addEventListener("click", solicitarPermisoConInteraccion);

    return () =>
      document.removeEventListener("click", solicitarPermisoConInteraccion);
  }, []);

  // ✅ Notificaciones al perder/conectar Internet
  useEffect(() => {
    const notifySW = async (status) => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;

        if (registration.active) {
          registration.active.postMessage({
            type: "NOTIFY_STATUS",
            status, // "online" o "offline"
          });
        }
      }
    };

    const handleOnline = () => {
      setInternetStatus("online");
      notifySW("online");
      setTimeout(() => setInternetStatus(null), 3000);
    };

    const handleOffline = () => {
      setInternetStatus("offline");
      notifySW("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);



    return (
        <AuthProvider>
            <Router>
            <AxiosInterceptor>
                <div className="App">
                    {/* ✅ Banner siempre primero */}
                    {internetStatus === "offline" && (
                        <div className="bg-red-600 text-white text-center font-semibold py-2 shadow-md fixed z-[9999] top-0 w-full">
                            ⚠️ Sin conexión — estás trabajando offline
                        </div>
                    )}

                    {internetStatus === "online" && (
                        <div className="bg-green-600 text-white text-center font-semibold py-2 shadow-md fixed z-[9999] top-0 w-full animate-fade-out">
                            ✅ Conexión restaurada — datos sincronizados
                        </div>
                    )}

                    {/* ✅ Header baja cuando hay banner */}
                    <Header
                        toggleDarkMode={toggleDarkMode}
                        isDarkMode={isDarkMode}
                        extraOffset={internetStatus ? 40 : 0}  // Enviamos un prop para moverlo
                    />


                    <div className="breadcrumbs-container">
                        <Breadcrumbs />
                    </div>

                    <ToastContainer position="top-right" autoClose={5000} />
                    <main style={{ paddingTop: "80px" }}>
                        <Routes>
                            {/* Rutas públicas */}
                            <Route path="/" element={<Home />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/terminos/:id" element={<TermsDetail />} />
                            <Route path="/deslinde/:id" element={<DisclaimerDetail />} />
                            <Route path="/politicas/:id" element={<PolicyViewer />} />

                            {/* Rutas protegidas para usuarios autenticados */}
                            <Route
                                path="/profile"
                                element={
                                    <PrivateRoute allowedRoles={['user', 'admin']}>
                                        <Profile />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/savings"
                                element={
                                    <PrivateRoute allowedRoles={['user', 'admin']}>
                                        <Savings />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <PrivateRoute allowedRoles={['user']}>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />

                            {/* Rutas protegidas para administradores */}
                            <Route
                                path="/admin-dashboard"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <AdminDashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/policy-crud"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <PolicyCrud />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/terms-crud"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <TermsCrud />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/social-links-manager"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <SocialLinksManager />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/legal-boundary-crud"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <LegalBoundaryCrud />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/slogan-manager"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <SloganManager />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/logo-manager"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <LogoManager />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/title-admin"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <TitleAdmin />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/contact-edit"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <ContactEdit />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/audit-logs"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <AuditLogs />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/password-change-logs"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <PasswordChangeLogs />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin-dashboard/blocked-accounts"
                                element={
                                    <PrivateRoute allowedRoles={['admin']}>
                                        <BlockedAccounts />
                                    </PrivateRoute>
                                }
                            />
                            <Route path="*" element={<NotFound />} />
                            <Route path="/error" element={<NotFound />} />
                            <Route path="/chatbot" element={<ChatbotPage />} />
                            <Route path="/ayuda" element={<Help />} />
                            <Route path='/admin-panel' element={<AdminSidebar/>} />
                            <Route path="/admin-panel/users" element={<UserManagement />} />
                            <Route path="/admin-panel/gestionAhorros" element={<GestionAhorros />} />
                            <Route path="/perfil/:userId" element={<PerfilCliente />} />
                            <Route path="/gestion-cuenta" element={<GestionCuenta />} />
                            <Route path="/pagos" element={<Pagos />} />
                            <Route path="/admin-dashboard/cuenta-destino" element={<AdminCuentaDestino />} />
                            <Route path="/admin-panel/gestion-pagos" element={<GestionPagos />} /> 
                            <Route path="/empleado-dashboard" element={<EmpleadoDashboard />} />
                            <Route path="/empleado/gestion-ahorros" element={<GestionAhorrosEmpleado />} />
                            <Route path="/aviso-de-privacidad" element={<PrivacyPolicy />} />
                            <Route path="/empleado/pagos" element={<PagosEmpleado />} />
                            <Route path="/directorio-usuarios" element={<UsersDirectory />} />
                            <Route path="/pago-exitoso" element={<PagoExitoso />} />
                            <Route path="/solicitar-prestamo" element={<SolicitudPrestamoForm />} />
                            <Route path="/admin-panel/solicitudes-prestamo" element={<SolicitudesPrestamoAdmin />} />
                            <Route path="/gamificacion" element={<GamificacionDashboard />} /> {/* 👈 nueva ruta */}
                            <Route path="/puntos" element={<PuntosDashboard />} />
                         </Routes>
                    </main>
                    <Footer />
                </div>
                </AxiosInterceptor>
            </Router>
        </AuthProvider>
    );
}

export default App;
