import { useState } from "react";
import Chatbot from "../components/Chatbot";
import RobotIcon from "../assets/chatbot.jpg"; // Asegúrate de que la imagen esté en la carpeta 'assets'

const Help = () => {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="max-w-3xl mx-auto p-12 bg-white rounded-lg shadow-lg text-center font-sans mt-20 mb-12">
      <h1 className="text-2xl text-gray-800 mb-4">Centro de Ayuda</h1>
      <p className="text-lg text-gray-600 mb-6">
        ¿Tienes alguna duda? Aquí encontrarás respuestas a las preguntas más comunes.
      </p>

      <ul className="text-left space-y-4 mb-6">
        <li className="bg-gray-100 p-3 rounded-lg shadow-md border-l-4 border-blue-600">
          <strong>¿Cómo me registro?</strong> - Dirígete a la pestaña "Registro" y completa el formulario.
        </li>
        <li className="bg-gray-100 p-3 rounded-lg shadow-md border-l-4 border-blue-600">
          <strong>¿Cómo inicio sesión?</strong> - Accede a la pestaña "Login" e ingresa tus credenciales.
        </li>
        <li className="bg-gray-100 p-3 rounded-lg shadow-md border-l-4 border-blue-600">
          <strong>¿Cómo contactar soporte?</strong> - Puedes enviar un mensaje desde la sección de Contacto.
        </li>
      </ul>

      <hr className="border-t border-gray-300 mb-8" />

      <h2 className="text-xl text-blue-600 mb-12">Habla con nuestro chatbot</h2>

      <div className="relative inline-block cursor-pointer" onClick={toggleChat}>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md text-sm">
          ¡Hola! ¿Necesitas ayuda?
        </div>
        <img
          src={RobotIcon}
          alt="Chatbot"
          className="w-24 h-auto transition-transform duration-300 hover:scale-110"
        />
      </div>

      {showChat && <Chatbot />}
    </div>
  );
};

export default Help;
