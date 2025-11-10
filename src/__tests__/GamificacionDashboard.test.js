// ✅ Simulamos Axios antes de importarlo
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import GamificacionDashboard from "../pages/GamificacionDashboard";
import { AuthContext } from "../contexts/AuthContext";

jest.mock("axios");

const mockUser = { _id: "12345", nombre: "Usuario de prueba" };

describe("GamificacionDashboard", () => {
  test("debe renderizar correctamente y registrar visita", async () => {
    // Simulamos que la API responde correctamente
    axios.post.mockResolvedValue({ data: { mensaje: "Visita registrada" } });

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <GamificacionDashboard />
      </AuthContext.Provider>
    );

    // ✅ Verifica que el título está en pantalla
    expect(screen.getByText(/Panel de Gamificación GIAS/i)).toBeInTheDocument();

    // ✅ Espera que se llame a la API de registro de visita
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/registro-visita/12345")
      );
    });
  });
});
