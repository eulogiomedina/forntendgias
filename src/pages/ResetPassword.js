import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { checkPasswordStrength } from '../utils/PasswordUtils';
import API_URL from '../apiConfig';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordSuggestions, setPasswordSuggestions] = useState([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const { strength, suggestions } = checkPasswordStrength(value);
    setPasswordStrength(strength <= 2 ? 'Débil' : strength === 3 ? 'Medio' : 'Fuerte');
    setPasswordSuggestions(suggestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    const token = searchParams.get('token');

    try {
      const response = await fetch(`${API_URL}/api/password/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await response.json();
      setMessage(result.message);

      if (response.ok) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setMessage('Error al restablecer la contraseña.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-100 via-white to-teal-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Restablecer Contraseña
        </h2>

        {message && (
          <p
            className={`text-center text-sm font-medium mb-4 ${
              message.includes('no coinciden') || message.includes('Error')
                ? 'text-red-500'
                : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nueva contraseña */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                placeholder="Ingresa tu nueva contraseña"
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
              </span>
            </div>

            {passwordStrength && (
              <div
                className={`mt-2 text-sm font-medium ${
                  passwordStrength === 'Débil'
                    ? 'text-red-500'
                    : passwordStrength === 'Medio'
                    ? 'text-orange-500'
                    : 'text-green-600'
                }`}
              >
                Fortaleza: {passwordStrength}
              </div>
            )}

            {passwordSuggestions.length > 0 && (
              <ul className="mt-2 text-xs text-gray-500 list-disc list-inside space-y-1">
                {passwordSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              placeholder="Confirma tu nueva contraseña"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
          >
            Restablecer Contraseña
          </button>
        </form>

        
      </div>
    </div>
  );
};

export default ResetPassword;
