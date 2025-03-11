import React, { useState, useRef, useEffect } from "react";
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
    <div className="max-w-3xl h-70 mx-auto p-8 bg-gradient-to-r from-blue-200 to-indigo-100 rounded-3xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Asistente Virtual</h2>
      <div className="bg-white border border-gray-200 p-4 rounded-xl h-96 overflow-auto flex flex-col gap-4" ref={chatboxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`max-w-4/5 p-4 rounded-lg flex flex-col gap-2 ${msg.sender === "user" ? "self-end bg-blue-600 text-white" : "self-start bg-indigo-100 text-gray-800"}`}>
            <div className="flex items-center gap-3 font-semibold">
              {msg.sender === "user" ? (
                <>
                  <span className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full">👤</span>
                  <span>Tú</span>
                </>
              ) : (
                <>
                  <span className="w-8 h-8 bg-gray-700 text-white flex items-center justify-center rounded-full">🤖</span>
                  <span>GIAS</span>
                </>
              )}
            </div>
            <p className="text-base">{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center mt-4 border-t border-gray-300 pt-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
        />
        <button onClick={sendMessage} className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-105 transition duration-300">
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
