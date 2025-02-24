import React, { useState } from 'react';
import '../styles/ForgotPassword.css';
import API_URL from '../apiConfig';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/api/password/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email }),
      });
      
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage('Error al enviar el correo.');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2>Recuperación de Contraseña</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Enviar Token</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
