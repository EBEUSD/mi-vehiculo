import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Vehiculos from "./pages/Vehiculos/Vehiculos";
import VehiculoDetalle from "./pages/VehiculoDetalle/VehiculoDetalle";
import Favoritos from "./pages/Favoritos/Favoritos";
import VendedorDashboard from "./pages/Vendedor/Dashboard/VendedorDashboard";
import PublicarCategoria from "./pages/Vendedor/PublicarCategoria/PublicarCategoria";
import PublicarVehiculo from "./pages/Vendedor/PublicarVehiculo/PublicarVehiculo";
import PublicarRepuesto from "./pages/Vendedor/PublicarRepuesto/PublicarRepuesto";
import PublicarAccesorio from "./pages/Vendedor/PublicarAccesorio/PublicarAccesorio";
import Login from "./pages/Login/Login";
import ComoFunciona from "./pages/ComoFunciona/ComoFunciona";
import Contacto from "./pages/Contacto/Contacto";
import Terminos from "./pages/Terminos/Terminos";
import FAQ from "./pages/FAQ/FAQ";
import Privacidad from "./pages/Privacidad/Privacidad";
import NotFound from "./pages/NotFound/NotFound";
import AdminLogin from "./pages/Admin/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const ok = sessionStorage.getItem("adminAuth") === "true";
  return ok ? children : <Navigate to="/admin/login" replace />;
}

const NO_FOOTER_PREFIXES = ["/login", "/admin"];

function AppRoutes() {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/vehiculo/:id" element={<VehiculoDetalle />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route
          path="/vendedor"
          element={
            <PrivateRoute>
              <VendedorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/publicar/nuevo"
          element={
            <PrivateRoute>
              <PublicarCategoria />
            </PrivateRoute>
          }
        />
        <Route
          path="/publicar/vehiculo"
          element={
            <PrivateRoute>
              <PublicarVehiculo />
            </PrivateRoute>
          }
        />
        <Route
          path="/publicar/repuesto"
          element={
            <PrivateRoute>
              <PublicarRepuesto />
            </PrivateRoute>
          }
        />
        <Route
          path="/publicar/accesorio"
          element={
            <PrivateRoute>
              <PublicarAccesorio />
            </PrivateRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
