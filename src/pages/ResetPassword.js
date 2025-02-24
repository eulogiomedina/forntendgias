import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../styles/ResetPassword.css';
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
        <h2>Restablecer Contraseña</h2>
        {message && (
          <p className={newPassword !== confirmPassword ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nueva Contraseña:</label>
            <div className="password-input-container" style={{ position: 'relative' }}>
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={newPassword}
                onChange={handlePasswordChange}
                required
              />
              <span
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
              </span>
            </div>
            <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
              Fortaleza: {passwordStrength}
            </div>
            {passwordSuggestions.length > 0 && (
              <ul className="password-suggestions">
                {passwordSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Restablecer Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
