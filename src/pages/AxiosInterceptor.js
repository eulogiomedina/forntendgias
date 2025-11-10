//import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosErrorHandling from './useAxiosErrorHandling';

const AxiosInterceptor = ({ children }) => {
    const navigate = useNavigate();
    useAxiosErrorHandling(navigate); // Configura el interceptor con navigate

    return children;
};

export default AxiosInterceptor;
