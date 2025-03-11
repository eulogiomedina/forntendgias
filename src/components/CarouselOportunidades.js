import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faHandHoldingUsd, faChartLine } from "@fortawesome/free-solid-svg-icons";

const CarouselOportunidades = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = [
    {
      icon: faCar,
      title: "Un vehículo para tu estilo de vida",
      description: "Tu auto o moto siempre seguros",
    },
    {
      icon: faHandHoldingUsd,
      title: "Dinero para cualquier imprevisto",
      description: "Apoyo inmediato en el momento indicado",
    },
    {
      icon: faChartLine,
      title: "Invierte y planifica tu futuro",
      description: "Conoce cómo ahorrar o invertir tu dinero.",
    },
  ];

  // Cambiar al siguiente item automáticamente cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 3000); // Intervalo de 3 segundos (3000 ms)

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []); // El efecto solo se ejecuta una vez, cuando el componente se monta

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  return (
    <div className="bg-blue-800 p-10 text-center rounded-lg">
      <h2 className="text-white mb-5 text-2xl">Oportunidades</h2>
      <div className="relative">
        {/* Carousel Items */}
        <div className="relative flex items-center justify-center h-72 text-white p-5">
          <div className="absolute inset-0 bg-blue-900 rounded-lg opacity-50"></div>
          <div className="z-10 flex flex-col items-center justify-center">
            <FontAwesomeIcon
              icon={items[currentIndex].icon}
              size="4x"
              className="text-yellow-400 mb-4"
            />
            <h3 className="text-xl mb-2">{items[currentIndex].title}</h3>
            <p className="text-lg">{items[currentIndex].description}</p>
          </div>
        </div>

        {/* Carousel Navigation */}
        <button
          onClick={goToPrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white bg-gray-600 p-2 rounded-full hover:bg-gray-500"
        >
          &#8592;
        </button>
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white bg-gray-600 p-2 rounded-full hover:bg-gray-500"
        >
          &#8594;
        </button>
      </div>

      {/* Optional: Indicators */}
      <div className="mt-4 flex justify-center space-x-2">
        {items.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentIndex === index ? "bg-yellow-400" : "bg-white"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default CarouselOportunidades;
