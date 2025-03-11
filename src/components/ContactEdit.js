import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_URL from '../apiConfig';

const ContactEdit = () => {
  const [contactData, setContactData] = useState({
    direccion: '',
    correo: '',
    telefono: '',
  });
  const [isLoading, setIsLoading] = useState(false); // Estado para el indicador de carga
  const [errors, setErrors] = useState({ correo: '', telefono: '' }); // Estado para errores en tiempo real

  // Validar correo y teléfono en tiempo real
  const validateField = (name, value) => {
    if (name === 'correo') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? '' : 'Correo inválido';
    }
    if (name === 'telefono') {
      const phoneRegex = /^[0-9]{10}$/; // Cambiar según el formato deseado
      return phoneRegex.test(value) ? '' : 'Número de teléfono inválido';
    }
    return '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Cargar los datos de contacto al iniciar el componente
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setIsLoading(true); // Mostrar indicador de carga
        const response = await fetch(`${API_URL}/api/contact/contact-info`);
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        const data = await response.json();
        setContactData(data);
      } catch (error) {
        console.error('Error al cargar los datos de contacto:', error);
        toast.error('Error al cargar los datos de contacto', { position: 'top-right' });
      } finally {
        setIsLoading(false); // Ocultar indicador de carga
      }
    };

    fetchContactData();
  }, []);

  // Manejar el cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData({ ...contactData, [name]: value });

    // Validar mientras escribe (opcional)
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(errors).some((error) => error)) {
      toast.error('Por favor, corrige los errores antes de guardar.', { position: 'top-right' });
      return;
    }

    try {
      setIsLoading(true); // Mostrar indicador de carga
      const response = await fetch(`${API_URL}/api/contact/contact-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        toast.success('Datos de contacto actualizados con éxito.', { position: 'top-right' });
      } else {
        toast.error('Error al actualizar los datos de contacto.', { position: 'top-right' });
      }
    } catch (error) {
      toast.error('Error de red al actualizar los datos.', { position: 'top-right' });
    } finally {
      setIsLoading(false); // Ocultar indicador de carga
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg mt-20">
      <ToastContainer />
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Modificar Datos de Contacto</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={contactData.direccion}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Correo Electrónico</label>
          <input
            type="email"
            name="correo"
            value={contactData.correo}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.correo && <span className="text-red-500 text-sm">{errors.correo}</span>}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Número de Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={contactData.telefono}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.telefono && <span className="text-red-500 text-sm">{errors.telefono}</span>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
        >
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};

export default ContactEdit;
