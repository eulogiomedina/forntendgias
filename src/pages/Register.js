import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import API_URL from '../apiConfig';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    password: '',
    telefono: '',
    estado: '',
    municipio: '',
    colonia: '',
  });

  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [colonias, setColonias] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordSuggestions, setPasswordSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [isPhoneValid, setIsPhoneValid] = useState(null);
  const [countryCode, setCountryCode] = useState('+52'); // Código de país por defecto (México)
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const commonPatterns = ['123', '123456', 'qwerty', 'password', 'abc123', '111111', 'aaa', 'qqq'];

  // Cargar estados al montar el componente
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch(`${API_URL}/api/estados`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Error al obtener los estados.');
        }

        const data = await response.json();
        setEstados(data.estados || []);
      } catch (error) {
        console.error('Error al cargar estados:', error);
        toast.error('No se pudieron cargar los estados.');
      }
    };

    fetchEstados();
  }, []);

  // Manejar cambios en estado para cargar municipios
  const handleEstadoChange = async (estado) => {
    setFormData({ ...formData, estado, municipio: '', colonia: '' });
    setMunicipios([]);
    setColonias([]);

    if (!estado) return;

    try {
      const response = await fetch(`${API_URL}/api/cupomex/municipios?estado=${encodeURIComponent(estado)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al obtener los municipios.');
      }

      const data = await response.json();
      setMunicipios(data.municipios || []);
    } catch (error) {
      console.error('Error al cargar municipios:', error);
      toast.error('No se pudieron cargar los municipios.');
    }
  };

  // Manejar cambios en municipio para cargar colonias
  const handleMunicipioChange = async (municipio) => {
    setFormData({ ...formData, municipio, colonia: '' });
    setColonias([]);

    if (!municipio) return;

    try {
      const response = await fetch(`${API_URL}/api/cupomex/colonias?municipio=${encodeURIComponent(municipio)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al obtener las colonias.');
      }

      const data = await response.json();
      setColonias(data.colonias || []);
    } catch (error) {
      console.error('Error al cargar colonias:', error);
      toast.error('No se pudieron cargar las colonias.');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    if (value.length > 16) {
      toast.error('La contraseña no debe tener más de 16 caracteres.');
      return;
    }

    setFormData({ ...formData, password: value });
    setPasswordStrength(checkPasswordStrength(value));
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    const suggestions = [];

    if (password.length >= 8) strength++;
    else suggestions.push('Debe tener al menos 8 caracteres');

    if (/[A-Z]/.test(password)) strength++;
    else suggestions.push('Debe incluir al menos una letra mayúscula');

    if (/[a-z]/.test(password)) strength++;
    else suggestions.push('Debe incluir al menos una letra minúscula');

    if (/[0-9]/.test(password)) strength++;
    else suggestions.push('Debe incluir al menos un número');

    if (/[\W]/.test(password)) strength++;
    else suggestions.push('Debe incluir al menos un carácter especial');

    if (commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))) {
      strength = 1;
      suggestions.push('No debe contener patrones secuenciales como "12345" o "qwerty"');
    }

    setPasswordSuggestions(suggestions);
    if (strength <= 2) return 'Débil';
    if (strength === 3) return 'Medio';
    if (strength >= 4) return 'Fuerte';
  };

  const validateEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/validate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.correo }),
      });

      const result = await response.json();

      if (result.valid) {
        setIsEmailValid(true);
        toast.success('El correo es válido.');
      } else {
        setIsEmailValid(false);
        toast.error(result.message || 'El correo no es válido.');
      }
    } catch (error) {
      setIsEmailValid(false);
      toast.error('Error al validar el correo.');
      console.error('Error al validar el correo:', error);
    }
  };

  const validatePhone = async () => {
    const fullPhoneNumber = `${countryCode}${formData.telefono}`;
    try {
      const response = await fetch(`${API_URL}/api/validate-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhoneNumber }),
      });

      const result = await response.json();

      if (result.valid) {
        setIsPhoneValid(true);
        toast.success('El número de teléfono es válido.');
      } else {
        setIsPhoneValid(false);
        toast.error(result.message || 'El número de teléfono no es válido.');
      }
    } catch (error) {
      setIsPhoneValid(false);
      toast.error('Error al validar el número de teléfono.');
      console.error('Error al validar el número:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailValid) {
      toast.error('No puedes registrarte con un correo inválido.');
      return;
    }

    if (!isPhoneValid) {
      toast.error('No puedes registrarte con un número de teléfono inválido.');
      return;
    }

    const fullPhoneNumber = `${countryCode}${formData.telefono}`;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, telefono: fullPhoneNumber }),
      });

      if (response.ok) {
        toast.success('Usuario registrado exitosamente. Verifica tu correo.');
        setFormData({
          nombre: '',
          apellidos: '',
          correo: '',
          password: '',
          telefono: '',
          estado: '',
          municipio: '',
          colonia: '',
        });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error('Error al registrar usuario.');
      }
    } catch (error) {
      toast.error('Error de red al registrar.');
      console.error('Error al registrar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-20 mb-12">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Registro</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Nombre y Apellidos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="nombre" className="text-lg font-medium text-gray-700">Nombre</label>
            <input
              id="nombre"
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellidos" className="text-lg font-medium text-gray-700">Apellidos</label>
            <input
              id="apellidos"
              type="text"
              placeholder="Apellidos"
              value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Correo */}
        <div className="form-group">
          <label htmlFor="correo" className="text-lg font-medium text-gray-700">Correo</label>
          <input
            id="correo"
            type="email"
            placeholder="Correo"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            onBlur={validateEmail}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {/* Contraseña */}
        <div className="form-group">
          <label htmlFor="password" className="text-lg font-medium text-gray-700">Contraseña</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={formData.password}
              onChange={handlePasswordChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <div className={`mt-2 text-sm ${passwordStrength === 'Débil' ? 'text-red-500' : passwordStrength === 'Medio' ? 'text-orange-500' : 'text-green-500'}`}>
            Fortaleza: {passwordStrength}
          </div>
          {passwordSuggestions.length > 0 && (
            <ul className="text-xs text-red-500">
              {passwordSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Teléfono */}
        <div className="form-group">
          <label htmlFor="telefono" className="text-lg font-medium text-gray-700">Número Telefónico</label>
          <div className="flex">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="p-3 border border-gray-300 rounded-md mr-2"
            >
              <option value="+52">🇲🇽 +52 (México)</option>
              <option value="+1">🇺🇸 +1 (Estados Unidos)</option>
              <option value="+1">🇨🇦 +1 (Canadá)</option>
            </select>
            <input
              type="tel"
              id="telefono"
              placeholder="Número Telefónico"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              onBlur={validatePhone}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Estado, Municipio, Colonia */}
        <div className="grid grid-cols-3 gap-4">
          <div className="form-group">
            <label htmlFor="estado" className="text-lg font-medium text-gray-700">Estado</label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => handleEstadoChange(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Selecciona un estado</option>
              {estados.map((estado, index) => (
                <option key={index} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="municipio" className="text-lg font-medium text-gray-700">Municipio</label>
            <select
              id="municipio"
              value={formData.municipio}
              onChange={(e) => handleMunicipioChange(e.target.value)}
              disabled={!formData.estado}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Selecciona un municipio</option>
              {municipios.map((municipio, index) => (
                <option key={index} value={municipio}>
                  {municipio}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="colonia" className="text-lg font-medium text-gray-700">Colonia</label>
            <select
              id="colonia"
              value={formData.colonia}
              onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
              disabled={!formData.municipio}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Selecciona una colonia</option>
              {colonias.map((colonia, index) => (
                <option key={index} value={colonia}>
                  {colonia}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón para registrar */}
        <div className="flex justify-center">
          <button type="submit" disabled={loading} className="w-1/2 py-3 text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600">
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
