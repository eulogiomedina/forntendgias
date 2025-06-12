import GestionAhorrosBase from '../components/GestionAhorrosBase';
import AdminTandas from '../components/AdminTandas';

const GestionAhorros = () => {
  return (
    <div className="max-w-[900px] mx-auto mt-[110px] mb-5 p-5 bg-white shadow-md rounded-lg">

      {/* Gestión de Ahorros Base → para Admin */}
      <GestionAhorrosBase showEliminar={true} showFiltros={false} />

      {/* Gestión de Tandas del Administrador */}
      <div className="mt-10">
        <AdminTandas />
      </div>
    </div>
  );
};

export default GestionAhorros;
