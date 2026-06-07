import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Vehiculos from "./pages/Vehiculos/Vehiculos";
import VehiculoDetalle from "./pages/VehiculoDetalle/VehiculoDetalle";
import Favoritos from "./pages/Favoritos/Favoritos";
import VendedorDashboard from "./pages/Vendedor/Dashboard/VendedorDashboard";
import PublicarVehiculo from "./pages/Vendedor/PublicarVehiculo/PublicarVehiculo";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/vehiculos" element={<Vehiculos />} />
      <Route path="/vehiculo/:id" element={<VehiculoDetalle />} />
      <Route path="/favoritos" element={<Favoritos />} />
      <Route path="/vendedor" element={<VendedorDashboard />} />
      <Route path="/publicar/nuevo" element={<PublicarVehiculo />} />
    </Routes>
  );
}

export default App;