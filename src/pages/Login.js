import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; // Importar el contexto de autenticación
import { toast, ToastContainer } from 'react-toastify'; // Importar react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Importar el CSS de react-toastify
import imagen2 from '../assets/imagen2.png';
import imagen3 from '../assets/imagen3.jpg';
import API_URL from '../apiConfig';

const Login = () => {
  const [formData, setFormData] = useState({ correo: '', password: '' });
  const { login } = useContext(AuthContext); // Usar el método login del contexto
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [imagen2, imagen3];

  // Cambiar la imagen del carrusel cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval); // Limpiar el intervalo cuando el componente se desmonte
  }, []);

  // Cargar reCAPTCHA cuando el componente se monta
  useEffect(() => {
    const loadRecaptcha = () => {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };
    loadRecaptcha();
  }, []);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar si el elemento reCAPTCHA existe
    const recaptchaElement = document.querySelector('#g-recaptcha-response');
    const recaptchaResponse = recaptchaElement ? recaptchaElement.value : '';

    if (!recaptchaResponse) {
      toast.error('Por favor completa el reCAPTCHA', { position: 'top-right' });
      return;
    }

    try {
      // Enviar los datos al servidor para iniciar sesión
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken: recaptchaResponse }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Inicio de sesión exitoso.', { position: 'top-right' });

        // Actualizar el contexto de autenticación
        login(result.user);

        // Redirigir al dashboard según el rol
        setTimeout(() => {
          if (result.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (result.user.role === 'empleado') {
            navigate('/empleado-dashboard'); // 👈 AQUI
          } else {
            navigate('/dashboard');
          }

        }, 2000); // Esperar 2 segundos antes de redirigir
      } else {
        toast.error(result.message || 'Error al iniciar sesión.', { position: 'top-right' });
      }
    } catch (error) {
      toast.error('Error de red al iniciar sesión.', { position: 'top-right' });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 py-6">
      <ToastContainer /> {/* Contenedor de notificaciones */}
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
        {/* Carrusel personalizado con Tailwind */}
        <div className="w-full sm:w-1/2">
          <div className="relative h-full">
            <img
              src={images[currentImageIndex]}
              alt="Imagen de carrusel"
              className="w-full h-full object-cover transition duration-500"
            />
            
          </div>
        </div>

        {/* Formulario de login */}
        <div className="flex flex-col justify-center items-center p-6 sm:w-1/2 w-full">
          <h1 className="text-3xl font-bold text-blue-800 mb-6">Iniciar Sesión</h1>

          <form className="w-full" onSubmit={handleSubmit}>
            <div className="mb-4 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Correo</label>
              <input
                type="email"
                placeholder="Correo"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="mb-6 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* reCAPTCHA */}
            <div className="mb-4">
              <div className="g-recaptcha" data-sitekey="6Lc5pV0qAAAAAFyeHTlFcFJOlMWTXzQGwlbeA88_"></div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-4 text-sm">
            <a href="/forgot-password" className="text-blue-600 hover:underline">¿Olvidaste la contraseña?</a>
            <span className="mx-2">|</span>
            <a href="/register" className="text-blue-600 hover:underline">Registrarse</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
