import React, { useState } from "react";
import Chatbot from "../components/Chatbot";
import "../styles/Help.css";
import RobotIcon from "../assets/chatbot.jpg"; // Asegúrate de que la imagen esté en la carpeta 'assets'

const Help = () => {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="help-container">
      <h1 className="help-title">Centro de Ayuda</h1>
      <p className="help-description">
        ¿Tienes alguna duda? Aquí encontrarás respuestas a las preguntas más comunes.
      </p>

      <ul className="help-list">
        <li><strong>¿Cómo me registro?</strong> - Dirígete a la pestaña "Registro" y completa el formulario.</li>
        <li><strong>¿Cómo inicio sesión?</strong> - Accede a la pestaña "Login" e ingresa tus credenciales.</li>
        <li><strong>¿Cómo contactar soporte?</strong> - Puedes enviar un mensaje desde la sección de Contacto.</li>
      </ul>

      <hr className="help-divider" />

      <h2 className="help-chat-title">Habla con nuestro chatbot</h2>

      {/* Imagen del robot con la burbuja encima */}
      <div className="chatbot-wrapper" onClick={toggleChat}>
        <div className="chatbot-bubble">¡Hola! ¿Necesitas ayuda?</div>
        <img src={RobotIcon} alt="Chatbot" className="chatbot-icon" />
      </div>

      {showChat && <Chatbot />}
    </div>
  );
};

export default Help;
