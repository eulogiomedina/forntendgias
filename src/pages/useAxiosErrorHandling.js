import { useEffect } from 'react';
import axios from 'axios';

const useAxiosErrorHandling = (navigate) => {
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response, // Si la respuesta es exitosa, no hacer nada
            (error) => {
                const statusCode = error.response?.status || 500;
                const currentPath = window.location.pathname;

                if (statusCode >= 400 && statusCode < 600) {
                    // Solo guardar la URL si NO estamos en /error
                    if (currentPath !== '/error') {
                        console.log("Guardando la página anterior en sessionStorage:", currentPath);
                        sessionStorage.setItem('previousPath', currentPath);
                    } else {
                        console.log("No se guarda /error en sessionStorage para evitar sobrescribir la URL anterior.");
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
