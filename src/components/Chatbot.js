import React, { useState, useRef, useEffect } from "react";
import "../styles/Chatbot.css"; // Importamos el archivo CSS
import API_URL from '../apiConfig';

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatboxRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessages = [...messages, { sender: "user", text: message }];
    setMessages(newMessages);

    try {
      const res = await fetch(`${API_URL}/api/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      let botResponse = data.response;
      if (typeof botResponse === "object") {
        botResponse = JSON.stringify(botResponse);
      }

      setMessages([...newMessages, { sender: "bot", text: botResponse }]);
    } catch (error) {
      console.error("Error en la conexión con el chatbot:", error);
      setMessages([...newMessages, { sender: "bot", text: "Error al conectar con el servidor." }]);
    }

    setMessage("");
  };

  useEffect(() => {
    chatboxRef.current?.scrollTo(0, chatboxRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="chatbot-container">
      <h2 className="chatbot-title">Asistente Virtual</h2>
      <div className="chatbox" ref={chatboxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-header">
              {msg.sender === "user" ? (
                <>
                  <span className="message-icon" style={{ backgroundColor: "#007bff" }}>👤</span>
                  <span>Tú</span>
                </>
              ) : (
                <>
                  <span className="message-icon" style={{ backgroundColor: "#555" }}>🤖</span>
                  <span>GIAS</span>
                </>
              )}
            </div>
            <p className="message-text">{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="chatbot-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="chatbot-input"
        />
        <button onClick={sendMessage} className="chatbot-button">Enviar</button>
      </div>
    </div>
  );
};

export default Chatbot;
