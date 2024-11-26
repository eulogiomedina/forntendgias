import React, { useState } from 'react';
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
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Header toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
                    <ToastContainer position="top-right" autoClose={5000} />
                    <main>
                        <Routes>
                            {/* Rutas públicas */}
                            <Route path="/" element={<Home />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/terminos/:id" element={<TermsDetail />} />
                            <Route path="/deslinde/:id" element={<DisclaimerDetail />} />

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
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
