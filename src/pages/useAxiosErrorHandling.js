import { useEffect } from 'react';
import axios from 'axios';

const useAxiosErrorHandling = (navigate) => {
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {

                // ✅ Si no hay conexión a internet (Network Error)
                if (!navigator.onLine || error.message === "Network Error") {
                    console.warn("⚠️ Sin conexión - NO redirijo a /error para evitar error 500 fake.");
                    return Promise.reject(error);
                }

                const statusCode = error.response?.status;

                // ✅ Solo manejar errores HTTP reales
                if (statusCode >= 400 && statusCode < 600) {
                    const currentPath = window.location.pathname;

                    // Solo guardar la URL si NO estamos ya en /error
                    if (currentPath !== '/error') {
                        sessionStorage.setItem('previousPath', currentPath);
                    }

                    navigate('/error', { state: { errorCode: statusCode } });
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate]);
};

export default useAxiosErrorHandling;
