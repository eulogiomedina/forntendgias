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
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2 className="text-xl font-semibold text-center">Restablecer Contraseña</h2>
        {message && (
          <p className={newPassword !== confirmPassword ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="text-lg font-medium text-gray-700">Nueva Contraseña:</label>
            <div className="password-input-container relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
              >
                <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
              </span>
            </div>
            <div className={`password-strength mt-2 text-sm ${passwordStrength === 'Débil' ? 'text-red-500' : passwordStrength === 'Medio' ? 'text-orange-500' : 'text-green-500'}`}>
              Fortaleza: {passwordStrength}
            </div>
            {passwordSuggestions.length > 0 && (
              <ul className="password-suggestions text-xs text-gray-600">
                {passwordSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label className="text-lg font-medium text-gray-700">Confirmar Contraseña:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <button type="submit" className="submit-btn w-full py-3 text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600">
            Restablecer Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
